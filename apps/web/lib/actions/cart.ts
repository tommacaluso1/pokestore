"use server";

import { db } from "@repo/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
    if (existing) return existing;
  }

  const cart = await db.cart.create({ data: {} });
  cookieStore.set("cartId", cart.id, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return cart;
}

export async function addToCart(productId: string, quantity: number | FormData = 1) {
  if (typeof quantity !== "number") quantity = 1;
  const cart = await getOrCreateCart();

  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  await db.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/cart");
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    await db.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await db.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }
  revalidatePath("/cart");
}

export async function clearCart(cartId: string) {
  await db.cartItem.deleteMany({ where: { cartId } });
  revalidatePath("/cart");
}
