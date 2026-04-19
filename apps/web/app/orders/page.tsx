import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrdersByUser } from "@/lib/queries/cart";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "My Orders — PokéStore" };

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await getOrdersByUser(session.user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                  <p className="font-bold">€{Number(order.total).toFixed(2)}</p>
                </div>
                <Badge variant={STATUS_COLOR[order.status] ?? "outline"}>{order.status}</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>€{(Number(item.priceAtTime) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
