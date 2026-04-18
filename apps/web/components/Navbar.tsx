import Link from "next/link";
import { cookies } from "next/headers";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/queries/cart";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const cookieStore = await cookies();
  const cart = await getCart(user?.id, cookieStore.get("cartId")?.value);
  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-primary">Poké</span>Store
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/sets" className="text-muted-foreground hover:text-foreground transition-colors">
            Sets
          </Link>
          <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Cart
            {cartCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {(user as any).role === "ADMIN" && (
                <Link href="/admin" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Admin
                </Link>
              )}
              <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                Orders
              </Link>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <Button variant="ghost" size="sm" type="submit">Sign out</Button>
              </form>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
