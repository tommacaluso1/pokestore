import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getCart } from "@/lib/queries/cart";
import { placeOrder } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Checkout — PokéStore" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const cookieStore = await cookies();
  const cart = await getCart(session.user.id, cookieStore.get("cartId")?.value);
  const items = cart?.items ?? [];

  if (items.length === 0) redirect("/cart");

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity, 0
  );

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Order summary */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">Order summary</p>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product.name} × {item.quantity}</span>
            <span>€{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Payment integration coming soon. Click below to place your order (no charge).
      </p>

      <div className="flex gap-3">
        <Link href="/cart" className="flex-1">
          <Button variant="outline" className="w-full">Back to cart</Button>
        </Link>
        <form action={placeOrder} className="flex-1">
          <Button type="submit" className="w-full">Place order</Button>
        </form>
      </div>
    </div>
  );
}
