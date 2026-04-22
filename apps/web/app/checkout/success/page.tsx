import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@repo/db";
import { Button } from "@/components/ui/button";
import { awardXP } from "@/lib/services/xp";
import { evaluateBadges } from "@/lib/services/badges";

export const metadata = { title: "Order confirmed — PokéStore" };

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  // Idempotent: if order already created for this session, just show it
  const existing = await db.order.findUnique({ where: { stripeSessionId: session_id } });
  if (existing) {
    return <Confirmation orderId={existing.id} total={Number(existing.total)} />;
  }

  const { stripe } = await import("@/lib/stripe");
  const stripeSession = await stripe.checkout.sessions.retrieve(session_id);

  if (stripeSession.payment_status !== "paid") redirect("/cart");

  const meta = stripeSession.metadata as Record<string, string>;
  const { userId, cartId, shippingName, shippingAddress, shippingCity, shippingPostcode, shippingCountry } = meta;
  if (!userId || !cartId) redirect("/orders");

  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) redirect("/orders");

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`${item.product.name} went out of stock.`);
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
      status: "PAID",
      stripeSessionId: session_id,
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

  // XP: store purchase (25 XP, idempotent on order.id)
  awardXP(userId, 25, "ORDER_PLACED", order.id).catch(() => {});
  evaluateBadges(userId).catch(() => {});

  return <Confirmation orderId={order.id} total={total} />;
}

function Confirmation({ orderId, total }: { orderId: string; total: number }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-5xl mb-4">✓</div>
      <h1 className="text-2xl font-bold mb-2">Order confirmed!</h1>
      <p className="text-muted-foreground mb-2">
        Total charged: <span className="font-semibold text-foreground">€{total.toFixed(2)}</span>
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Order ID: <span className="font-mono">{orderId}</span>
      </p>
      <div className="flex gap-3 justify-center">
        <Link href={`/orders/${orderId}`}>
          <Button>View order</Button>
        </Link>
        <Link href="/sets">
          <Button variant="outline">Keep shopping</Button>
        </Link>
      </div>
    </div>
  );
}
