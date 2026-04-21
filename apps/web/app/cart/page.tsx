import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { ShoppingCart, Trash2, ArrowRight, Tag } from "lucide-react";
import { auth } from "@/auth";
import { getCart } from "@/lib/queries/cart";
import { removeFromCart, updateCartItemQuantity } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Cart — PokéStore" };

export default async function CartPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cartId")?.value;

  const cart = await getCart(session?.user?.id, sessionCartId);
  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="relative w-40 h-40 mb-4">
          <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.54_0.24_285/0.4),transparent_70%)] blur-xl" />
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt="Gengar"
            fill
            className="object-contain drop-shadow-[0_0_24px_oklch(0.54_0.24_285/0.5)] animate-[float_4s_ease-in-out_infinite]"
            unoptimized
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/shop">
          <Button size="lg" className="gap-2">
            <ShoppingCart className="size-4" />
            Browse the shop
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="size-6 text-primary" />
        <h1 className="text-3xl font-bold">Cart</h1>
        <span className="text-sm text-muted-foreground ml-1">({items.length} {items.length === 1 ? "item" : "items"})</span>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
          >
            {/* Image */}
            <div className="w-16 h-16 relative shrink-0 bg-gradient-to-b from-secondary/40 to-background rounded-lg overflow-hidden border border-border/50">
              {item.product.imageUrl ? (
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-contain p-1.5"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-2xl select-none">
                  ◈
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-semibold text-sm truncate block hover:text-primary transition-colors"
              >
                {item.product.name}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">{item.product.set.name}</p>
              <p className="text-xs text-primary/70 mt-1">€{Number(item.product.price).toFixed(2)} each</p>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-1">
              <form action={updateCartItemQuantity.bind(null, item.id, item.quantity - 1)}>
                <button className="w-7 h-7 rounded-md text-sm font-bold hover:bg-card hover:text-primary transition-colors flex items-center justify-center">
                  −
                </button>
              </form>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <form action={updateCartItemQuantity.bind(null, item.id, item.quantity + 1)}>
                <button className="w-7 h-7 rounded-md text-sm font-bold hover:bg-card hover:text-primary transition-colors flex items-center justify-center">
                  +
                </button>
              </form>
            </div>

            {/* Line total */}
            <span className="w-20 text-right font-bold text-base text-primary">
              €{(Number(item.product.price) * item.quantity).toFixed(2)}
            </span>

            {/* Remove */}
            <form action={removeFromCart.bind(null, item.id)}>
              <button className="text-muted-foreground/40 hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10">
                <Trash2 className="size-4" />
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="relative bg-card border border-border rounded-2xl p-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,oklch(0.54_0.24_285/0.08),transparent_70%)] rounded-2xl" />
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Order Summary</h2>

        <div className="space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate mr-4">
                {item.product.name} × {item.quantity}
              </span>
              <span>€{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            <span className="font-semibold">Total</span>
          </div>
          <span className="text-3xl font-bold text-primary">€{total.toFixed(2)}</span>
        </div>

        <Link href="/checkout" className="block">
          <Button size="lg" className="w-full gap-2 text-base">
            Proceed to checkout
            <ArrowRight className="size-4" />
          </Button>
        </Link>

        <Link
          href="/shop"
          className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
        >
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}
