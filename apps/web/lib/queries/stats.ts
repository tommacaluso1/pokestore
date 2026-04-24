import { db } from "@repo/db";

// Coarse-grained site stats for the hero ribbon. Cheap aggregate counts.
export async function getSiteStats() {
  const [listings, trades, collectors] = await Promise.all([
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.tradeOffer.count({ where: { status: "COMPLETED" } }),
    db.user.count(),
  ]);
  return { listings, trades, collectors };
}
