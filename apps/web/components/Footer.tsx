import Link from "next/link";
import { Ghost } from "lucide-react";

const nav = [
  { label: "Shop", href: "/shop" },
  { label: "Sets", href: "/sets" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Cart", href: "/cart" },
];

const account = [
  { label: "Sign in", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "My Orders", href: "/orders" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50 mt-20">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Ghost className="size-5 text-primary" />
              <span className="text-lg font-bold">
                <span className="text-primary">Poké</span>Store
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Authentic sealed Pokémon TCG products. Packs, ETBs, and boxes from every set.
            </p>
          </div>

          {/* Store */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Store</p>
            <ul className="space-y-2">
              {nav.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Account</p>
            <ul className="space-y-2">
              {account.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} PokéStore. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Pokémon and all related names are trademarks of Nintendo / Game Freak.</p>
        </div>
      </div>
    </footer>
  );
}
