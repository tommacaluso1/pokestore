"use server";

import { db } from "@repo/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function placeOrder() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) redirect("/cart");

  // Check stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`${item.product.name} only has ${item.product.stock} in stock.`);
    }
  }

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const order = await db.order.create({
    data: {
      userId,
      total,
      status: "PENDING",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.product.price,
        })),
      },
    },
  });

  // Decrement stock
  await Promise.all(
    cart.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    )
  );

  // Clear cart
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  redirect(`/orders`);
}
