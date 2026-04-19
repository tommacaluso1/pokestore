import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles } from "lucide-react";
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
    <div className="space-y-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 overflow-hidden rounded-2xl">
        {/* Purple glow layers */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,oklch(0.54_0.24_285/0.25),transparent_70%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_30%_at_50%_-5%,oklch(0.68_0.20_295/0.15),transparent_60%)]" />

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
          {/* Text side */}
          <div className="flex-1 text-center lg:text-left lg:pl-8">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <Sparkles className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Authentic sealed products</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
              The ultimate<br />
              <span className="bg-gradient-to-r from-primary via-[oklch(0.68_0.20_295)] to-primary bg-clip-text text-transparent">
                Pokémon TCG
              </span>{" "}
              shop
            </h1>

            <p className="text-muted-foreground text-lg max-w-md mx-auto lg:mx-0 mb-8">
              Booster packs, Elite Trainer Boxes, and full booster boxes — every set, every format.
            </p>

            <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
              <Link href="/shop">
                <Button size="lg" className="gap-2">
                  <Sparkles className="size-4" />
                  Shop now
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline">
                  Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Gengar */}
          <div className="relative shrink-0 w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
            {/* Glow beneath Gengar */}
            <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1/3 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.54_0.24_285/0.5),transparent_70%)] blur-2xl" />
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
              fill
              className="object-contain drop-shadow-[0_0_40px_oklch(0.54_0.24_285/0.6)] animate-[float_4s_ease-in-out_infinite]"
              unoptimized
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Sets grid ────────────────────────────────────────────────────── */}
      {sets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Browse by Set</h2>
            <Link href="/sets" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              All sets <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sets.slice(0, 8).map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.slug}`}
                className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-card/80 transition-all text-center"
              >
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{set.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{set.series}</p>
                <p className="text-xs font-medium text-primary/70 group-hover:text-primary transition-colors mt-2">
                  {set._count.products} products
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured products ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">New Arrivals</h2>
          <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            View all <ChevronRight className="size-3.5" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground border border-border/50 rounded-2xl">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
                alt="Gengar"
                fill
                className="object-contain opacity-30"
                unoptimized
              />
            </div>
            <p className="font-medium">No products yet</p>
            <p className="text-sm mt-1">Add some from the admin panel.</p>
          </div>
        )}
      </section>

      {/* ── Marketplace CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-card border border-border rounded-2xl p-8 text-center">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,oklch(0.54_0.24_285/0.08),transparent_70%)]" />
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt="Gengar"
            fill
            className="object-contain drop-shadow-[0_0_12px_oklch(0.54_0.24_285/0.6)]"
            unoptimized
          />
        </div>
        <h2 className="text-xl font-bold mb-2">Have cards to sell or trade?</h2>
        <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
          List your single cards and connect with other trainers on the marketplace.
        </p>
        <Link href="/marketplace">
          <Button variant="outline">Visit the Marketplace</Button>
        </Link>
      </section>

    </div>
  );
}
