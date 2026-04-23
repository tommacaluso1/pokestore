import { db } from "@repo/db";

export async function createReview(
  reviewerId: string,
  offerId: string,
  rating: number,
  comment?: string,
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const offer = await db.tradeOffer.findUnique({
    where: { id: offerId },
    include: { listing: { select: { sellerId: true } } },
  });

  if (!offer || offer.status !== "COMPLETED") {
    throw new Error("Can only review a completed trade or sale.");
  }

  const isOfferer = offer.offererId === reviewerId;
  const isSeller  = offer.listing.sellerId === reviewerId;
  if (!isOfferer && !isSeller) {
    throw new Error("You were not a party to this transaction.");
  }

  // Reviewer reviews the other party
  const sellerId = isOfferer ? offer.listing.sellerId : offer.offererId;

  return db.sellerReview.create({
    data: { sellerId, reviewerId, offerId, rating, comment: comment || undefined },
  });
}

export async function getSellerRating(sellerId: string) {
  const result = await db.sellerReview.aggregate({
    where: { sellerId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : null,
    count:   result._count.rating,
  };
}
