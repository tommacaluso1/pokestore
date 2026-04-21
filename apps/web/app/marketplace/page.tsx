import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { auth } from "@/auth";
import { getListings } from "@/lib/queries/marketplace";
import { MarketplaceFilters } from "@/components/MarketplaceFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingType } from "@repo/db";

export const metadata = { title: "Marketplace — PokéStore" };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "Near Mint", LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Mod. Played", HEAVILY_PLAYED: "Heavily Played", DAMAGED: "Damaged",
};

const TYPE_LABELS: Record<string, string> = {
  TRADE: "Trade", SALE: "Sale", TRADE_OR_SALE: "Trade or Sale",
};

const TYPE_COLOR: Record<string, "default" | "secondary" | "outline"> = {
  TRADE: "secondary", SALE: "default", TRADE_OR_SALE: "outline",
};

type Props = { searchParams: Promise<{ type?: string }> };

export default async function MarketplacePage({ searchParams }: Props) {
  const { type } = await searchParams;
  const session = await auth();

  const listings = await getListings({ type: type as ListingType | undefined });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-2">
            {listings.length} active listing{listings.length !== 1 ? "s" : ""}
            {type ? ` · ${TYPE_LABELS[type] ?? type}` : ""}
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

      {/* Filters — client component, wraps useSearchParams */}
      <Suspense fallback={
        <div className="flex gap-2 mb-8 p-4 bg-card border border-border rounded-xl animate-pulse">
          <div className="h-8 w-24 bg-secondary rounded-lg" />
          <div className="h-8 w-20 bg-secondary rounded-lg" />
          <div className="h-8 w-28 bg-secondary rounded-lg" />
          <div className="h-8 w-28 bg-secondary rounded-lg" />
        </div>
      }>
        <MarketplaceFilters />
      </Suspense>

      {listings.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border/50 rounded-2xl text-muted-foreground">
          <p className="text-base font-medium">No listings found</p>
          <p className="text-sm mt-1">
            {type ? "Try a different filter." : "Be the first to list a card."}
          </p>
          {session?.user && !type && (
            <Link href="/marketplace/new" className="mt-4 inline-block">
              <Button>Create a listing</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => {
            const card = listing.userCard.card;
            const condition = listing.userCard.condition;

            return (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.id}`}
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_18px_oklch(0.54_0.24_285/0.10)] transition-all duration-200 flex flex-col"
              >
                {/* Card image — portrait */}
                {card.imageSmall ? (
                  <div className="aspect-[2/3] relative bg-black/20">
                    <Image
                      src={card.imageSmall}
                      alt={card.name}
                      fill
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-secondary/30 flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}

                {/* Info */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div>
                    <p className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {card.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {card.tcgSet.name} · {CONDITION_LABELS[condition] ?? condition}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-1">
                    <Badge variant={TYPE_COLOR[listing.listingType] ?? "outline"} className="text-xs">
                      {TYPE_LABELS[listing.listingType] ?? listing.listingType}
                    </Badge>
                    {listing.askingPrice ? (
                      <span className="font-bold text-sm text-primary">
                        €{Number(listing.askingPrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Trade only</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
