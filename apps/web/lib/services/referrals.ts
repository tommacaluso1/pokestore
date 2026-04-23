import { db } from "@repo/db";
import { awardXP } from "./xp";

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (user?.referralCode) return user.referralCode;

  let code: string;
  let attempts = 0;
  do {
    code = generateReferralCode();
    attempts++;
    if (attempts > 20) throw new Error("Could not generate unique referral code.");
  } while (await db.user.findUnique({ where: { referralCode: code }, select: { id: true } }));

  await db.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
}

// Called after a user's first completed trade or sale
export async function triggerReferralReward(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referredBy: true },
  });
  if (!user?.referredBy) return;

  // Find the referrer by referral code
  const referrer = await db.user.findUnique({
    where: { referralCode: user.referredBy },
    select: { id: true },
  });
  if (!referrer) return;

  // Award XP once per referred user (entityId = referred userId prevents double-award)
  await awardXP(referrer.id, 200, "REFERRAL_BONUS", `ref:${userId}`);
}
