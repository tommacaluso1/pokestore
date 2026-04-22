import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getListings, getMarketplaceSets } from "@/lib/queries/marketplace";
import { MarketplaceFilters } from "@/components/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { Button } from "@/components/ui/button";
import type { ListingType, CardCondition } from "@repo/db";

export const metadata = { title: "Marketplace — PokéStore" };

type Props = {
  searchParams: Promise<{
    type?: string;
    q?: string;
    setId?: string;
    condition?: string;
  }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const { type, q, setId, condition } = await searchParams;
  const session = await auth();

  const filters = {
    type:      type      as ListingType    | undefined,
    condition: condition as CardCondition  | undefined,
    q:         q         || undefined,
    setId:     setId     || undefined,
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

      {/* Filters */}
      <Suspense fallback={
        <div className="flex gap-2 mb-8 p-4 bg-card border border-border rounded-xl animate-pulse h-24" />
      }>
        <MarketplaceFilters sets={sets} />
      </Suspense>

      {/* Grid with load-more */}
      <MarketplaceGrid initialData={initialData} filters={filters} />

      {/* Empty CTA for no filters + logged in */}
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
