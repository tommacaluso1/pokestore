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

  const shippingName     = (formData.get("shippingName")     as string | null)?.trim() ?? "";
  const shippingAddress  = (formData.get("shippingAddress")  as string | null)?.trim() ?? "";
  const shippingCity     = (formData.get("shippingCity")     as string | null)?.trim() ?? "";
  const shippingPostcode = (formData.get("shippingPostcode") as string | null)?.trim() ?? "";
  const shippingCountry  = (formData.get("shippingCountry")  as string | null)?.trim() ?? "";

  if (!shippingName || !shippingAddress || !shippingCity || !shippingPostcode || !shippingCountry) {
    throw new Error("All shipping fields are required.");
  }

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
        userId, cartId: cart.id,
        shippingName, shippingAddress, shippingCity, shippingPostcode, shippingCountry,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/cart`,
    });

    redirect(stripeSession.url!);
  }

  // No-charge path: create order + decrement stock atomically in one transaction
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  );

  const order = await db.$transaction(async (tx) => {
    // Atomic check-and-decrement: if stock is insufficient the updateMany returns count=0
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data:  { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(
          `"${item.product.name}" is no longer available in the requested quantity.`
        );
      }
    }

    const newOrder = await tx.order.create({
      data: {
        userId, total, status: "PENDING",
        shippingName, shippingAddress, shippingCity, shippingPostcode, shippingCountry,
        items: {
          create: cart.items.map((item) => ({
            productId:   item.productId,
            quantity:    item.quantity,
            priceAtTime: item.product.price,
          })),
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return newOrder;
  });

  redirect(`/orders/${order.id}`);
}
