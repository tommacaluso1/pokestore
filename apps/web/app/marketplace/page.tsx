import Link from "next/link";
import { Suspense } from "react";
import { Plus, Inbox, List } from "lucide-react";
import { auth } from "@/auth";
import { getListings, getMarketplaceSets } from "@/lib/queries/marketplace";
import { getActivityFeed } from "@/lib/queries/activity";
import { MarketplaceFilters } from "@/components/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { LiveTicker } from "@/components/ghost/LiveTicker";
import { SectionEyebrow } from "@/components/ghost/SectionEyebrow";
import { GlowButton } from "@/components/ghost/GlowButton";
import { Button } from "@/components/ui/button";
import type { ListingType, CardCondition } from "@repo/db";
import type { SortOption } from "@/lib/queries/marketplace";

export const metadata = { title: "Marketplace — PokéStore" };

type Props = {
  searchParams: Promise<{
    type?: string;
    q?: string;
    setId?: string;
    condition?: string;
    sort?: string;
  }>;
};

const SORT_LABELS: Record<SortOption, string> = {
  newest:     "Newest",
  price_asc:  "Low → High",
  price_desc: "High → Low",
};

export default async function MarketplacePage({ searchParams }: Props) {
  const { type, q, setId, condition, sort } = await searchParams;
  const session = await auth();

  const validSort = (["newest", "price_asc", "price_desc"] as SortOption[]).includes(sort as SortOption)
    ? (sort as SortOption)
    : "newest";

  const filters = {
    type:      type      as ListingType    | undefined,
    condition: condition as CardCondition  | undefined,
    q:         q         || undefined,
    setId:     setId     || undefined,
    sort:      validSort,
    limit:     50,
  };

  const [initialData, sets, activity] = await Promise.all([
    getListings(filters),
    getMarketplaceSets(),
    getActivityFeed(10),
  ]);

  return (
    <div className="space-y-8">
      {/* ── Header — oversized title, eyebrow, stats ──────────────────────── */}
      <header className="relative overflow-hidden rounded-[2rem] border border-[oklch(0.55_0.25_295/0.22)] isolate">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[oklch(0.12_0.08_295)] via-[oklch(0.08_0.05_290)] to-[oklch(0.06_0.03_285)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_100%,oklch(0.55_0.25_295/0.28),transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_0%,oklch(0.74_0.15_220/0.18),transparent_70%)]" />
        <div aria-hidden className="absolute inset-0 pattern-seance opacity-40" />

        <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 sm:p-10">
          <div>
            <SectionEyebrow sigil="◈" accent="cyan">
              {initialData.total} live · summoned by trainers
            </SectionEyebrow>
            <h1 className="mt-3 font-display text-5xl sm:text-6xl lg:text-7xl tracking-[-0.04em] leading-[0.92]">
              The <span className="ghost-text italic font-normal">Marketplace</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
              Every card here is in somebody&apos;s hand right now. Peek, offer, confirm — and the spirits take care of the rest.
              {q && <span className="block mt-1 text-foreground/80">Searching: <span className="font-mono text-[oklch(0.88_0.12_295)]">&ldquo;{q}&rdquo;</span></span>}
            </p>
          </div>

          {session?.user && (
            <div className="flex flex-wrap gap-2">
              <Link href="/marketplace/my-offers">
                <Button variant="outline" size="sm" className="gap-1.5 bg-[oklch(0.10_0.06_290/0.5)] border-[oklch(0.55_0.25_295/0.25)] hover:bg-[oklch(0.14_0.08_290/0.7)] hover:border-[oklch(0.55_0.25_295/0.5)]">
                  <Inbox className="size-3.5" />
                  My offers
                </Button>
              </Link>
              <Link href="/marketplace/my-listings">
                <Button variant="outline" size="sm" className="gap-1.5 bg-[oklch(0.10_0.06_290/0.5)] border-[oklch(0.55_0.25_295/0.25)] hover:bg-[oklch(0.14_0.08_290/0.7)] hover:border-[oklch(0.55_0.25_295/0.5)]">
                  <List className="size-3.5" />
                  My listings
                </Button>
              </Link>
              <Link href="/marketplace/new">
                <GlowButton size="sm" className="gap-1.5 h-8 px-3">
                  <Plus className="size-3.5" />
                  New listing
                </GlowButton>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ── Live ticker ──────────────────────────────────────────────────── */}
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

      {/* ── Filters + Sort ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Suspense fallback={<div className="h-24 rounded-2xl bg-[oklch(0.10_0.05_290/0.5)] border border-[oklch(0.22_0.08_285)] animate-pulse" />}>
          <MarketplaceFilters sets={sets} />
        </Suspense>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Sort</span>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[oklch(0.08_0.04_285/0.6)] border border-[oklch(0.22_0.08_285/0.6)] backdrop-blur-sm">
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => {
              const params = new URLSearchParams({
                ...(type      && { type }),
                ...(q         && { q }),
                ...(setId     && { setId }),
                ...(condition && { condition }),
                sort: key,
              });
              const isActive = validSort === key;
              return (
                <Link
                  key={key}
                  href={`/marketplace?${params}`}
                  className={`text-[11px] px-3 py-1.5 rounded-lg transition-all font-medium ${
                    isActive
                      ? "bg-[oklch(0.55_0.25_295)] text-white shadow-[0_0_16px_-2px_oklch(0.55_0.25_295/0.6)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.14_0.08_290/0.6)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <MarketplaceGrid
        key={`${type ?? ""}_${condition ?? ""}_${setId ?? ""}_${q ?? ""}_${validSort}`}
        initialData={initialData}
        filters={filters}
      />

      {initialData.total === 0 && session?.user && !q && !type && !setId && !condition && (
        <div className="flex justify-center mt-4">
          <Link href="/marketplace/new">
            <GlowButton>Be the first to list</GlowButton>
          </Link>
        </div>
      )}
    </div>
  );
}
