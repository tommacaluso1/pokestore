"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ListingType, OfferType } from "@repo/db";
import {
  createListing,
  cancelListing,
  makeOffer,
  respondToOffer,
  completeOffer,
  cancelOffer,
} from "@/lib/services/marketplace";
import { getListings, type ListingFilters, type ListingsPage } from "@/lib/queries/marketplace";

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id as string;
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export type ListingState = { error?: string };

export async function createListingAction(
  _prev: ListingState,
  formData: FormData
): Promise<ListingState> {
  const userId = await requireAuth();

  const userCardId  = formData.get("userCardId")?.toString();
  const rawQty      = formData.get("quantity")?.toString() ?? "1";
  const listingType = formData.get("listingType")?.toString() as ListingType;
  const rawPrice    = formData.get("askingPrice")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || undefined;

  if (!userCardId || !listingType) {
    return { error: "Card and listing type are required." };
  }

  const quantity = parseInt(rawQty, 10);
  if (isNaN(quantity) || quantity < 1) return { error: "Invalid quantity." };

  const askingPrice =
    listingType !== "TRADE" && rawPrice ? parseFloat(rawPrice) : undefined;

  try {
    await createListing(userId, { userCardId, quantity, listingType, askingPrice, description });
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath("/marketplace");
  redirect("/marketplace/my-listings");
}

export async function cancelListingAction(listingId: string) {
  const userId = await requireAuth();
  try {
    await cancelListing(userId, listingId);
  } catch {
    return;
  }
  revalidatePath("/marketplace/my-listings");
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export type OfferState = { error?: string; success?: boolean };

export async function makeOfferAction(
  listingId: string,
  _prev: OfferState,
  formData: FormData
): Promise<OfferState> {
  const offererId = await requireAuth();

  const offerType     = formData.get("offerType")?.toString() as OfferType;
  const rawCash       = formData.get("cashAmount")?.toString().trim();
  const offeredRaw    = formData.get("offeredCards")?.toString(); // JSON array of {userCardId, quantity}
  const message       = formData.get("message")?.toString().trim() || undefined;
  const cashAmount    = rawCash ? parseFloat(rawCash) : undefined;

  let offeredCards: { userCardId: string; quantity: number }[] | undefined;
  if (offeredRaw) {
    try {
      offeredCards = JSON.parse(offeredRaw);
    } catch {
      return { error: "Invalid offered cards format." };
    }
  }

  try {
    await makeOffer(offererId, listingId, { offerType, cashAmount, offeredCards, message });
  } catch (e: any) {
    return { error: e.message };
  }

  revalidatePath(`/marketplace/${listingId}`);
  return { success: true };
}

export async function respondToOfferAction(offerId: string, accept: boolean) {
  const userId = await requireAuth();
  try {
    await respondToOffer(userId, offerId, accept);
  } catch {
    return;
  }
  revalidatePath("/marketplace/my-listings");
}

export async function completeOfferAction(offerId: string) {
  const userId = await requireAuth();
  try {
    await completeOffer(userId, offerId);
  } catch {
    return;
  }
  revalidatePath("/marketplace/my-listings");
}

export async function cancelOfferAction(offerId: string) {
  const userId = await requireAuth();
  try {
    await cancelOffer(userId, offerId);
  } catch {
    return;
  }
  revalidatePath("/marketplace/my-offers");
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export async function fetchMoreListings(filters: ListingFilters): Promise<ListingsPage> {
  return getListings(filters);
}
