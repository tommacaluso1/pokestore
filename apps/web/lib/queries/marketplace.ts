import { db, ListingType, ListingStatus } from "@repo/db";

export type ListingFilters = {
  type?: ListingType;
  status?: ListingStatus;
  sellerId?: string;
  limit?: number;
};

const listingInclude = {
  seller: { select: { id: true, name: true, email: true } },
  userCard: {
    include: {
      card: { include: { tcgSet: true } },
    },
  },
} as const;

export async function getListings({
  type,
  status = "ACTIVE",
  sellerId,
  limit = 30,
}: ListingFilters = {}) {
  return db.listing.findMany({
    where: {
      ...(status && { status }),
      ...(type && { listingType: type }),
      ...(sellerId && { sellerId }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: listingInclude,
  });
}

export async function getListingById(id: string) {
  return db.listing.findUnique({
    where: { id },
    include: {
      ...listingInclude,
      offers: {
        include: {
          offerer: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              userCard: { include: { card: { include: { tcgSet: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getMyListingsWithOffers(sellerId: string) {
  return db.listing.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      seller: { select: { id: true, name: true, email: true } },
      userCard: {
        include: { card: { include: { tcgSet: true } } },
      },
      offers: {
        include: {
          offerer: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              userCard: { include: { card: { include: { tcgSet: true } } } },
            },
          },
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
        include: {
          seller: { select: { id: true, name: true, email: true } },
          userCard: { include: { card: { include: { tcgSet: true } } } },
        },
      },
      items: {
        include: {
          userCard: { include: { card: { include: { tcgSet: true } } } },
        },
      },
    },
  });
}
