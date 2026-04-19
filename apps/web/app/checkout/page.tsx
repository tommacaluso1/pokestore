import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { getCart } from "@/lib/queries/cart";
import { placeOrder } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const hasStripe = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form action={placeOrder} className="space-y-6">
        {/* Shipping address */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <p className="text-sm font-medium">Shipping address</p>

          <div className="space-y-1">
            <Label htmlFor="shippingName">Full name</Label>
            <Input id="shippingName" name="shippingName" placeholder="Jane Doe" required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="shippingAddress">Address</Label>
            <Input id="shippingAddress" name="shippingAddress" placeholder="123 Main Street" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="shippingCity">City</Label>
              <Input id="shippingCity" name="shippingCity" placeholder="Dublin" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shippingPostcode">Postcode</Label>
              <Input id="shippingPostcode" name="shippingPostcode" placeholder="D01 ABC" required />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="shippingCountry">Country</Label>
            <Input id="shippingCountry" name="shippingCountry" placeholder="Ireland" required />
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
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

        {!hasStripe && (
          <p className="text-xs text-muted-foreground text-center">
            Payment integration not configured — order will be placed without charge.
          </p>
        )}

        <div className="flex gap-3">
          <Link href="/cart" className="flex-1">
            <Button variant="outline" className="w-full" type="button">Back to cart</Button>
          </Link>
          <Button type="submit" className="flex-1">
            {hasStripe ? "Pay with card" : "Place order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
