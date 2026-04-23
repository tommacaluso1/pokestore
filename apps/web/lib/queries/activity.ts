import { db } from "@repo/db";

export type ActivityItem =
  | { type: "listing"; id: string; createdAt: string; cardName: string; cardImage: string | null; price: number | null; listingType: string; sellerId: string; sellerName: string | null }
  | { type: "trade";   id: string; createdAt: string; cardName: string; cardImage: string | null; offerType: string; sellerName: string | null; offererName: string | null };

export async function getActivityFeed(limit = 8): Promise<ActivityItem[]> {
  const [listings, trades] = await Promise.all([
    db.listing.findMany({
      where:   { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take:    limit,
      include: {
        seller:   { select: { id: true, name: true } },
        userCard: { include: { card: { select: { name: true, imageSmall: true } } } },
      },
    }),
    db.tradeOffer.findMany({
      where:   { status: "COMPLETED" },
      orderBy: { updatedAt: "desc" },
      take:    limit,
      include: {
        listing: {
          include: {
            seller:   { select: { name: true } },
            userCard: { include: { card: { select: { name: true, imageSmall: true } } } },
          },
        },
        offerer: { select: { name: true } },
      },
    }),
  ]);

  const items: ActivityItem[] = [
    ...listings.map((l): ActivityItem => ({
      type:        "listing",
      id:          l.id,
      createdAt:   l.createdAt.toISOString(),
      cardName:    l.userCard.card.name,
      cardImage:   l.userCard.card.imageSmall,
      price:       l.askingPrice ? Number(l.askingPrice) : null,
      listingType: l.listingType,
      sellerId:    l.sellerId,
      sellerName:  l.seller.name,
    })),
    ...trades.map((t): ActivityItem => ({
      type:        "trade",
      id:          t.id,
      createdAt:   t.updatedAt.toISOString(),
      cardName:    t.listing.userCard.card.name,
      cardImage:   t.listing.userCard.card.imageSmall,
      offerType:   t.offerType,
      sellerName:  t.listing.seller.name,
      offererName: t.offerer.name,
    })),
  ];

  // Sort by date descending, take top N
  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
