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
      <section className="relative min-h-[56vh] flex items-center py-16 sm:py-20 overflow-hidden rounded-3xl border border-border/40">
        {/* Layered background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[oklch(0.12_0.06_285)] to-[oklch(0.08_0.03_285)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.54_0.24_285/0.28),transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(ellipse_40%_50%_at_80%_80%,oklch(0.54_0.24_285/0.08),transparent_60%)]" />
        {/* Subtle dot grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-[0.035] [background-image:radial-gradient(oklch(0.95_0.02_295)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-4 px-6 py-2">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Authentic sealed products</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight mb-5 leading-[1.1]">
              The ultimate<br />
              <span className="bg-gradient-to-r from-[oklch(0.72_0.18_295)] via-[oklch(0.60_0.22_285)] to-primary bg-clip-text text-transparent">
                Pokémon TCG
              </span>{" "}
              shop
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-[420px] mx-auto lg:mx-0 mb-8 leading-relaxed">
              Booster packs, Elite Trainer Boxes, and full booster boxes — every set, every format.
            </p>

            <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
              <Link href="/shop">
                <Button size="lg" className="gap-2 shadow-[0_0_24px_oklch(0.54_0.24_285/0.45)]">
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

          {/* Gengar */}
          <div className="relative shrink-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-[340px] lg:h-[340px]">
            <div aria-hidden className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1/5 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.54_0.24_285/0.55),transparent_70%)] blur-2xl" />
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
              fill
              className="object-contain drop-shadow-[0_0_56px_oklch(0.54_0.24_285/0.65)] animate-[float_4s_ease-in-out_infinite]"
              unoptimized
              priority
            />
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
            <Link href="/sets" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 pb-0.5">
              All sets <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sets.slice(0, 8).map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.slug}`}
                className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all text-center overflow-hidden"
              >
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,oklch(0.54_0.24_285/0.10),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="relative font-semibold text-sm group-hover:text-primary transition-colors">{set.name}</p>
                <p className="relative text-xs text-muted-foreground mt-1">{set.series}</p>
                <p className="relative text-xs font-semibold text-primary/50 group-hover:text-primary transition-colors mt-2.5">
                  {set._count.products} products
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ───────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <p className="text-sm text-muted-foreground mt-1">Latest additions to the store</p>
          </div>
          {products.length > 0 && (
            <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 pb-0.5">
              View all <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product: (typeof products)[number]) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/50 rounded-2xl bg-card/20 text-center">
            <div className="relative w-20 h-20 mb-5 opacity-25">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="font-semibold text-foreground/60">No products yet</p>
            <p className="text-sm text-muted-foreground mt-1">Check back soon — stock drops regularly.</p>
          </div>
        )}
      </section>

      {/* ── Marketplace CTA ──────────────────────────────────────────────── */}
      <section className="p-px rounded-2xl bg-gradient-to-br from-primary/40 via-border/60 to-border/30">
        <div className="relative overflow-hidden bg-card rounded-[calc(1rem-1px)] p-10 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_50%_50%,oklch(0.54_0.24_285/0.09),transparent_70%)]" />
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt=""
              fill
              className="object-contain drop-shadow-[0_0_18px_oklch(0.54_0.24_285/0.65)]"
              unoptimized
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">Have cards to sell or trade?</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            List your single cards and connect with other trainers on the marketplace.
          </p>
          <Link href="/marketplace">
            <Button className="gap-2 shadow-[0_0_20px_oklch(0.54_0.24_285/0.4)]">
              Visit the Marketplace
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
