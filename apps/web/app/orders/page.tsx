import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { auth } from "@/auth";
import { getOrdersByUser } from "@/lib/queries/cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Orders — PokéStore" };

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "secondary",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", PAID: "Paid", SHIPPED: "Shipped",
  DELIVERED: "Delivered", CANCELLED: "Cancelled",
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
        <div className="text-center py-24 border border-dashed border-border/50 rounded-2xl text-muted-foreground">
          <Package className="size-10 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No orders yet.</p>
          <p className="text-sm mt-1">Head to the shop to get started.</p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Browse the shop</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group block bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    €{Number(order.total).toFixed(2)}
                  </p>
                </div>
                <Badge variant={STATUS_COLOR[order.status] ?? "outline"}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
              <ul className="space-y-1 border-t border-border/60 pt-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-4">
                      {item.product.name}{" "}
                      <span className="text-muted-foreground/60">×{item.quantity}</span>
                    </span>
                    <span className="text-foreground font-medium shrink-0">
                      €{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-primary/60 group-hover:text-primary mt-3 transition-colors">
                View details →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
