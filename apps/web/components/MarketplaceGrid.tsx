"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchMoreListings } from "@/lib/actions/marketplace";
import type { ListingFilters, ListingsPage, ListingRow } from "@/lib/queries/marketplace";

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

function ListingCard({ listing }: { listing: ListingRow }) {
  const card = listing.userCard.card;
  const condition = listing.userCard.condition;

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_18px_oklch(0.54_0.24_285/0.10)] transition-all duration-200 flex flex-col"
    >
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

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {card.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {card.tcgSet.name} · {CONDITION_LABELS[condition] ?? condition}
          </p>
          {card.rarity && (
            <p className="text-xs text-muted-foreground/70 truncate">{card.rarity}</p>
          )}
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
}

type Props = {
  initialData: ListingsPage;
  filters: Omit<ListingFilters, "cursor">;
};

export function MarketplaceGrid({ initialData, filters }: Props) {
  const [listings, setListings] = useState<ListingRow[]>(initialData.listings);
  const [cursor, setCursor] = useState<string | null>(initialData.nextCursor);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor || isPending) return;
    startTransition(async () => {
      const page = await fetchMoreListings({ ...filters, cursor });
      setListings((prev) => [...prev, ...page.listings]);
      setCursor(page.nextCursor);
      setHasMore(page.hasMore);
    });
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-border/50 rounded-2xl text-muted-foreground">
        <p className="text-base font-medium">No listings found</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isPending}
            className="gap-2 min-w-36"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
