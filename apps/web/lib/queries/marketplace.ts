import { db, ListingType, CardCondition, ListingStatus } from "@repo/db";

export type ListingFilters = {
  type?: ListingType;
  condition?: CardCondition;
  status?: ListingStatus;
  sellerId?: string;
  limit?: number;
};

export async function getListings({
  type,
  condition,
  status = "ACTIVE",
  sellerId,
  limit = 30,
}: ListingFilters = {}) {
  return db.listing.findMany({
    where: {
      ...(status && { status }),
      ...(type && { listingType: type }),
      ...(condition && { condition }),
      ...(sellerId && { sellerId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { seller: { select: { id: true, name: true, email: true } } },
  });
}

export async function getListingById(id: string) {
  return db.listing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      offers: {
        include: {
          offerer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getOffersByUser(userId: string) {
  return db.tradeOffer.findMany({
    where: { offererId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: { seller: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}
