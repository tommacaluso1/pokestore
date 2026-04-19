"use server";

import { db } from "@repo/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function placeOrder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) redirect("/cart");

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`${item.product.name} only has ${item.product.stock} in stock.`);
    }
  }

  const shippingName = (formData.get("shippingName") as string) ?? "";
  const shippingAddress = (formData.get("shippingAddress") as string) ?? "";
  const shippingCity = (formData.get("shippingCity") as string) ?? "";
  const shippingPostcode = (formData.get("shippingPostcode") as string) ?? "";
  const shippingCountry = (formData.get("shippingCountry") as string) ?? "";

  if (process.env.STRIPE_SECRET_KEY) {
    const { stripe } = await import("@/lib/stripe");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.product.name },
          unit_amount: Math.round(Number(item.product.price) * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        userId,
        cartId: cart.id,
        shippingName,
        shippingAddress,
        shippingCity,
        shippingPostcode,
        shippingCountry,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
    });

    redirect(stripeSession.url!);
  }

  // Fallback: no-charge order when Stripe is not configured
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const order = await db.order.create({
    data: {
      userId,
      total,
      status: "PENDING",
      shippingName,
      shippingAddress,
      shippingCity,
      shippingPostcode,
      shippingCountry,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.product.price,
        })),
      },
    },
  });

  await Promise.all(
    cart.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    )
  );

  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  redirect(`/orders/${order.id}`);
}
