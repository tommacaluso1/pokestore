import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { ShoppingCart } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/queries/cart";
import { NavLinks } from "@/components/NavLinks";
import { MobileMenu } from "@/components/MobileMenu";
import { LevelBadge } from "@/components/LevelBadge";
import { getXPInfo } from "@/lib/services/xp";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;
  const cookieStore = await cookies();
  const [cart, xpInfo] = await Promise.all([
    getCart(user?.id, cookieStore.get("cartId")?.value),
    user?.id ? getXPInfo(user.id as string).catch(() => null) : Promise.resolve(null),
  ]);
  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md shadow-[0_1px_0_0_oklch(0.22_0.08_285/0.8),0_4px_24px_-4px_oklch(0_0_0/0.4)]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
          <div className="relative size-8 group-hover:scale-110 transition-transform drop-shadow-[0_0_6px_oklch(0.54_0.24_285/0.7)]">
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
              alt="Gengar"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">Poké</span>
            <span className="text-foreground">Store</span>
          </span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden sm:flex items-center gap-5 text-sm flex-1 justify-center">
          <NavLinks />
        </nav>

        {/* Right: cart + auth */}
        <div className="relative flex items-center gap-2 shrink-0">
          {/* Mobile hamburger */}
          <MobileMenu isAdmin={(user as any)?.role === "ADMIN"} />
          <Link href="/cart" className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <ShoppingCart className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none px-1">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {(user as any).role === "ADMIN" && (
                <Link href="/admin" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">Admin</Button>
                </Link>
              )}
              <Link href="/profile" className="hidden sm:flex items-center">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  Profile
                  {xpInfo && <LevelBadge level={xpInfo.level} size="sm" />}
                </Button>
              </Link>
              <Link href="/orders" className="hidden sm:block">
                <Button variant="ghost" size="sm">Orders</Button>
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
        </div>
      </div>
    </header>
  );
}
