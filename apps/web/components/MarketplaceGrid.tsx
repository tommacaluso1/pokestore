"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { fetchMoreListings } from "@/lib/actions/marketplace";
import type { ListingFilters, ListingsPage, ListingRow } from "@/lib/queries/marketplace";

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint",
  NEAR_MINT: "Near Mint",
  LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP",
  HEAVILY_PLAYED: "HP",
  DAMAGED: "Damaged",
};

const TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  TRADE:        { label: "Trade",         cls: "bg-violet-500/15 text-violet-300 border-violet-500/20" },
  SALE:         { label: "Sale",          cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  TRADE_OR_SALE:{ label: "Trade or Sale", cls: "bg-sky-500/15 text-sky-300 border-sky-500/20" },
};

function ListingCard({ listing }: { listing: ListingRow }) {
  const router    = useRouter();
  const card      = listing.userCard.card;
  const condition = listing.userCard.condition;
  const typeInfo  = TYPE_STYLES[listing.listingType] ?? { label: listing.listingType, cls: "bg-secondary text-foreground border-border" };
  const sellerName = listing.seller.name ?? listing.seller.email.split("@")[0];

  return (
    <div
      onClick={() => router.push(`/marketplace/${listing.id}`)}
      className="group relative flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-[0_4px_24px_oklch(0.54_0.24_285/0.12)] transition-all duration-200 cursor-pointer"
    >
      {/* Card image */}
      <div className="aspect-[2/3] relative bg-gradient-to-b from-secondary/20 to-secondary/40 overflow-hidden">
        {card.imageSmall ? (
          <Image
            src={card.imageSmall}
            alt={card.name}
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs tracking-wide">
            No image
          </div>
        )}

        {/* Listing type badge — top right overlay */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.cls}`}>
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* Card info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="font-semibold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {card.name}
        </p>

        <p className="text-xs text-muted-foreground truncate">
          {card.tcgSet.name}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/30">
          <span className="text-xs text-muted-foreground/80">
            {CONDITION_LABELS[condition] ?? condition}
            {listing.userCard.foil && (
              <span className="ml-1 text-amber-400/80">✦</span>
            )}
          </span>

          {listing.askingPrice ? (
            <span className="font-bold text-sm text-primary">
              €{Number(listing.askingPrice).toFixed(2)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Trade only</span>
          )}
        </div>

        {/* Seller link */}
        <Link
          href={`/profile/${listing.seller.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground truncate transition-colors pt-1"
        >
          {sellerName}
        </Link>
      </div>
    </div>
  );
}

type Props = {
  initialData: ListingsPage;
  filters: Omit<ListingFilters, "cursor">;
};

export function MarketplaceGrid({ initialData, filters }: Props) {
  const [listings, setListings] = useState<ListingRow[]>(initialData.listings);
  const [cursor,   setCursor]   = useState<string | null>(initialData.nextCursor);
  const [hasMore,  setHasMore]  = useState(initialData.hasMore);
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
      <div className="flex flex-col items-center justify-center py-28 border border-dashed border-border/40 rounded-2xl text-center gap-2">
        <p className="text-base font-semibold text-foreground/80">No listings found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border/60 bg-card text-sm font-medium text-foreground/80 hover:text-foreground hover:border-primary/40 hover:bg-secondary/40 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                Load more
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
