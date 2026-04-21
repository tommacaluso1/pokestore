import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getAllSets } from "@/lib/queries/sets";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [products, sets] = await Promise.all([
    getFeaturedProducts(8),
    getAllSets(),
  ]);

  return (
    <div className="space-y-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative text-center py-24 sm:py-32 overflow-hidden rounded-3xl border border-border/40">
        {/* Backgrounds */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[oklch(0.13_0.07_285)] to-[oklch(0.08_0.03_285)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,oklch(0.54_0.24_285/0.30),transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-[0.04] [background-image:radial-gradient(oklch(0.95_0.02_295)_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* Gengar — decorative, fades on small screens */}
        <div aria-hidden className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 opacity-25 sm:opacity-40 lg:opacity-55">
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt=""
            fill
            className="object-contain drop-shadow-[0_0_48px_oklch(0.54_0.24_285/0.8)] animate-[float_4s_ease-in-out_infinite]"
            unoptimized
            priority
          />
        </div>
        {/* Mirror glow on left */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 opacity-10 sm:opacity-20 scale-x-[-1]">
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt=""
            fill
            className="object-contain blur-sm"
            unoptimized
          />
        </div>

        {/* Centered content */}
        <div className="relative z-10 px-8 sm:px-16">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Authentic sealed products</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.05]">
            The ultimate<br />
            <span className="bg-gradient-to-r from-[oklch(0.75_0.16_295)] via-[oklch(0.60_0.22_285)] to-primary bg-clip-text text-transparent">
              Pokémon TCG
            </span>
            <span className="text-foreground"> shop</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Booster packs, Elite Trainer Boxes, and full booster boxes — every set, every format.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/shop">
              <Button size="lg" className="gap-2 shadow-[0_0_28px_oklch(0.54_0.24_285/0.50)]">
                <Sparkles className="size-4" />
                Shop now
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="gap-2">
                Marketplace
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sets grid ────────────────────────────────────────────────────── */}
      {sets.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Browse by Set</h2>
              <p className="text-sm text-muted-foreground mt-1">{sets.length} sets available</p>
            </div>
            <Link href="/sets" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              All sets <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sets.slice(0, 6).map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.slug}`}
                className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-[0_0_16px_oklch(0.54_0.24_285/0.10)] transition-all duration-200 flex flex-col gap-3"
              >
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,oklch(0.54_0.24_285/0.12),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">{set.series}</p>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors leading-tight">{set.name}</p>
                </div>
                <p className="relative text-xs text-primary/60 group-hover:text-primary transition-colors font-semibold">
                  {set._count.products} products →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <p className="text-sm text-muted-foreground mt-1">Latest additions to the store</p>
          </div>
          {products.length > 0 && (
            <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              View all <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((product: (typeof products)[number]) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/20 text-center">
            <p className="font-semibold text-foreground/60">No products yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon.</p>
          </div>
        )}
      </section>

      {/* ── Marketplace CTA ──────────────────────────────────────────────── */}
      <section className="p-px rounded-2xl bg-gradient-to-br from-primary/40 via-border/60 to-border/30">
        <div className="relative overflow-hidden bg-card rounded-[calc(1rem-1px)] p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,oklch(0.54_0.24_285/0.10),transparent_70%)]" />
          <div className="relative text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Marketplace</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Have cards to sell or trade?</h2>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              List your single cards and connect with other trainers. Cash sales, trades, or both.
            </p>
          </div>
          <div className="relative shrink-0">
            <Link href="/marketplace">
              <Button size="lg" className="gap-2 shadow-[0_0_20px_oklch(0.54_0.24_285/0.4)]">
                Visit the Marketplace
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
