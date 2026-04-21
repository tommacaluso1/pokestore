import { db } from "@repo/db";

// ─── Store ────────────────────────────────────────────────────────────────────

export async function getAllProducts() {
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { set: { select: { name: true } } },
  });
}

export async function getAllOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
}

export async function getAllUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { userCards: true, listings: true, orders: true } },
    },
  });
}

// ─── TCG card database ────────────────────────────────────────────────────────

export async function getAllTcgSets() {
  return db.tcgSet.findMany({
    orderBy: { releaseDate: "desc" },
    include: {
      _count: { select: { cards: true } },
      storeSet: { select: { id: true, name: true, slug: true } },
    },
  });
}

// ─── Marketplace overview ─────────────────────────────────────────────────────

export async function getMarketplaceStats() {
  const [listings, offers, userCards] = await Promise.all([
    db.listing.groupBy({ by: ["status"], _count: true }),
    db.tradeOffer.groupBy({ by: ["status"], _count: true }),
    db.userCard.aggregate({ _sum: { quantity: true }, _count: true }),
  ]);
  return { listings, offers, userCards };
}
