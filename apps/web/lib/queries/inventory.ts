import { db, CardCondition } from "@repo/db";

// ─── User inventory ───────────────────────────────────────────────────────────

export type InventoryFilters = {
  condition?: CardCondition;
  search?: string;
  tcgSetId?: string;
  foil?: boolean;
};

export async function getUserInventory(userId: string, filters: InventoryFilters = {}) {
  return db.userCard.findMany({
    where: {
      userId,
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.foil !== undefined && { foil: filters.foil }),
      ...(filters.tcgSetId && { card: { tcgSetId: filters.tcgSetId } }),
      ...(filters.search && {
        card: { name: { contains: filters.search, mode: "insensitive" } },
      }),
    },
    include: {
      card: {
        include: { tcgSet: { select: { id: true, name: true, series: true } } },
      },
      listings: {
        where: { status: "ACTIVE" },
        select: { id: true, quantity: true, listingType: true, askingPrice: true },
      },
    },
    orderBy: [{ card: { name: "asc" } }, { condition: "asc" }],
  });
}

export type UserInventoryItem = Awaited<ReturnType<typeof getUserInventory>>[number];

export async function getUserCard(userId: string, userCardId: string) {
  const uc = await db.userCard.findUnique({
    where: { id: userCardId },
    include: {
      card: { include: { tcgSet: true } },
      listings: { where: { status: "ACTIVE" }, select: { id: true, quantity: true } },
      offerItems: {
        include: {
          offer: { select: { id: true, status: true, listingId: true } },
        },
      },
    },
  });
  if (!uc || uc.userId !== userId) return null;
  return uc;
}

// Available quantity = total - sum of active listing quantities
export async function getAvailableQuantity(userCardId: string): Promise<number> {
  const [uc, agg] = await Promise.all([
    db.userCard.findUnique({ where: { id: userCardId }, select: { quantity: true } }),
    db.listing.aggregate({
      where: { userCardId, status: "ACTIVE" },
      _sum: { quantity: true },
    }),
  ]);
  if (!uc) return 0;
  return uc.quantity - (agg._sum.quantity ?? 0);
}

export async function getInventorySummary(userId: string) {
  const [totalCards, totalListings, uniqueCards] = await Promise.all([
    db.userCard.aggregate({ where: { userId }, _sum: { quantity: true } }),
    db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
    db.userCard.count({ where: { userId } }),
  ]);
  return {
    totalCopies: totalCards._sum.quantity ?? 0,
    uniqueEntries: uniqueCards,
    activeListings: totalListings,
  };
}

// ─── Card catalog ─────────────────────────────────────────────────────────────

export type CardFilters = {
  search?: string;
  tcgSetId?: string;
  rarity?: string;
  limit?: number;
};

export async function searchPokemonCards(filters: CardFilters = {}) {
  return db.pokemonCard.findMany({
    where: {
      ...(filters.tcgSetId && { tcgSetId: filters.tcgSetId }),
      ...(filters.rarity && { rarity: filters.rarity }),
      ...(filters.search && { name: { contains: filters.search, mode: "insensitive" } }),
    },
    include: {
      tcgSet: { select: { id: true, name: true, series: true } },
    },
    orderBy: [{ tcgSetId: "asc" }, { number: "asc" }],
    take: filters.limit ?? 50,
  });
}

export async function getPokemonCard(cardId: string) {
  return db.pokemonCard.findUnique({
    where: { id: cardId },
    include: { tcgSet: true },
  });
}

export async function getTcgSets() {
  return db.tcgSet.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      _count: { select: { cards: true } },
      storeSet: { select: { id: true, slug: true } },
    },
  });
}

export async function getCardRarities(tcgSetId?: string) {
  const cards = await db.pokemonCard.findMany({
    where: {
      ...(tcgSetId && { tcgSetId }),
      rarity: { not: null },
    },
    select: { rarity: true },
    distinct: ["rarity"],
    orderBy: { rarity: "asc" },
  });
  return cards.map((c) => c.rarity).filter(Boolean) as string[];
}
