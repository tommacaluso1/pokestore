import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Package, Clock, CreditCard, Truck, CheckCircle2, XCircle } from "lucide-react";
import { auth } from "@/auth";
import { getOrdersByUser } from "@/lib/queries/cart";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Orders — PokéStore" };

const FALLBACK_STATUS = { label: "Pending", icon: Clock, cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" };

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  PENDING:   { label: "Pending",   icon: Clock,         cls: "text-amber-400  bg-amber-400/10  border-amber-400/20"  },
  PAID:      { label: "Paid",      icon: CreditCard,    cls: "text-sky-400    bg-sky-400/10    border-sky-400/20"    },
  SHIPPED:   { label: "Shipped",   icon: Truck,         cls: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  DELIVERED: { label: "Delivered", icon: CheckCircle2,  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELLED: { label: "Cancelled", icon: XCircle,       cls: "text-rose-400   bg-rose-400/10   border-rose-400/20"  },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground text-sm mt-2">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 border border-dashed border-border/50 rounded-2xl text-center gap-3">
          <div className="relative w-24 h-24">
            <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.54_0.24_285/0.4),transparent_70%)] blur-lg" />
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
              fill
              className="object-contain opacity-40 drop-shadow-[0_0_16px_oklch(0.54_0.24_285/0.4)]"
              unoptimized
            />
          </div>
          <div>
            <p className="font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-1">Head to the shop to get started.</p>
          </div>
          <Link href="/shop">
            <Button variant="outline" size="sm" className="mt-1">Browse the shop</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? FALLBACK_STATUS;
            const StatusIcon = cfg.icon;
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group block bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-[0_4px_20px_oklch(0.54_0.24_285/0.10)] transition-all duration-200"
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border/40">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    <p className="text-2xl font-bold text-primary mt-0.5">
                      €{Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                    <StatusIcon className="size-3" />
                    {cfg.label}
                  </span>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate mr-4">
                        {item.product.name}{" "}
                        <span className="text-muted-foreground/50">×{item.quantity}</span>
                      </span>
                      <span className="font-medium shrink-0">
                        €{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-primary/50 group-hover:text-primary pt-1 transition-colors">
                    View details →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
