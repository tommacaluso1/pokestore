import { db } from "@repo/db";

type Stats = {
  completedTrades: number;
  completedSales:  number;
  uniqueCards:     number;
  foilCards:       number;
  totalListings:   number;
  activeListings:  number;
  level:           number;
  totalSpend:      number;
};

type Condition = (s: Stats) => boolean;

// Badge conditions keyed by badge ID (matches Badge.id seeds)
const CONDITIONS: Record<string, Condition> = {
  first_trade:       (s) => s.completedTrades >= 1,
  dealer:            (s) => s.completedTrades >= 10,
  legendary_trader:  (s) => s.completedTrades >= 50,
  first_sale:        (s) => s.completedSales  >= 1,
  merchant:          (s) => s.completedSales  >= 10,
  poke_tycoon:       (s) => s.completedSales  >= 50,
  gotta_catch:       (s) => s.uniqueCards     >= 10,
  true_collector:    (s) => s.uniqueCards     >= 50,
  master_collector:  (s) => s.uniqueCards     >= 200,
  foil_hunter:       (s) => s.foilCards       >= 10,
  open_for_business: (s) => s.totalListings   >= 1,
  active_seller:     (s) => s.activeListings  >= 5,
  rookie:            (s) => s.level           >= 5,
  veteran:           (s) => s.level           >= 15,
  champion:          (s) => s.level           >= 30,
  big_spender:       (s) => s.totalSpend      >= 100,
};

async function getStats(userId: string): Promise<Stats> {
  const [trades, sales, uniqueCards, foilCards, totalListings, activeListings, xpRow, spend] =
    await Promise.all([
      db.xPEvent.count({ where: { userId, reason: "TRADE_COMPLETED" } }),
      db.xPEvent.count({ where: { userId, reason: "SALE_COMPLETED" } }),
      db.userCard.count({ where: { userId } }),
      db.userCard.count({ where: { userId, foil: true } }),
      db.xPEvent.count({ where: { userId, reason: "LISTING_CREATED" } }),
      db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
      db.userXP.findUnique({ where: { userId } }),
      db.order.aggregate({ where: { userId, status: "PAID" }, _sum: { total: true } }),
    ]);
  return {
    completedTrades: trades,
    completedSales:  sales,
    uniqueCards,
    foilCards,
    totalListings,
    activeListings,
    level:      xpRow?.level ?? 1,
    totalSpend: Number(spend._sum.total ?? 0),
  };
}

// Evaluate all conditions for a user and grant any newly-unlocked badges.
// Returns array of newly granted badge IDs.
export async function evaluateBadges(userId: string): Promise<string[]> {
  const [stats, earned] = await Promise.all([
    getStats(userId),
    db.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);

  const earnedSet = new Set(earned.map((b) => b.badgeId));
  const toGrant = Object.entries(CONDITIONS)
    .filter(([id, cond]) => !earnedSet.has(id) && cond(stats))
    .map(([id]) => id);

  if (toGrant.length > 0) {
    await db.userBadge.createMany({
      data: toGrant.map((badgeId) => ({ userId, badgeId })),
      skipDuplicates: true,
    });
  }

  return toGrant;
}
