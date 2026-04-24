import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getAllSets } from "@/lib/queries/sets";
import { getActivityFeed } from "@/lib/queries/activity";
import { getListings } from "@/lib/queries/marketplace";
import { getSiteStats } from "@/lib/queries/stats";
import { ProductCard } from "@/components/ProductCard";
import { HeroSeance } from "@/components/ghost/HeroSeance";
import { LiveTicker } from "@/components/ghost/LiveTicker";
import { SectionEyebrow } from "@/components/ghost/SectionEyebrow";
import { GhostCard } from "@/components/ghost/GhostCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [products, sets, activity, stats, marketPreview] = await Promise.all([
    getFeaturedProducts(8),
    getAllSets(),
    getActivityFeed(10),
    getSiteStats(),
    getListings({ limit: 6, sort: "newest" }),
  ]);

  const featuredSet = sets[0];
  const restSets    = sets.slice(1, 7);

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <HeroSeance stats={stats} />

      {/* ── 2. Live ticker ────────────────────────────────────────────────── */}
      {activity.length > 0 && (
        <div className="-mx-6 sm:-mx-8">
          <LiveTicker
            items={activity.map((a) => ({
              id:          a.id,
              type:        a.type,
              cardName:    a.cardName,
              cardImage:   a.cardImage,
              price:       a.type === "listing" ? a.price : null,
              sellerName:  a.sellerName,
              offererName: a.type === "trade" ? a.offererName : null,
            }))}
          />
        </div>
      )}

      {/* ── 3. Featured set — diagonal hero strip ─────────────────────────── */}
      {featuredSet && (
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionEyebrow sigil="◈" accent="cyan">Current Set</SectionEyebrow>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.035em]">
                Freshly summoned
              </h2>
            </div>
            <Link
              href="/sets"
              className="group text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-[oklch(0.78_0.2_295)] transition-colors inline-flex items-center gap-1.5"
            >
              All sets
              <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Featured set — asymmetric split */}
          <Link
            href={`/sets/${featuredSet.slug}`}
            className="group relative block overflow-hidden rounded-[2rem] border border-[oklch(0.55_0.25_295/0.22)] isolate"
          >
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[oklch(0.14_0.10_295)] via-[oklch(0.10_0.06_290)] to-[oklch(0.08_0.04_285)]" />
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_80%_50%,oklch(0.55_0.25_295/0.38),transparent_60%)]" />
            <div aria-hidden className="absolute inset-0 pattern-seance opacity-40" />

            {/* Watermark symbol — tilted, huge */}
            {featuredSet.symbolUrl && (
              <div aria-hidden className="absolute -right-10 -bottom-10 w-[360px] h-[360px] rotate-12 opacity-20 group-hover:opacity-30 group-hover:rotate-[18deg] transition-all duration-700">
                <Image src={featuredSet.symbolUrl} alt="" fill className="object-contain" unoptimized />
              </div>
            )}

            <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-8 p-8 sm:p-12 lg:p-16 min-h-[340px]">
              <div className="flex flex-col justify-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[oklch(0.82_0.15_215)] mb-3">
                  {featuredSet.series}
                </p>
                <h3 className="font-display text-3xl sm:text-5xl leading-[1] tracking-[-0.04em] mb-4 group-hover:translate-x-1 transition-transform duration-700">
                  {featuredSet.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="font-mono text-foreground/80">{featuredSet._count.products}</span>
                  <span>products</span>
                  <span className="opacity-40">·</span>
                  <span className="font-mono text-foreground/80">
                    {new Date(featuredSet.releaseDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm text-[oklch(0.82_0.15_215)] group-hover:text-[oklch(0.88_0.15_215)] transition-colors">
                  Enter the set <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              {/* Logo panel */}
              {featuredSet.logoUrl && (
                <div className="relative hidden sm:block">
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.25_295/0.35),transparent_70%)] blur-2xl animate-pulse-glow" />
                  <div className="relative h-full flex items-center justify-center">
                    <div className="relative w-full h-40 drop-shadow-[0_8px_32px_oklch(0_0_0/0.6)] group-hover:scale-105 transition-transform duration-700">
                      <Image src={featuredSet.logoUrl} alt={featuredSet.name} fill className="object-contain" unoptimized priority />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Link>

          {/* Rest of sets — asymmetric tile strip */}
          {restSets.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger">
              {restSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/sets/${set.slug}`}
                  className="group relative flex flex-col bg-[oklch(0.10_0.04_285)] border border-[oklch(0.22_0.08_285)] rounded-2xl overflow-hidden hover:border-[oklch(0.55_0.25_295/0.5)] hover:-translate-y-0.5 transition-all duration-500"
                >
                  <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.55_0.25_295/0.14),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-16 flex items-center justify-center border-b border-border/40 bg-gradient-to-b from-[oklch(0.12_0.06_285)] to-transparent">
                    {set.logoUrl ? (
                      <div className="relative w-24 h-10">
                        <Image src={set.logoUrl} alt={set.name} fill className="object-contain" unoptimized />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{set.name}</span>
                    )}
                  </div>
                  <div className="relative px-3 py-2.5">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-[oklch(0.78_0.2_295)]/80 mb-0.5">{set.series}</p>
                    <p className="text-[11px] font-semibold leading-tight group-hover:text-[oklch(0.88_0.15_215)] transition-colors line-clamp-2">{set.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/70 mt-1">{set._count.products} items</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. Featured packs ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <SectionEyebrow sigil="✧" accent="violet">Shop shelf</SectionEyebrow>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.035em]">Sealed &amp; ready</h2>
          </div>
          {products.length > 0 && (
            <Link
              href="/shop"
              className="group text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-[oklch(0.78_0.2_295)] transition-colors inline-flex items-center gap-1.5"
            >
              Every pack <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {products.map((product: (typeof products)[number]) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyGhost title="The shelves are bare…" subtitle="Stock is being summoned. Check back soon." />
        )}
      </section>

      {/* ── 5. Marketplace preview — trending listings ────────────────────── */}
      {marketPreview.listings.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <SectionEyebrow sigil="◇" accent="cyan">From trainers&apos; binders</SectionEyebrow>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-[-0.035em]">Singles on the wire</h2>
            </div>
            <Link
              href="/marketplace"
              className="group text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-[oklch(0.78_0.2_295)] transition-colors inline-flex items-center gap-1.5"
            >
              Open marketplace <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 stagger">
            {marketPreview.listings.slice(0, 6).map((listing) => {
              const card = listing.userCard.card;
              return (
                <GhostCard key={listing.id} glow={1} accent="violet" className="overflow-hidden">
                  <Link href={`/marketplace/${listing.id}`} className="block">
                    <div className="aspect-[2/3] relative bg-gradient-to-b from-[oklch(0.12_0.05_285)] to-[oklch(0.08_0.04_285)] overflow-hidden">
                      {card.imageSmall ? (
                        <Image src={card.imageSmall} alt={card.name} fill className="object-contain p-3 transition-transform duration-700 group-hover/ghostcard:scale-[1.05]" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs">No image</div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] bg-[oklch(0.14_0.08_290/0.85)] backdrop-blur-sm border border-[oklch(0.55_0.25_295/0.35)] text-[oklch(0.85_0.1_295)]">
                          {listing.listingType === "TRADE_OR_SALE" ? "T / S" : listing.listingType === "TRADE" ? "Trade" : "Sale"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <p className="text-[9px] uppercase tracking-[0.22em] text-[oklch(0.78_0.2_295)]/80 mb-0.5">{card.tcgSet.name}</p>
                      <p className="text-sm font-semibold truncate">{card.name}</p>
                      <div className="mt-2 flex items-baseline justify-between">
                        {listing.askingPrice ? (
                          <span className="font-mono text-lg text-[oklch(0.85_0.16_88)] tabular-nums">
                            €{Number(listing.askingPrice).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">Trade only</span>
                        )}
                        <span className="text-[10px] text-muted-foreground/70">by {listing.seller.name ?? listing.seller.email.split("@")[0]}</span>
                      </div>
                    </div>
                  </Link>
                </GhostCard>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 6. Sell CTA — haunted invitation ──────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-[oklch(0.55_0.25_295/0.28)]">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[oklch(0.12_0.08_295)] via-[oklch(0.09_0.05_290)] to-[oklch(0.07_0.04_285)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_100%_at_0%_50%,oklch(0.55_0.25_295/0.3),transparent_70%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_100%_at_100%_50%,oklch(0.74_0.15_220/0.18),transparent_70%)]" />
        <div aria-hidden className="absolute inset-0 pattern-seance opacity-40" />

        <div className="relative grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-8 p-10 sm:p-16 items-center">
          <div>
            <SectionEyebrow sigil="✦" accent="magenta">Your binder · our shelf</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl leading-[1.05] tracking-[-0.035em] mb-4">
              <span className="ghost-text">Spirits</span> in your collection<br />
              deserve a stage.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
              List a single card in sixty seconds. Cash sales, trades, or both. Dual-confirm trades keep it honest.
              XP, badges, referral bonuses — the séance rewards regulars.
            </p>
            <Link href="/marketplace/new">
              <Button
                size="lg"
                className="gap-2 h-12 px-6 bg-[oklch(0.55_0.25_295)] hover:bg-[oklch(0.60_0.25_295)] shadow-[0_0_32px_oklch(0.55_0.25_295/0.6),inset_0_1px_0_oklch(1_0_0/0.15)]"
              >
                List a card
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          {/* Decorative tarot-like card stack */}
          <div aria-hidden className="relative h-56 hidden sm:block">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-32 h-48 rounded-2xl bg-gradient-to-br from-[oklch(0.18_0.1_290)] to-[oklch(0.10_0.06_285)] border border-[oklch(0.55_0.25_295/0.4)] shadow-[0_20px_50px_-10px_oklch(0_0_0/0.6)]"
                style={{
                  transform: `translate(-50%, -50%) rotate(${(i - 1) * 9}deg) translateY(${(i - 1) * -4}px)`,
                  zIndex: 10 - i,
                  background:
                    i === 1
                      ? "linear-gradient(145deg, oklch(0.22 0.14 295), oklch(0.10 0.06 285))"
                      : undefined,
                }}
              >
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.55_0.25_295/0.3),transparent_70%)]" />
                <div className="absolute inset-0 rounded-2xl pattern-seance opacity-40" />
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-[oklch(0.78_0.2_295)]">
                  ✦ Séance ✦
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyGhost({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-[oklch(0.55_0.25_295/0.25)] bg-[oklch(0.08_0.04_285/0.4)] py-24 text-center">
      <div aria-hidden className="absolute inset-0 pattern-seance opacity-30" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="relative w-20 h-20 opacity-60">
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt=""
            fill
            className="object-contain animate-float drop-shadow-[0_0_16px_oklch(0.55_0.25_295/0.6)]"
            unoptimized
          />
        </div>
        <p className="font-display text-xl text-foreground/80">{title}</p>
        <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>
      </div>
    </div>
  );
}
