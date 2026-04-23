import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { MapPin, Receipt, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { getCart } from "@/lib/queries/cart";
import { placeOrder } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-3" />
          Back to cart
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <form action={placeOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* Left: Shipping */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_oklch(0_0_0/0.12)]">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-secondary/20">
              <MapPin className="size-4 text-primary" />
              <h2 className="text-sm font-semibold">Shipping address</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="shippingName" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Full name
                </Label>
                <Input
                  id="shippingName"
                  name="shippingName"
                  placeholder="Jane Doe"
                  required
                  className="bg-secondary/30 border-border/60 focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shippingAddress" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Street address
                </Label>
                <Input
                  id="shippingAddress"
                  name="shippingAddress"
                  placeholder="123 Main Street"
                  required
                  className="bg-secondary/30 border-border/60 focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="shippingCity" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    City
                  </Label>
                  <Input
                    id="shippingCity"
                    name="shippingCity"
                    placeholder="Dublin"
                    required
                    className="bg-secondary/30 border-border/60 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="shippingPostcode" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Postcode
                  </Label>
                  <Input
                    id="shippingPostcode"
                    name="shippingPostcode"
                    placeholder="D01 ABC"
                    required
                    className="bg-secondary/30 border-border/60 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shippingCountry" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Country
                </Label>
                <Input
                  id="shippingCountry"
                  name="shippingCountry"
                  placeholder="Ireland"
                  required
                  className="bg-secondary/30 border-border/60 focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Right: Order summary + pay */}
          <div className="space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[0_2px_16px_oklch(0_0_0/0.12)]">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
                <Receipt className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Order summary</h2>
              </div>
              <div className="p-5 space-y-2.5">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      €{(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-border/60 bg-secondary/10 flex items-center justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>

            {!hasStripe && (
              <p className="text-xs text-muted-foreground/70 text-center px-2">
                Payment not configured — order placed without charge.
              </p>
            )}

            <Button type="submit" size="lg" className="w-full gap-2 font-semibold">
              <CreditCard className="size-4" />
              {hasStripe ? "Pay €" + total.toFixed(2) : "Place order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
