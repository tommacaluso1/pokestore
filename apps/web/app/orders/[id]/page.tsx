import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { db } from "@repo/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Order ${id.slice(-8).toUpperCase()} — PokéStore` };
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: { include: { set: { select: { name: true } } } } },
      },
    },
  });

  if (!order || (order.userId !== session.user.id && (session.user as any).role !== "ADMIN")) {
    notFound();
  }

  const hasShipping = order.shippingName || order.shippingAddress;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
        ← My orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <Badge variant={STATUS_COLOR[order.status] ?? "outline"} className="text-sm">
          {order.status}
        </Badge>
      </div>

      {/* Items */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-4">
        <div className="p-4 border-b border-border">
          <p className="text-sm font-medium">Items</p>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 relative shrink-0 bg-black/20 rounded overflow-hidden">
                {item.product.imageUrl ? (
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-contain p-1" />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{item.product.set.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">€{(Number(item.priceAtTime) * item.quantity).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">× {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-lg">€{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping address */}
      {hasShipping && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-medium mb-3">Shipping address</p>
          <address className="text-sm text-muted-foreground not-italic space-y-0.5">
            {order.shippingName && <p>{order.shippingName}</p>}
            {order.shippingAddress && <p>{order.shippingAddress}</p>}
            {(order.shippingCity || order.shippingPostcode) && (
              <p>{[order.shippingCity, order.shippingPostcode].filter(Boolean).join(", ")}</p>
            )}
            {order.shippingCountry && <p>{order.shippingCountry}</p>}
          </address>
        </div>
      )}

      <div className="mt-6">
        <Link href="/sets">
          <Button variant="outline">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
