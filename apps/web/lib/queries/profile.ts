import { db } from "@repo/db";
import { getXPInfo } from "@/lib/services/xp";

// Full profile for a public user page
export async function getFullProfile(userId: string) {
  const [user, xpInfo, badges, profile, stats] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    getXPInfo(userId),
    db.userBadge.findMany({
      where:   { userId },
      include: { badge: true },
      orderBy: { earnedAt: "asc" },
    }),
    db.userProfile.findUnique({
      where: { userId },
      include: {
        showcase: {
          include: { userBadge: { include: { badge: true } } },
          orderBy: { position: "asc" },
        },
        featured: {
          include: { userCard: { include: { card: { include: { tcgSet: true } } } } },
          orderBy: { position: "asc" },
        },
      },
    }),
    db.xPEvent.groupBy({
      by: ["reason"],
      where: { userId },
      _count: true,
    }),
  ]);

  const statMap = Object.fromEntries(stats.map((r) => [r.reason, r._count]));
  return {
    user,
    xpInfo,
    badges,
    profile,
    stats: {
      trades:   statMap["TRADE_COMPLETED"] ?? 0,
      sales:    statMap["SALE_COMPLETED"]  ?? 0,
      listings: statMap["LISTING_CREATED"] ?? 0,
      cards: await db.userCard.count({ where: { userId } }),
    },
  };
}

// All defined badges (for locked/unlocked display)
export async function getAllBadges() {
  return db.badge.findMany({ orderBy: [{ category: "asc" }, { tier: "asc" }] });
}

// User's earned badges + inventory for the edit page
export async function getEditData(userId: string) {
  const [profile, badges, inventory] = await Promise.all([
    db.userProfile.findUnique({
      where: { userId },
      include: {
        showcase: { orderBy: { position: "asc" } },
        featured: { orderBy: { position: "asc" } },
      },
    }),
    db.userBadge.findMany({
      where:   { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    db.userCard.findMany({
      where:   { userId },
      include: { card: { include: { tcgSet: { select: { name: true } } } } },
      orderBy: [{ card: { name: "asc" } }],
    }),
  ]);
  return { profile, badges, inventory };
}
