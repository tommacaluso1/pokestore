"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createReview } from "@/lib/services/reviews";

export type ReviewState = { error?: string; success?: boolean };

export async function createReviewAction(
  offerId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rawRating  = formData.get("rating")?.toString();
  const comment    = formData.get("comment")?.toString().trim() || undefined;
  const rating     = parseInt(rawRating ?? "", 10);

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Select a rating between 1 and 5." };
  }

  try {
    await createReview(session.user.id as string, offerId, rating, comment);
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath("/marketplace/my-offers");
  revalidatePath("/marketplace/my-listings");
  return { success: true };
}
