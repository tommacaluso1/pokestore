"use server";

import { db } from "@repo/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Resolve the single cart that the current caller is allowed to touch.
// - Logged-in users: their cart (keyed by userId).
// - Anonymous: the cart whose id matches the httpOnly cartId cookie.
// Returns null if caller has no claim on any cart.
async function resolveOwnedCartId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const cart = await db.cart.findUnique({ where: { userId }, select: { id: true } });
    return cart?.id ?? null;
  }

  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cartId")?.value;
  if (!sessionCartId) return null;

  const cart = await db.cart.findUnique({ where: { id: sessionCartId }, select: { id: true, userId: true } });
  // Only allow cookie-based access for anonymous carts (no owner assigned).
  if (!cart || cart.userId) return null;
  return cart.id;
}

async function getOrCreateCart() {
  const session = await auth();
  const userId = session?.user?.id;
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cartId")?.value;

  if (userId) {
    const existing = await db.cart.findUnique({ where: { userId } });
    if (existing) return existing;
    return db.cart.create({ data: { userId } });
  }

  if (sessionCartId) {
    const existing = await db.cart.findUnique({ where: { id: sessionCartId } });
    if (existing && !existing.userId) return existing;
  }

  const cart = await db.cart.create({ data: {} });
  cookieStore.set("cartId", cart.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return cart;
}

export async function addToCart(productId: string, quantity: number | FormData = 1) {
  if (typeof quantity !== "number") quantity = 1;
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 99) quantity = 1;

  const cart = await getOrCreateCart();

  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existing) {
    const next = Math.min(99, existing.quantity + quantity);
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: next },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  const ownedCartId = await resolveOwnedCartId();
  if (!ownedCartId) return;

  // deleteMany returns count and does not throw on no-match — safe under IDOR probing.
  await db.cartItem.deleteMany({ where: { id: cartItemId, cartId: ownedCartId } });
  revalidatePath("/cart");
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const ownedCartId = await resolveOwnedCartId();
  if (!ownedCartId) return;

  if (!Number.isFinite(quantity)) return;

  if (quantity <= 0) {
    await db.cartItem.deleteMany({ where: { id: cartItemId, cartId: ownedCartId } });
  } else {
    const bounded = Math.min(99, Math.floor(quantity));
    await db.cartItem.updateMany({
      where: { id: cartItemId, cartId: ownedCartId },
      data: { quantity: bounded },
    });
  }
  revalidatePath("/cart");
}

export async function clearCart() {
  const ownedCartId = await resolveOwnedCartId();
  if (!ownedCartId) return;

  await db.cartItem.deleteMany({ where: { cartId: ownedCartId } });
  revalidatePath("/cart");
}
