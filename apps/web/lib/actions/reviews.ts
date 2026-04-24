"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createReview } from "@/lib/services/reviews";
import { CreateReviewSchema, safeParse } from "@/lib/validation/schemas";

export type ReviewState = { error?: string; success?: boolean };

export async function createReviewAction(
  offerId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rawRating = formData.get("rating")?.toString();
  const parsed = safeParse(CreateReviewSchema, {
    rating:  rawRating ? parseInt(rawRating, 10) : undefined,
    comment: formData.get("comment")?.toString().trim() || undefined,
  });
  if (!parsed.ok) return { error: parsed.error };

  try {
    await createReview(session.user.id, offerId, parsed.data.rating, parsed.data.comment);
  } catch (e) {
    return { error: e instanceof Error && e.message.length < 200 ? e.message : "Something went wrong." };
  }

  revalidatePath("/marketplace/my-offers");
  revalidatePath("/marketplace/my-listings");
  return { success: true };
}
