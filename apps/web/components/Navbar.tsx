import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

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
          <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
            Cart
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
