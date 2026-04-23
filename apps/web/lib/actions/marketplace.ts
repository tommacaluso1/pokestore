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
  confirmTrade,
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

  let askingPrice: number | undefined;
  if (listingType !== "TRADE") {
    if (!rawPrice) return { error: "An asking price is required for sale listings." };
    askingPrice = parseFloat(rawPrice);
    if (isNaN(askingPrice) || askingPrice <= 0) return { error: "Asking price must be greater than €0." };
    if (askingPrice > 99_999) return { error: "Asking price cannot exceed €99,999." };
    askingPrice = Math.round(askingPrice * 100) / 100; // normalise to 2dp
  }

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
  let cashAmount: number | undefined;
  if (rawCash) {
    const parsed = parseFloat(rawCash);
    if (!isNaN(parsed)) {
      if (parsed <= 0) return { error: "Cash amount must be greater than €0." };
      if (parsed > 99_999) return { error: "Cash amount cannot exceed €99,999." };
      cashAmount = Math.round(parsed * 100) / 100;
    }
  }

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

export async function confirmTradeAction(offerId: string) {
  const userId = await requireAuth();
  try {
    const result = await confirmTrade(userId, offerId);
    if (!result.pending) {
      revalidatePath("/marketplace/my-listings");
      revalidatePath("/marketplace/my-offers");
    } else {
      revalidatePath("/marketplace/my-listings");
      revalidatePath("/marketplace/my-offers");
    }
  } catch {
    return;
  }
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
