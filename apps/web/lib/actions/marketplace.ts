"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createListing,
  cancelListing,
  makeOffer,
  respondToOffer,
  confirmTrade,
  cancelOffer,
} from "@/lib/services/marketplace";
import { getListings, type ListingFilters, type ListingsPage } from "@/lib/queries/marketplace";
import { CreateListingSchema, MakeOfferSchema, safeParse } from "@/lib/validation/schemas";
import { checkAndRecordRateLimit, RATE_LIMIT_KEYS } from "@/lib/security/rate-limit";

async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

function safeError(e: unknown, fallback = "Something went wrong."): string {
  // Only service-thrown Error messages are safe to surface.
  if (e instanceof Error && e.message && e.message.length < 200) return e.message;
  // eslint-disable-next-line no-console
  console.error("Unexpected error:", e);
  return fallback;
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export type ListingState = { error?: string };

export async function createListingAction(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const userId = await requireAuth();

  const rawQty = formData.get("quantity")?.toString();
  const rawPrice = formData.get("askingPrice")?.toString().trim();

  const parsed = safeParse(CreateListingSchema, {
    userCardId:  formData.get("userCardId")?.toString(),
    quantity:    rawQty ? parseInt(rawQty, 10) : undefined,
    listingType: formData.get("listingType")?.toString(),
    askingPrice: rawPrice ? parseFloat(rawPrice) : undefined,
    description: formData.get("description")?.toString().trim() || undefined,
  });
  if (!parsed.ok) return { error: parsed.error };

  const limited = await checkAndRecordRateLimit(
    RATE_LIMIT_KEYS.createListing(userId),
    20,
    24 * 60 * 60 * 1000,
  );
  if (limited) return { error: "You've created too many listings today. Try again tomorrow." };

  try {
    await createListing(userId, {
      ...parsed.data,
      askingPrice: parsed.data.askingPrice ? Math.round(parsed.data.askingPrice * 100) / 100 : undefined,
    });
  } catch (e) {
    return { error: safeError(e) };
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
  formData: FormData,
): Promise<OfferState> {
  const offererId = await requireAuth();

  const rawCash = formData.get("cashAmount")?.toString().trim();
  const offeredRaw = formData.get("offeredCards")?.toString();

  let offeredCards: unknown = undefined;
  if (offeredRaw) {
    try {
      offeredCards = JSON.parse(offeredRaw);
    } catch {
      return { error: "Invalid offered cards format." };
    }
  }

  const parsed = safeParse(MakeOfferSchema, {
    offerType:    formData.get("offerType")?.toString(),
    cashAmount:   rawCash ? parseFloat(rawCash) : undefined,
    offeredCards,
    message:      formData.get("message")?.toString().trim() || undefined,
  });
  if (!parsed.ok) return { error: parsed.error };

  const limited = await checkAndRecordRateLimit(
    RATE_LIMIT_KEYS.makeOffer(offererId),
    30,
    24 * 60 * 60 * 1000,
  );
  if (limited) return { error: "You've sent too many offers today. Try again tomorrow." };

  try {
    await makeOffer(offererId, listingId, {
      ...parsed.data,
      cashAmount: parsed.data.cashAmount ? Math.round(parsed.data.cashAmount * 100) / 100 : undefined,
    });
  } catch (e) {
    return { error: safeError(e) };
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
    await confirmTrade(userId, offerId);
  } catch {
    return;
  }
  revalidatePath("/marketplace/my-listings");
  revalidatePath("/marketplace/my-offers");
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
