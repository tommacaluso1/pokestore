import { db, ListingType, ListingStatus, CardCondition } from "@repo/db";

// ─── Serializable shape (safe for server→client transfer) ─────────────────────

export type ListingCard = {
  id: string; name: string; number: string; rarity: string | null;
  imageSmall: string | null; imageLarge: string | null;
  tcgSet: { id: string; name: string; series: string };
};

export type ListingUserCard = {
  id: string; condition: string; quantity: number; foil: boolean;
  card: ListingCard;
};

export type ListingRow = {
  id: string;
  listingType: string;
  askingPrice: number | null;
  status: string;
  description: string | null;
  quantity: number;
  createdAt: string;
  seller: { id: string; name: string | null; email: string };
  userCard: ListingUserCard;
};

export type ListingsPage = {
  listings: ListingRow[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
};

// ─── Filters ──────────────────────────────────────────────────────────────────

export type SortOption = "newest" | "price_asc" | "price_desc";

export type ListingFilters = {
  type?: ListingType;
  q?: string;
  setId?: string;
  condition?: CardCondition;
  status?: ListingStatus;
  sellerId?: string;
  sort?: SortOption;
  cursor?: string;        // numeric offset stringified
  limit?: number;
};

const listingInclude = {
  seller:   { select: { id: true, name: true, email: true } },
  userCard: {
    include: {
      card: {
        include: {
          tcgSet: { select: { id: true, name: true, series: true } },
        },
      },
    },
  },
} as const;

function toRow(l: Awaited<ReturnType<typeof db.listing.findMany<{ include: typeof listingInclude }>>>[number]): ListingRow {
  return {
    id:          l.id,
    listingType: l.listingType,
    askingPrice: l.askingPrice ? Number(l.askingPrice) : null,
    status:      l.status,
    description: l.description,
    quantity:    l.quantity,
    createdAt:   l.createdAt.toISOString(),
    seller:      l.seller,
    userCard:    l.userCard,
  };
}

// ─── Paginated listings query ─────────────────────────────────────────────────

export async function getListings(filters: ListingFilters = {}): Promise<ListingsPage> {
  const limit = Math.min(filters.limit ?? 50, 100);
  const skip  = filters.cursor ? parseInt(filters.cursor, 10) : 0;

  const hasCardFilter = !!(filters.q || filters.setId || filters.condition);

  const where = {
    status:      (filters.status ?? "ACTIVE") as ListingStatus,
    ...(filters.type     && { listingType: filters.type }),
    ...(filters.sellerId && { sellerId:    filters.sellerId }),
    ...(hasCardFilter && {
      userCard: {
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.q || filters.setId ? {
          card: {
            ...(filters.setId && { tcgSetId: filters.setId }),
            ...(filters.q     && { name: { contains: filters.q, mode: "insensitive" as const } }),
          },
        } : {}),
      },
    }),
  };

  const orderBy: object =
    filters.sort === "price_asc"  ? [{ askingPrice: "asc"  }, { createdAt: "desc" }] :
    filters.sort === "price_desc" ? [{ askingPrice: "desc" }, { createdAt: "desc" }] :
                                     { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    db.listing.findMany({
      where,
      include:  listingInclude,
      orderBy,
      skip,
      take:     limit + 1,
    }),
    db.listing.count({ where }),
  ]);

  const hasMore    = rows.length > limit;
  const page       = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? String(skip + limit) : null;

  return { listings: page.map(toRow), nextCursor, hasMore, total };
}

// ─── Single listing ───────────────────────────────────────────────────────────

export async function getListingById(id: string) {
  return db.listing.findUnique({
    where:   { id },
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

// ─── My listings (seller view) ────────────────────────────────────────────────

export async function getMyListingsWithOffers(sellerId: string) {
  return db.listing.findMany({
    where:   { sellerId },
    orderBy: { createdAt: "desc" },
    take:    100,
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

// ─── My offers ────────────────────────────────────────────────────────────────

export async function getOffersByUser(userId: string) {
  return db.tradeOffer.findMany({
    where:   { offererId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          seller:   { select: { id: true, name: true, email: true } },
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

// ─── Available TCG sets (for filter dropdown) ─────────────────────────────────

export async function getMarketplaceSets() {
  const sets = await db.tcgSet.findMany({
    where: {
      cards: {
        some: {
          userCards: {
            some: {
              listings: { some: { status: "ACTIVE" } },
            },
          },
        },
      },
    },
    select: { id: true, name: true, series: true },
    orderBy: { releaseDate: "desc" },
  });
  return sets;
}
