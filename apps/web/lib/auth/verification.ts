import crypto from "node:crypto";
import { db } from "@repo/db";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function hash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Generate a fresh verification token for `userId`. Deletes any older tokens
// for the same user (single-token-per-user invariant). Returns the RAW token
// (only place it ever exists in plaintext) — to be embedded in the email link.
export async function issueVerificationToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hash(raw);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.$transaction([
    db.verificationToken.deleteMany({ where: { userId } }),
    db.verificationToken.create({ data: { userId, tokenHash, expiresAt } }),
  ]);

  return raw;
}

export type VerificationResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "already" };

// Validate a raw token from a /verify URL. On success, marks the user as
// verified (idempotent) and deletes the token row.
export async function consumeVerificationToken(rawToken: string): Promise<VerificationResult> {
  if (!rawToken || rawToken.length !== TOKEN_BYTES * 2) {
    return { ok: false, reason: "invalid" };
  }

  const tokenHash = hash(rawToken);
  const row = await db.verificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerified: true } } },
  });

  if (!row) return { ok: false, reason: "invalid" };

  if (row.expiresAt < new Date()) {
    // Best-effort cleanup; ignore failures.
    await db.verificationToken.delete({ where: { id: row.id } }).catch(() => {});
    return { ok: false, reason: "expired" };
  }

  if (row.user.emailVerified) {
    await db.verificationToken.delete({ where: { id: row.id } }).catch(() => {});
    return { ok: false, reason: "already" };
  }

  await db.$transaction([
    db.user.update({
      where: { id: row.userId },
      data:  { emailVerified: new Date() },
    }),
    db.verificationToken.delete({ where: { id: row.id } }),
  ]);

  return { ok: true };
}

// Best-effort sweep — call from low-frequency code paths to clear stale rows.
export async function sweepExpiredVerificationTokens() {
  await db.verificationToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
