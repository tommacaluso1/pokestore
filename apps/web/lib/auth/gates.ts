import { db } from "@repo/db";

/**
 * Throws if the user has not yet verified their email. Used to gate
 * social/marketplace actions (list, offer, accept, confirm, review, report).
 *
 * Browsing, cart, and sealed-pack checkout intentionally remain open —
 * only actions that affect other users require a verified email.
 */
export async function requireVerified(userId: string): Promise<void> {
  const u = await db.user.findUnique({
    where:  { id: userId },
    select: { emailVerified: true },
  });
  if (!u || !u.emailVerified) {
    throw new Error("Please verify your email before continuing.");
  }
}
