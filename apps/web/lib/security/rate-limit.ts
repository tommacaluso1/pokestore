import { db } from "@repo/db";

// Simple DB-backed fixed-window rate limiter. Uses the RateLimitHit model
// (schema: key + createdAt). Counts hits in the last window; if under the
// limit, records a new hit and returns false (not limited). If over, returns
// true (caller should reject the request).
//
// Not as efficient as Redis, but zero new infra, already consistent with
// how `fileReport` rate-limits itself, and our expected traffic is tiny.

export async function checkAndRecordRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);

  const recent = await db.rateLimitHit.count({
    where: { key, createdAt: { gte: since } },
  });

  if (recent >= limit) return true;

  await db.rateLimitHit.create({ data: { key } });
  return false;
}

// Opportunistic best-effort cleanup: old rows have no value and can be dropped
// when we notice there are many. Called from high-traffic limiters.
export async function sweepExpiredRateLimits(olderThanMs: number) {
  const cutoff = new Date(Date.now() - olderThanMs);
  await db.rateLimitHit.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

export const RATE_LIMIT_KEYS = {
  login:         (ip: string)     => `login:${ip}`,
  register:      (ip: string)     => `register:${ip}`,
  createListing: (userId: string) => `listing:${userId}`,
  makeOffer:     (userId: string) => `offer:${userId}`,
};
