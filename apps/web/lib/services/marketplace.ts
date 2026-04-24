import { db, ListingType, OfferType } from "@repo/db";
import { getAvailableQuantity } from "./inventory";
import { awardXP } from "./xp";
import { evaluateBadges } from "./badges";
import { triggerReferralReward } from "./referrals";

// ─── Listings ─────────────────────────────────────────────────────────────────

export type CreateListingInput = {
  userCardId: string;
  quantity: number;
  listingType: ListingType;
  askingPrice?: number;
  description?: string;
};

export async function createListing(userId: string, input: CreateListingInput) {
  const userCard = await db.userCard.findUnique({ where: { id: input.userCardId } });
  if (!userCard || userCard.userId !== userId) {
    throw new Error("Card not found in your inventory.");
  }

  const available = await getAvailableQuantity(input.userCardId);
  if (available < input.quantity) {
    throw new Error(`Only ${available} cop${available === 1 ? "y" : "ies"} available to list.`);
  }

  if (input.listingType !== "TRADE" && !input.askingPrice) {
    throw new Error("An asking price is required for sale listings.");
  }

  const listing = await db.listing.create({
    data: {
      sellerId: userId,
      userCardId: input.userCardId,
      quantity: input.quantity,
      listingType: input.listingType,
      askingPrice: input.askingPrice,
      description: input.description,
    },
    include: {
      userCard: { include: { card: { include: { tcgSet: true } } } },
    },
  });

  // XP: listing created (10 XP) + one-time first-listing bonus (50 XP)
  await awardXP(userId, 10, "LISTING_CREATED", listing.id);
  await awardXP(userId, 50, "BONUS_FIRST_LISTING", "first");
  // Fire-and-forget badge evaluation
  evaluateBadges(userId).catch(() => {});

  return listing;
}

export async function cancelListing(userId: string, listingId: string) {
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== userId) throw new Error("Listing not found.");
  if (listing.status !== "ACTIVE") throw new Error("Listing is not active.");

  await db.$transaction([
    db.tradeOffer.updateMany({
      where: { listingId, status: "PENDING" },
      data: { status: "CANCELLED" },
    }),
    db.listing.update({
      where: { id: listingId },
      data: { status: "CANCELLED" },
    }),
  ]);
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export type OfferedCard = { userCardId: string; quantity: number };

export type MakeOfferInput = {
  offerType: OfferType;
  cashAmount?: number;
  offeredCards?: OfferedCard[];
  message?: string;
};

export async function makeOffer(
  offererId: string,
  listingId: string,
  input: MakeOfferInput
) {
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") throw new Error("Listing is unavailable.");
  if (listing.sellerId === offererId) throw new Error("Cannot offer on your own listing.");

  const needsCash = input.offerType === "CASH" || input.offerType === "MIXED";
  if (needsCash && (!input.cashAmount || input.cashAmount < 0.01)) {
    throw new Error("A cash amount of at least $0.01 is required.");
  }
  if (input.offerType === "TRADE" && !input.offeredCards?.length) {
    throw new Error("Must offer at least one card for a trade.");
  }
  if (input.offerType === "MIXED" && !input.offeredCards?.length) {
    throw new Error("Mixed offers require both a cash amount and offered cards.");
  }

  // Validate offered cards ownership and available quantity (parallel reads)
  await Promise.all(
    (input.offeredCards ?? []).map(async ({ userCardId, quantity }) => {
      if (quantity < 1) throw new Error(`Invalid quantity for card ${userCardId}.`);
      const [uc, available] = await Promise.all([
        db.userCard.findUnique({ where: { id: userCardId } }),
        getAvailableQuantity(userCardId),
      ]);
      if (!uc || uc.userId !== offererId) throw new Error(`Invalid offered card: ${userCardId}`);
      if (available < quantity) throw new Error(`Insufficient quantity for card ${userCardId}.`);
    }),
  );

  const offer = await db.tradeOffer.create({
    data: {
      listingId,
      offererId,
      offerType: input.offerType,
      cashAmount: input.cashAmount,
      message: input.message,
      ...(input.offeredCards?.length && {
        items: { create: input.offeredCards.map(({ userCardId, quantity }) => ({ userCardId, quantity })) },
      }),
    },
    include: { items: { include: { userCard: { include: { card: true } } } } },
  });

  // XP: offer sent (5 XP)
  await awardXP(offererId, 5, "OFFER_SENT", offer.id);
  evaluateBadges(offererId).catch(() => {});

  return offer;
}

export async function respondToOffer(userId: string, offerId: string, accept: boolean) {
  const offer = await db.tradeOffer.findUnique({
    where: { id: offerId },
    include: { listing: true },
  });
  if (!offer || offer.listing.sellerId !== userId) throw new Error("Offer not found.");
  if (offer.status !== "PENDING") throw new Error("Offer is not pending.");

  if (!accept) {
    return db.tradeOffer.update({ where: { id: offerId }, data: { status: "REJECTED" } });
  }

  await db.$transaction([
    db.tradeOffer.update({ where: { id: offerId }, data: { status: "ACCEPTED" } }),
    db.tradeOffer.updateMany({
      where: { listingId: offer.listingId, id: { not: offerId }, status: "PENDING" },
      data: { status: "REJECTED" },
    }),
    db.listing.update({ where: { id: offer.listingId }, data: { status: "PENDING" } }),
  ]);
}

// ─── Dual-confirmation trade completion ───────────────────────────────────────
// Either party calls this. Trade executes only when both have confirmed.

export async function confirmTrade(userId: string, offerId: string): Promise<{ pending: boolean }> {
  const offer = await db.tradeOffer.findUnique({
    where: { id: offerId },
    include: { listing: true, items: true },
  });
  if (!offer) throw new Error("Offer not found.");
  if (offer.status !== "ACCEPTED") throw new Error("Offer has not been accepted.");

  const isSeller  = offer.listing.sellerId === userId;
  const isOfferer = offer.offererId === userId;
  if (!isSeller && !isOfferer) throw new Error("Not a party to this offer.");

  const newSellerConfirmed  = isSeller  ? true : offer.sellerConfirmed;
  const newOffererConfirmed = isOfferer ? true : offer.offererConfirmed;

  if (!newSellerConfirmed || !newOffererConfirmed) {
    await db.tradeOffer.update({
      where: { id: offerId },
      data: { sellerConfirmed: newSellerConfirmed, offererConfirmed: newOffererConfirmed },
    });
    return { pending: true };
  }

  // Defense-in-depth: reject self-trade even if it slipped past makeOffer (e.g. admin edit).
  if (offer.offererId === offer.listing.sellerId) {
    throw new Error("Cannot trade with yourself.");
  }

  // Both confirmed — atomically execute the trade
  await db.$transaction(async (tx) => {
    // Re-read inside tx to prevent concurrent double-execution
    const fresh = await tx.tradeOffer.findUnique({ where: { id: offerId }, select: { status: true } });
    if (fresh?.status !== "ACCEPTED") throw new Error("Offer is no longer in accepted state.");

    const listed = await tx.userCard.findUnique({ where: { id: offer.listing.userCardId } });
    if (!listed || listed.quantity < offer.listing.quantity) {
      throw new Error("The listed card is no longer available in sufficient quantity.");
    }

    if (listed.quantity === offer.listing.quantity) {
      await tx.userCard.delete({ where: { id: listed.id } });
    } else {
      await tx.userCard.update({
        where: { id: listed.id },
        data: { quantity: { decrement: offer.listing.quantity } },
      });
    }

    await tx.userCard.upsert({
      where: {
        userId_cardId_condition_foil: {
          userId: offer.offererId, cardId: listed.cardId,
          condition: listed.condition, foil: listed.foil,
        },
      },
      update: { quantity: { increment: offer.listing.quantity } },
      create: {
        userId: offer.offererId, cardId: listed.cardId,
        condition: listed.condition, quantity: offer.listing.quantity, foil: listed.foil,
      },
    });

    for (const item of offer.items) {
      const uc = await tx.userCard.findUnique({ where: { id: item.userCardId } });
      if (!uc || uc.quantity < item.quantity) {
        throw new Error("An offered card is no longer available in sufficient quantity.");
      }
      if (uc.quantity === item.quantity) {
        await tx.userCard.delete({ where: { id: item.userCardId } });
      } else {
        await tx.userCard.update({
          where: { id: item.userCardId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
      await tx.userCard.upsert({
        where: {
          userId_cardId_condition_foil: {
            userId: offer.listing.sellerId, cardId: uc.cardId,
            condition: uc.condition, foil: uc.foil,
          },
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          userId: offer.listing.sellerId, cardId: uc.cardId,
          condition: uc.condition, quantity: item.quantity, foil: uc.foil,
        },
      });
    }

    await tx.tradeOffer.update({
      where: { id: offerId },
      data: { status: "COMPLETED", sellerConfirmed: true, offererConfirmed: true },
    });
    await tx.listing.update({ where: { id: offer.listingId }, data: { status: "COMPLETED" } });
  });

  const offererId = offer.offererId;
  const sellerId  = offer.listing.sellerId;
  const isCash    = offer.offerType === "CASH" || offer.offerType === "MIXED";

  await Promise.all([
    awardXP(offererId, 100, "TRADE_COMPLETED", `${offerId}:${offererId}`),
    awardXP(offererId, 100, "BONUS_FIRST_TRADE", "first"),
    isCash
      ? Promise.all([awardXP(sellerId, 75, "SALE_COMPLETED", offerId), awardXP(sellerId, 75, "BONUS_FIRST_SALE", "first")])
      : Promise.all([awardXP(sellerId, 100, "TRADE_COMPLETED", `${offerId}:${sellerId}`), awardXP(sellerId, 100, "BONUS_FIRST_TRADE", "first")]),
  ]);
  await awardXP(offererId, 5, "CARD_ACQUIRED", `${offer.listing.userCardId}:${offerId}`);
  for (const item of offer.items) {
    await awardXP(sellerId, 5, "CARD_ACQUIRED", `${item.userCardId}:${offerId}`);
  }
  await Promise.all([evaluateBadges(offererId), evaluateBadges(sellerId)]).catch(() => {});

  // Trigger referral reward for both parties (idempotent via XP unique constraint)
  triggerReferralReward(offererId).catch(() => {});
  triggerReferralReward(sellerId).catch(() => {});

  return { pending: false };
}

export async function cancelOffer(userId: string, offerId: string) {
  const offer = await db.tradeOffer.findUnique({ where: { id: offerId } });
  if (!offer || offer.offererId !== userId) throw new Error("Offer not found.");
  if (offer.status !== "PENDING") throw new Error("Offer is not pending.");

  await db.tradeOffer.update({ where: { id: offerId }, data: { status: "CANCELLED" } });
}
