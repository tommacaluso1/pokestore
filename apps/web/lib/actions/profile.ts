"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateProfile, setShowcase, setFeaturedCards } from "@/lib/services/profile";
import {
  UpdateProfileSchema,
  ShowcaseSlotSchema,
  FeaturedSlotSchema,
  safeParse,
} from "@/lib/validation/schemas";
import { z } from "zod";

export type ProfileState = { error?: string; success?: boolean };

function safeError(e: unknown, fallback = "Something went wrong."): string {
  if (e instanceof Error && e.message && e.message.length < 200) return e.message;
  // eslint-disable-next-line no-console
  console.error("Unexpected error:", e);
  return fallback;
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const parsed = safeParse(UpdateProfileSchema, {
    avatarId: formData.get("avatarId")?.toString(),
    themeId:  formData.get("themeId")?.toString(),
    bio:      formData.get("bio")?.toString().trim() || undefined,
  });
  if (!parsed.ok) return { error: parsed.error };

  try {
    await updateProfile(userId, parsed.data);
  } catch (e) {
    return { error: safeError(e) };
  }

  revalidatePath(`/profile`);
  revalidatePath(`/profile/${userId}`);
  return { success: true };
}

const ShowcaseSlotsSchema = z.array(ShowcaseSlotSchema).max(3);

export async function setShowcaseAction(
  slots: { position: number; userBadgeId: string | null }[],
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const parsed = safeParse(ShowcaseSlotsSchema, slots);
  if (!parsed.ok) return { error: parsed.error };

  try {
    await setShowcase(userId, parsed.data);
    revalidatePath(`/profile/${userId}`);
    return { success: true };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const FeaturedSlotsSchema = z.array(FeaturedSlotSchema).max(3);

export async function setFeaturedCardsAction(
  slots: { position: number; userCardId: string | null }[],
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const parsed = safeParse(FeaturedSlotsSchema, slots);
  if (!parsed.ok) return { error: parsed.error };

  try {
    await setFeaturedCards(userId, parsed.data);
    revalidatePath(`/profile/${userId}`);
    return { success: true };
  } catch (e) {
    return { error: safeError(e) };
  }
}
