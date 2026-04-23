import { db } from "@repo/db";
import { getXPInfo } from "@/lib/services/xp";
import { getSellerRating } from "@/lib/services/reviews";

// ─── Profile tab queries ──────────────────────────────────────────────────────

export async function getUserProfileCards(userId: string) {
  return db.userCard.findMany({
    where:   { userId },
    include: { card: { include: { tcgSet: { select: { name: true } } } } },
    orderBy: [{ card: { name: "asc" } }],
    take:    120,
  });
}

export async function getUserProfileListings(userId: string) {
  return db.listing.findMany({
    where:   { sellerId: userId, status: "ACTIVE" },
    include: {
      userCard: { include: { card: { include: { tcgSet: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
    take:    60,
  });
}

export async function getUserCompletedTrades(userId: string) {
  return db.tradeOffer.findMany({
    where: {
      status:    "COMPLETED",
      offerType: { in: ["TRADE", "MIXED"] },
      OR: [
        { offererId: userId },
        { listing: { sellerId: userId } },
      ],
    },
    include: {
      listing: {
        select: {
          sellerId: true,
          userCard: { include: { card: { select: { name: true, imageSmall: true } } } },
        },
      },
      offerer: { select: { id: true, name: true } },
      items: {
        include: { userCard: { include: { card: { select: { name: true, imageSmall: true } } } } },
      },
    },
    orderBy: { updatedAt: "desc" },
    take:    50,
  });
}

export async function getUserCompletedSales(userId: string) {
  return db.tradeOffer.findMany({
    where: {
      status:    "COMPLETED",
      offerType: { in: ["CASH", "MIXED"] },
      listing:   { sellerId: userId },
    },
    include: {
      listing: {
        select: {
          userCard: { include: { card: { select: { name: true, imageSmall: true } } } },
        },
      },
      offerer: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take:    50,
  });
}

// Full profile for a public user page
export async function getFullProfile(userId: string) {
  const [user, xpInfo, badges, profile, trades, sales, listings, cards, rating] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, riskScore: true },
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
    db.tradeOffer.count({
      where: {
        status:    "COMPLETED",
        offerType: { in: ["TRADE", "MIXED"] },
        OR: [{ offererId: userId }, { listing: { sellerId: userId } }],
      },
    }),
    db.tradeOffer.count({
      where: {
        status:    "COMPLETED",
        offerType: { in: ["CASH", "MIXED"] },
        listing:   { sellerId: userId },
      },
    }),
    db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
    db.userCard.count({ where: { userId } }),
    getSellerRating(userId),
  ]);

  return {
    user,
    xpInfo,
    badges,
    profile,
    rating,
    stats: { trades, sales, listings, cards },
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
