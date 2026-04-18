import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
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
      <div className="text-center py-24">
        <p className="text-xl font-semibold mb-2">Your cart is empty</p>
        <Link href="/sets">
          <Button className="mt-4">Browse sets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
            <div className="w-14 h-14 relative shrink-0 bg-black/20 rounded overflow-hidden">
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

            <div className="flex items-center gap-2">
              <form action={updateCartItemQuantity.bind(null, item.id, item.quantity - 1)}>
                <button className="w-6 h-6 rounded border border-border text-sm hover:bg-card transition-colors">−</button>
              </form>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <form action={updateCartItemQuantity.bind(null, item.id, item.quantity + 1)}>
                <button className="w-6 h-6 rounded border border-border text-sm hover:bg-card transition-colors">+</button>
              </form>
            </div>

            <span className="w-16 text-right font-semibold text-sm">
              €{(Number(item.product.price) * item.quantity).toFixed(2)}
            </span>

            <form action={removeFromCart.bind(null, item.id)}>
              <button className="text-muted-foreground hover:text-destructive transition-colors text-xs">✕</button>
            </form>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">Total</p>
          <p className="text-2xl font-bold">€{total.toFixed(2)}</p>
        </div>
        <Link href="/checkout">
          <Button size="lg">Proceed to checkout</Button>
        </Link>
      </div>
    </div>
  );
}
