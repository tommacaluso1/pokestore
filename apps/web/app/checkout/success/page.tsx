import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { db } from "@repo/db";
import { Button } from "@/components/ui/button";
import { awardXP } from "@/lib/services/xp";
import { evaluateBadges } from "@/lib/services/badges";

export const metadata = { title: "Order confirmed — PokéStore" };

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  // Idempotent: session already fulfilled → just show the confirmation
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

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  );

  // Atomic: stock decrement + order creation in one transaction
  const order = await db.$transaction(async (tx) => {
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data:  { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new Error(`"${item.product.name}" went out of stock after payment.`);
      }
    }

    const newOrder = await tx.order.create({
      data: {
        userId, total, status: "PAID",
        stripeSessionId: session_id,
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

  awardXP(userId, 25, "ORDER_PLACED", order.id).catch(() => {});
  evaluateBadges(userId).catch(() => {});

  return <Confirmation orderId={order.id} total={total} />;
}

function Confirmation({ orderId, total }: { orderId: string; total: number }) {
  return (
    <div className="max-w-md mx-auto py-16">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,oklch(0.54_0.24_285/0.10),transparent_70%)]" />

      <div className="text-center mb-8">
        {/* Success icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div aria-hidden className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping [animation-duration:1.5s] [animation-iteration-count:2]" />
          <div className="relative flex items-center justify-center w-full h-full rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <CheckCircle2 className="size-9 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Order confirmed!</h1>
        <p className="text-muted-foreground text-sm">
          Thanks for your purchase. We'll get it shipped soon.
        </p>
      </div>

      {/* Order summary card */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden mb-6 shadow-[0_4px_24px_oklch(0_0_0/0.25)]">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
          <Package className="size-4 text-primary" />
          <span className="text-sm font-semibold">Order details</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono text-xs">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-border/40 pt-3">
            <span className="font-semibold">Total charged</span>
            <span className="text-xl font-bold text-primary">€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href={`/orders/${orderId}`} className="flex-1">
          <Button className="w-full gap-2">
            <Package className="size-4" />
            View order
          </Button>
        </Link>
        <Link href="/sets" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            Keep shopping
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
