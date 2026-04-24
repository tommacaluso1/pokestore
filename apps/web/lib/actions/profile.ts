"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateProfile, setShowcase, setFeaturedCards } from "@/lib/services/profile";

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const avatarId = formData.get("avatarId")?.toString();
  const themeId  = formData.get("themeId")?.toString();
  const bio      = formData.get("bio")?.toString().trim().slice(0, 160) || undefined;

  try {
    await updateProfile(userId, { avatarId, themeId, bio });
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath(`/profile`);
  revalidatePath(`/profile/${userId}`);
  return { success: true };
}

export async function setShowcaseAction(
  slots: { position: number; userBadgeId: string | null }[],
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  try {
    await setShowcase(userId, slots);
    revalidatePath(`/profile/${userId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function setFeaturedCardsAction(
  slots: { position: number; userCardId: string | null }[],
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;
  try {
    await setFeaturedCards(userId, slots);
    revalidatePath(`/profile/${userId}`);
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
