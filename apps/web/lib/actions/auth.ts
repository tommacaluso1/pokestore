"use server";

import { signIn, auth } from "@/auth";
import { db } from "@repo/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { RegisterSchema, LoginSchema, safeParse } from "@/lib/validation/schemas";
import { checkAndRecordRateLimit, RATE_LIMIT_KEYS } from "@/lib/security/rate-limit";
import { issueVerificationToken } from "@/lib/auth/verification";
import { sendEmail, buildVerificationEmail } from "@/lib/email/sender";

type AuthState = { error?: string; info?: string } | undefined;

// Constant-time dummy hash so register timing doesn't leak whether the email
// already exists. Pre-computed to avoid per-call bcrypt cost.
const DUMMY_HASH = "$2a$12$KQMm0NL6Yj0fqe6JeY0aP.1w6kq8ZpZcQqk0N7wqL4Zvd3cXnYxWS";

async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

async function appOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env) return env.replace(/\/+$/, "");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host  = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function issueAndSendVerification(userId: string, email: string, name: string) {
  try {
    const token  = await issueVerificationToken(userId);
    const origin = await appOrigin();
    const url    = `${origin}/verify?token=${encodeURIComponent(token)}`;
    const msg    = buildVerificationEmail({ recipientName: name || "trainer", verifyUrl: url });
    await sendEmail({ to: email, ...msg });
  } catch (e) {
    // Never block sign-in on email failure.
    // eslint-disable-next-line no-console
    console.error("Failed to issue/send verification email:", e);
  }
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = safeParse(RegisterSchema, {
    email:        formData.get("email")?.toString() ?? "",
    name:         formData.get("name")?.toString() ?? "",
    password:     formData.get("password")?.toString() ?? "",
    referralCode: formData.get("referralCode")?.toString() ?? "",
  });
  if (!parsed.ok) return { error: parsed.error };

  const { email, name, password, referralCode } = parsed.data;

  const ip = await clientIp();
  const limited = await checkAndRecordRateLimit(RATE_LIMIT_KEYS.register(ip), 5, 60 * 60 * 1000);
  if (limited) {
    return { error: "Too many attempts. Please try again later." };
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    // Spend equivalent bcrypt time so timing doesn't reveal existence.
    await bcrypt.compare(password, DUMMY_HASH);
    return { error: "If the address is available, your account will be created. Please check your email or try signing in." };
  }

  let referredBy: string | undefined;
  if (referralCode) {
    const referrer = await db.user.findUnique({
      where: { referralCode },
      select: { id: true },
    });
    if (referrer) referredBy = referralCode;
  }

  const hashed = await bcrypt.hash(password, 12);
  const created = await db.user.create({
    data: { email, name, password: hashed, referredBy },
    select: { id: true },
  });

  await issueAndSendVerification(created.id, email, name);
  revalidatePath("/", "layout");

  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = safeParse(LoginSchema, {
    email:    formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.ok) return { error: "Invalid email or password" };

  const ip = await clientIp();
  const limited = await checkAndRecordRateLimit(RATE_LIMIT_KEYS.login(ip), 5, 60 * 1000);
  if (limited) {
    return { error: "Too many attempts. Please try again in a minute." };
  }

  const callbackUrl = formData.get("callbackUrl")?.toString();
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  revalidatePath("/", "layout");

  try {
    await signIn("credentials", {
      email:    parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallback,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

// Resend the current user's verification email. Rate-limited 3/hour/user.
export async function resendVerificationAction(): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };

  const userId = session.user.id;
  const limited = await checkAndRecordRateLimit(`resend-verify:${userId}`, 3, 60 * 60 * 1000);
  if (limited) return { ok: false, error: "Please wait before requesting another email." };

  const user = await db.user.findUnique({
    where:  { id: userId },
    select: { email: true, name: true, emailVerified: true },
  });
  if (!user) return { ok: false, error: "Account not found." };
  if (user.emailVerified) return { ok: true };

  await issueAndSendVerification(userId, user.email, user.name ?? "trainer");
  return { ok: true };
}
