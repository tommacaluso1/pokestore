import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getListings, getMarketplaceSets } from "@/lib/queries/marketplace";
import { MarketplaceFilters } from "@/components/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
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
  newest:     "Newest first",
  price_asc:  "Price: low to high",
  price_desc: "Price: high to low",
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

  const [initialData, sets] = await Promise.all([
    getListings(filters),
    getMarketplaceSets(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {initialData.total} active listing{initialData.total !== 1 ? "s" : ""}
            {q ? ` · "${q}"` : ""}
          </p>
        </div>
        {session?.user && (
          <div className="flex gap-2">
            <Link href="/marketplace/my-offers">
              <Button variant="outline" size="sm">My offers</Button>
            </Link>
            <Link href="/marketplace/my-listings">
              <Button variant="outline" size="sm">My listings</Button>
            </Link>
            <Link href="/marketplace/new">
              <Button size="sm">+ New listing</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Sort:</span>
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
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <Suspense fallback={
        <div className="flex gap-2 mb-8 p-4 bg-card border border-border rounded-xl animate-pulse h-24" />
      }>
        <MarketplaceFilters sets={sets} />
      </Suspense>

      {/* Grid — key forces remount when filters/sort change so useState resets */}
      <MarketplaceGrid
        key={`${type ?? ""}_${condition ?? ""}_${setId ?? ""}_${q ?? ""}_${validSort}`}
        initialData={initialData}
        filters={filters}
      />

      {initialData.total === 0 && session?.user && !q && !type && !setId && !condition && (
        <div className="flex justify-center mt-4">
          <Link href="/marketplace/new">
            <Button>Create a listing</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
