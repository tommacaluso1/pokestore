"use server";

import { signIn } from "@/auth";
import { db } from "@repo/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { RegisterSchema, LoginSchema, safeParse } from "@/lib/validation/schemas";
import { checkAndRecordRateLimit, RATE_LIMIT_KEYS } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

type AuthState = { error: string } | undefined;

// Constant-time dummy hash so register timing doesn't leak whether the email
// already exists. Pre-computed to avoid per-call bcrypt cost.
const DUMMY_HASH = "$2a$12$KQMm0NL6Yj0fqe6JeY0aP.1w6kq8ZpZcQqk0N7wqL4Zvd3cXnYxWS";

async function clientKey(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
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

  // Rate limit BEFORE DB access — 5 per hour per IP.
  const ip = await clientKey();
  const limited = await checkAndRecordRateLimit(RATE_LIMIT_KEYS.register(ip), 5, 60 * 60 * 1000);
  if (limited) {
    return { error: "Too many attempts. Please try again later." };
  }

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    // Spend equivalent bcrypt time so timing doesn't reveal existence.
    await bcrypt.compare(password, DUMMY_HASH);
    // Generic response: "registered" — same as the success path visually.
    // Do NOT sign them in.
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
  await db.user.create({ data: { email, name, password: hashed, referredBy } });
  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = safeParse(LoginSchema, {
    email:    formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });
  if (!parsed.ok) return { error: "Invalid email or password" };

  const ip = await clientKey();
  const limited = await checkAndRecordRateLimit(RATE_LIMIT_KEYS.login(ip), 5, 60 * 1000);
  if (limited) {
    return { error: "Too many attempts. Please try again in a minute." };
  }

  try {
    await signIn("credentials", {
      email:    parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}
