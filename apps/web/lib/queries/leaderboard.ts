import { db } from "@repo/db";

export async function getTopTraders(limit = 10) {
  // Users with the most completed trades (as offerer)
  const results = await db.tradeOffer.groupBy({
    by: ["offererId"],
    where: { status: "COMPLETED" },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const userIds = results.map((r) => r.offererId);
  const [users, xpData] = await Promise.all([
    db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    }),
    db.userXP.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, level: true, xp: true },
    }),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const xpByUser = new Map(xpData.map((x) => [x.userId, x]));

  return results.map((r) => {
    const user = userById.get(r.offererId)!;
    const xp   = xpByUser.get(r.offererId);
    return { user, trades: r._count.id, level: xp?.level ?? 1 };
  });
}

export async function getTopCollectors(limit = 10) {
  // Users with the most unique userCards
  const results = await db.userCard.groupBy({
    by: ["userId"],
    _sum: { quantity: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const userIds = results.map((r) => r.userId);
  const [users, xpData] = await Promise.all([
    db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    }),
    db.userXP.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, level: true },
    }),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const xpByUser = new Map(xpData.map((x) => [x.userId, x]));

  return results.map((r) => {
    const user = userById.get(r.userId)!;
    const xp   = xpByUser.get(r.userId);
    return { user, uniqueCards: r._count.id, totalCards: r._sum.quantity ?? 0, level: xp?.level ?? 1 };
  });
}
