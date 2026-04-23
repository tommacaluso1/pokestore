"use server";

import { signIn } from "@/auth";
import { db } from "@repo/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

type AuthState = { error: string } | undefined;

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email already in use" };
  }

  const refCode = (formData.get("referralCode") as string | null)?.trim().toUpperCase() || undefined;

  // Validate referral code exists (but don't block registration if invalid)
  let referredBy: string | undefined;
  if (refCode) {
    const referrer = await db.user.findUnique({ where: { referralCode: refCode }, select: { id: true } });
    if (referrer) referredBy = refCode;
  }

  const hashed = await bcrypt.hash(password, 12);
  await db.user.create({ data: { email, name, password: hashed, referredBy } });
  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}
