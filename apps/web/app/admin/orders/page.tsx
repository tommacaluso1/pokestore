import { getAllOrders } from "@/lib/queries/admin";
import { updateOrderStatus } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Orders — Admin" };

const STATUS_NEXT: Record<string, string> = {
  PENDING: "PAID",
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PAID: "secondary",
  SHIPPED: "secondary",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="space-y-3">
        {orders.map((order: (typeof orders)[number]) => (
          <div key={order.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <p className="font-medium text-sm">{order.user.name ?? order.user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-GB")} · €{Number(order.total).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_COLOR[order.status] ?? "outline"}>{order.status}</Badge>
                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <form action={updateOrderStatus.bind(null, order.id, STATUS_NEXT[order.status] ?? "")}>
                    <Button size="sm" variant="outline" type="submit">
                      → {STATUS_NEXT[order.status]}
                    </Button>
                  </form>
                )}
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {order.items.map((item) => (
                <li key={item.id}>{item.product.name} × {item.quantity}</li>
              ))}
            </ul>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted-foreground">No orders yet.</p>}
      </div>
    </div>
  );
}
