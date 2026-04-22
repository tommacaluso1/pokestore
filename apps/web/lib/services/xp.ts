import { db, XPReason } from "@repo/db";

// ─── XP formula ───────────────────────────────────────────────────────────────
// Total XP to reach level n = 100 * n²
// Level 1 = 0 XP, Level 2 = 400 XP, Level 10 = 10 000 XP

export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
}

export function xpForLevel(n: number): number {
  return 100 * n * n;
}

// XP remaining within current level, and total needed for next level
export function xpProgress(xp: number) {
  const level      = levelForXp(xp);
  const floor      = xpForLevel(level);
  const ceiling    = xpForLevel(level + 1);
  const progress   = xp - floor;
  const needed     = ceiling - floor;
  const pct        = Math.min(100, Math.round((progress / needed) * 100));
  return { level, xp, floor, ceiling, progress, needed, pct };
}

export type XPResult = {
  granted: boolean;
  leveled: boolean;
  newLevel: number;
  newXp:   number;
};

// Award XP idempotently. entityId + reason forms a unique key per user.
// Use entityId = "first" for one-time bonuses.
export async function awardXP(
  userId:   string,
  amount:   number,
  reason:   XPReason,
  entityId: string,
): Promise<XPResult> {
  try {
    await db.xPEvent.create({ data: { userId, amount, reason, entityId } });
  } catch {
    // Unique constraint — already granted
    const row = await db.userXP.findUnique({ where: { userId } });
    return { granted: false, leveled: false, newLevel: row?.level ?? 1, newXp: row?.xp ?? 0 };
  }

  const updated = await db.userXP.upsert({
    where:  { userId },
    update: { xp: { increment: amount } },
    create: { userId, xp: amount, level: 1 },
  });

  const newLevel = levelForXp(updated.xp);
  const leveled  = newLevel > updated.level;

  if (leveled) {
    await db.userXP.update({ where: { userId }, data: { level: newLevel } });
  }

  return { granted: true, leveled, newLevel, newXp: updated.xp };
}

export async function getXPInfo(userId: string) {
  const row = await db.userXP.findUnique({ where: { userId } });
  return xpProgress(row?.xp ?? 0);
}
