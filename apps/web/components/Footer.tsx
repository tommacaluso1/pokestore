import Link from "next/link";
import Image from "next/image";

const nav = [
  { label: "Shop",         href: "/shop" },
  { label: "Sets",         href: "/sets" },
  { label: "Marketplace",  href: "/marketplace" },
  { label: "Leaderboard",  href: "/leaderboard" },
];

const account = [
  { label: "Sign in",  href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Orders",   href: "/orders" },
  { label: "Profile",  href: "/profile" },
];

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Full-width ghost haze */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.08_0.04_285/0.4)] to-[oklch(0.06_0.03_285)]" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.25_295/0.4)] to-transparent" />
      <div aria-hidden className="absolute inset-0 pattern-seance opacity-20" />
      <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vmin] h-[40vmin] bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.25_295/0.18),transparent_70%)] blur-3xl" />

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="relative size-8">
                <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.25_295/0.5),transparent_70%)] blur-md animate-breathe" />
                <Image
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
                  alt="Gengar"
                  fill
                  className="relative object-contain drop-shadow-[0_0_8px_oklch(0.55_0.25_295/0.6)]"
                  unoptimized
                />
              </div>
              <span className="font-display text-2xl tracking-[-0.04em]">
                <span className="ghost-text">Poké</span>
                <span className="text-foreground">Store</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              A haunted little storefront for Pokémon TCG. Sealed packs from the shelf,
              singles from other trainers&apos; binders. The séance is always open.
            </p>
            <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.28em] text-[oklch(0.74_0.15_220)]/60 inline-flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.74_0.15_220)] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full size-1.5 bg-[oklch(0.74_0.15_220)]" />
              </span>
              Spectre online
            </p>
          </div>

          {/* Store */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.78_0.2_295)]/70 mb-3">Store</p>
            <ul className="space-y-2">
              {nav.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-[oklch(0.88_0.12_295)] transition-colors inline-flex items-center gap-1 group">
                    <span aria-hidden className="w-0 h-px bg-[oklch(0.55_0.25_295)] group-hover:w-3 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.82_0.15_215)]/70 mb-3">Account</p>
            <ul className="space-y-2">
              {account.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-[oklch(0.88_0.15_215)] transition-colors inline-flex items-center gap-1 group">
                    <span aria-hidden className="w-0 h-px bg-[oklch(0.74_0.15_220)] group-hover:w-3 transition-all duration-300" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[oklch(0.22_0.08_285/0.5)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[0.22em]">
          <p className="text-muted-foreground/60">
            © {new Date().getFullYear()} PokéStore · Séance open
          </p>
          <p className="text-muted-foreground/40">
            Pokémon © Nintendo / Game Freak. Fan project.
          </p>
        </div>
      </div>
    </footer>
  );
}
