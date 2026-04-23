import { db } from "@repo/db";

export async function getTopTraders(limit = 10) {
  // Users with the most completed trades
  const results = await db.tradeOffer.groupBy({
    by: ["offererId"],
    where: { status: "COMPLETED" },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const userIds = results.map((r) => r.offererId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const xpData = await db.userXP.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, level: true, xp: true },
  });

  return results.map((r) => {
    const user = users.find((u) => u.id === r.offererId)!;
    const xp   = xpData.find((x) => x.userId === r.offererId);
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
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const xpData = await db.userXP.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, level: true },
  });

  return results.map((r) => {
    const user = users.find((u) => u.id === r.userId)!;
    const xp   = xpData.find((x) => x.userId === r.userId);
    return { user, uniqueCards: r._count.id, totalCards: r._sum.quantity ?? 0, level: xp?.level ?? 1 };
  });
}
