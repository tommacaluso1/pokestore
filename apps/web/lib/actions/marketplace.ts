"use server";

import { db, CardCondition, ListingType, OfferType } from "@repo/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id as string;
}

// ── Listings ──────────────────────────────────────────────────────────────────

export type ListingState = { error?: string };

export async function createListing(
  _prev: ListingState,
  formData: FormData
): Promise<ListingState> {
  const userId = await requireAuth();

  const title       = formData.get("title")?.toString().trim();
  const cardName    = formData.get("cardName")?.toString().trim();
  const setName     = formData.get("setName")?.toString().trim() || undefined;
  const description = formData.get("description")?.toString().trim() || undefined;
  const imageUrl    = formData.get("imageUrl")?.toString().trim() || undefined;
  const condition   = formData.get("condition")?.toString() as CardCondition;
  const listingType = formData.get("listingType")?.toString() as ListingType;
  const rawPrice    = formData.get("askingPrice")?.toString().trim();

  if (!title || !cardName || !condition || !listingType) {
    return { error: "Title, card name, condition, and listing type are required." };
  }

  const askingPrice =
    listingType !== "TRADE" && rawPrice ? parseFloat(rawPrice) : undefined;

  if (listingType !== "TRADE" && !askingPrice) {
    return { error: "An asking price is required for sale listings." };
  }

  await db.listing.create({
    data: {
      sellerId: userId,
      title,
      cardName,
      setName,
      description,
      imageUrl,
      condition,
      listingType,
      askingPrice,
    },
  });

  revalidatePath("/marketplace");
  redirect("/marketplace/my-listings");
}

export async function deleteListing(listingId: string) {
  const userId = await requireAuth();
  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.sellerId !== userId) return;

  await db.listing.update({
    where: { id: listingId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/marketplace/my-listings");
}

// ── Offers ────────────────────────────────────────────────────────────────────

export type OfferState = { error?: string };

export async function makeOffer(
  listingId: string,
  _prev: OfferState,
  formData: FormData
): Promise<OfferState> {
  const offererId = await requireAuth();

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") {
    return { error: "This listing is no longer available." };
  }
  if (listing.sellerId === offererId) {
    return { error: "You cannot make an offer on your own listing." };
  }

  const offerType    = formData.get("offerType")?.toString() as OfferType;
  const rawCash      = formData.get("cashAmount")?.toString().trim();
  const offeredCards = formData.get("offeredCards")?.toString().trim() || undefined;
  const message      = formData.get("message")?.toString().trim() || undefined;

  const cashAmount =
    (offerType === "CASH" || offerType === "MIXED") && rawCash
      ? parseFloat(rawCash)
      : undefined;

  if (offerType === "CASH" && !cashAmount) {
    return { error: "Cash amount is required for a cash offer." };
  }
  if (offerType === "TRADE" && !offeredCards) {
    return { error: "Describe the cards you are offering." };
  }
  if (offerType === "MIXED" && (!cashAmount || !offeredCards)) {
    return { error: "Mixed offers require both a cash amount and card description." };
  }

  await db.tradeOffer.create({
    data: {
      listingId,
      offererId,
      offerType,
      cashAmount,
      offeredCards,
      message,
    },
  });

  revalidatePath(`/marketplace/${listingId}`);
  return {};
}

export async function respondToOffer(offerId: string, accept: boolean) {
  const userId = await requireAuth();

  const offer = await db.tradeOffer.findUnique({
    where: { id: offerId },
    include: { listing: true },
  });

  if (!offer || offer.listing.sellerId !== userId) return;
  if (offer.status !== "PENDING") return;

  if (accept) {
    await db.$transaction([
      db.tradeOffer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      }),
      // Reject all other pending offers on same listing
      db.tradeOffer.updateMany({
        where: { listingId: offer.listingId, id: { not: offerId }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
      db.listing.update({
        where: { id: offer.listingId },
        data: { status: "PENDING" },
      }),
    ]);
  } else {
    await db.tradeOffer.update({
      where: { id: offerId },
      data: { status: "REJECTED" },
    });
  }

  revalidatePath("/marketplace/my-listings");
}

export async function completeOffer(offerId: string) {
  const userId = await requireAuth();

  const offer = await db.tradeOffer.findUnique({
    where: { id: offerId },
    include: { listing: true },
  });

  if (!offer || offer.listing.sellerId !== userId) return;
  if (offer.status !== "ACCEPTED") return;

  await db.$transaction([
    db.tradeOffer.update({ where: { id: offerId }, data: { status: "COMPLETED" } }),
    db.listing.update({ where: { id: offer.listingId }, data: { status: "COMPLETED" } }),
  ]);

  revalidatePath("/marketplace/my-listings");
}

export async function cancelOffer(offerId: string) {
  const userId = await requireAuth();

  const offer = await db.tradeOffer.findUnique({ where: { id: offerId } });
  if (!offer || offer.offererId !== userId) return;
  if (offer.status !== "PENDING") return;

  await db.tradeOffer.update({ where: { id: offerId }, data: { status: "CANCELLED" } });
  revalidatePath("/marketplace/my-offers");
}
