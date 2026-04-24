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
    user?.id ? getXPInfo(user.id).catch(() => null) : Promise.resolve(null),
  ]);
  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50">
      {/* Glass + violet rim */}
      <div className="relative border-b border-[oklch(0.55_0.25_295/0.2)] bg-[oklch(0.06_0.03_285/0.72)] backdrop-blur-xl">
        {/* Subtle bottom violet-glow line */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.25_295/0.45)] to-transparent" />
        {/* Ghost pattern */}
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-seance opacity-20" />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo — Gengar glyph + wordmark */}
          <Link href="/" className="group flex items-center gap-2 shrink-0">
            <div className="relative size-9">
              <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.25_295/0.45),transparent_70%)] blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
                alt="Gengar"
                fill
                className="relative object-contain drop-shadow-[0_0_8px_oklch(0.55_0.25_295/0.7)] group-hover:scale-110 transition-transform"
                unoptimized
              />
            </div>
            <span className="font-display text-lg tracking-[-0.04em]">
              <span className="ghost-text">Poké</span>
              <span className="text-foreground">Store</span>
            </span>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden sm:flex items-center gap-1 text-sm flex-1 justify-center">
            <NavLinks />
          </nav>

          {/* Right cluster */}
          <div className="relative flex items-center gap-1.5 shrink-0">
            <MobileMenu isAdmin={user?.role === "ADMIN"} />

            <Link
              href="/cart"
              className="relative flex items-center justify-center size-9 rounded-lg hover:bg-[oklch(0.16_0.08_290/0.6)] transition-colors group/cart"
            >
              <ShoppingCart className="size-4 text-muted-foreground group-hover/cart:text-[oklch(0.85_0.12_295)] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[oklch(0.55_0.25_295)] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-[0_0_12px_oklch(0.55_0.25_295/0.6)]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-[oklch(0.82_0.15_215)] hover:text-[oklch(0.88_0.15_215)] hover:bg-[oklch(0.16_0.1_220/0.4)]">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/profile" className="hidden sm:flex items-center">
                  <Button variant="ghost" size="sm" className="gap-1.5 hover:bg-[oklch(0.16_0.08_290/0.6)]">
                    Profile
                    {xpInfo && <LevelBadge level={xpInfo.level} size="sm" />}
                  </Button>
                </Link>
                <Link href="/orders" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="hover:bg-[oklch(0.16_0.08_290/0.6)]">Orders</Button>
                </Link>
                <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                  <Button variant="ghost" size="sm" type="submit" className="hover:bg-[oklch(0.16_0.08_290/0.6)]">Sign out</Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-[oklch(0.55_0.25_295)] hover:bg-[oklch(0.62_0.25_295)] shadow-[0_0_20px_-4px_oklch(0.55_0.25_295/0.6),inset_0_1px_0_oklch(1_0_0/0.15)] border border-[oklch(0.70_0.22_295/0.4)]"
                >
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
