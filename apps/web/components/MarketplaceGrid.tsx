"use client";

import { useState, useTransition, useRef, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Sparkles, Eye, ShieldCheck } from "lucide-react";
import { fetchMoreListings } from "@/lib/actions/marketplace";
import type { ListingFilters, ListingsPage, ListingRow } from "@/lib/queries/marketplace";
import {
  CONDITION_LABELS_SHORT as CONDITION_LABELS,
  LISTING_TYPE_STYLES as TYPE_STYLES,
} from "@/lib/marketplace/labels";
import { cn } from "@/lib/utils";

// ─── Rarity / condition visual tiering ───────────────────────────────────

type RarityTier = "common" | "uncommon" | "rare" | "ultra";

function rarityTier(rarity: string | null): RarityTier {
  if (!rarity) return "common";
  const r = rarity.toLowerCase();
  if (/(illustration|secret|hyper|ultra|shiny|vmax|gold)/.test(r)) return "ultra";
  if (/rare/.test(r)) return "rare";
  if (/uncommon/.test(r)) return "uncommon";
  return "common";
}

const RARITY_META: Record<RarityTier, { label: string; sigil: string; cls: string; ringGlow: string }> = {
  common: {
    label: "Common", sigil: "●",
    cls: "text-[oklch(0.72_0.06_285)] border-[oklch(0.40_0.08_285/0.4)] bg-[oklch(0.20_0.06_285/0.35)]",
    ringGlow: "group-hover/lc:shadow-[0_10px_32px_-8px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.40_0.08_285/0.3)]",
  },
  uncommon: {
    label: "Uncommon", sigil: "◆",
    cls: "text-[oklch(0.82_0.16_150)] border-[oklch(0.55_0.16_150/0.4)] bg-[oklch(0.30_0.12_150/0.3)]",
    ringGlow: "group-hover/lc:shadow-[0_12px_36px_-8px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.55_0.16_150/0.35),0_0_32px_-8px_oklch(0.55_0.16_150/0.35)]",
  },
  rare: {
    label: "Rare", sigil: "★",
    cls: "text-[oklch(0.88_0.12_215)] border-[oklch(0.74_0.15_220/0.4)] bg-[oklch(0.30_0.14_220/0.3)]",
    ringGlow: "group-hover/lc:shadow-[0_14px_40px_-8px_oklch(0_0_0/0.55),0_0_0_1px_oklch(0.74_0.15_220/0.4),0_0_48px_-8px_oklch(0.74_0.15_220/0.5)]",
  },
  ultra: {
    label: "Ultra Rare", sigil: "✦",
    cls: "text-[oklch(0.90_0.14_88)] border-[oklch(0.82_0.16_88/0.45)] bg-[oklch(0.30_0.14_88/0.3)]",
    ringGlow: "group-hover/lc:shadow-[0_16px_48px_-8px_oklch(0_0_0/0.55),0_0_0_1px_oklch(0.82_0.16_88/0.5),0_0_64px_-8px_oklch(0.82_0.16_88/0.55)]",
  },
};

const CONDITION_META: Record<string, { cls: string; label: string }> = {
  MINT:              { cls: "text-[oklch(0.88_0.15_88)] bg-[oklch(0.82_0.16_88/0.15)] border-[oklch(0.82_0.16_88/0.35)]",   label: "MT" },
  NEAR_MINT:         { cls: "text-[oklch(0.86_0.16_150)] bg-[oklch(0.55_0.16_150/0.12)] border-[oklch(0.55_0.16_150/0.32)]", label: "NM" },
  LIGHTLY_PLAYED:    { cls: "text-[oklch(0.82_0.16_100)] bg-[oklch(0.65_0.16_100/0.12)] border-[oklch(0.65_0.16_100/0.3)]",  label: "LP" },
  MODERATELY_PLAYED: { cls: "text-[oklch(0.78_0.18_65)] bg-[oklch(0.62_0.18_65/0.12)] border-[oklch(0.62_0.18_65/0.3)]",    label: "MP" },
  HEAVILY_PLAYED:    { cls: "text-[oklch(0.72_0.20_40)] bg-[oklch(0.58_0.20_40/0.12)] border-[oklch(0.58_0.20_40/0.3)]",    label: "HP" },
  DAMAGED:           { cls: "text-[oklch(0.72_0.22_25)] bg-[oklch(0.55_0.22_25/0.14)] border-[oklch(0.55_0.22_25/0.32)]",   label: "DMG" },
};

// ────────────────────────────────────────────────────────────────────────

function ListingCard({ listing }: { listing: ListingRow }) {
  const router = useRouter();
  const card = listing.userCard.card;
  const condition = listing.userCard.condition;
  const typeInfo = TYPE_STYLES[listing.listingType] ?? { label: listing.listingType, cls: "bg-secondary text-foreground border-border" };
  const sellerName = listing.seller.name ?? listing.seller.email.split("@")[0];
  const tier = rarityTier(card.rarity);
  const rMeta = RARITY_META[tier];
  const cMeta = CONDITION_META[condition] ?? { cls: "text-muted-foreground bg-secondary border-border", label: CONDITION_LABELS[condition] ?? condition };
  const isFoil = listing.userCard.foil;

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    ref.current.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
    ref.current.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/marketplace/${listing.id}`)}
      style={{ transformStyle: "preserve-3d" } as React.CSSProperties}
      className={cn(
        "group/lc relative flex flex-col rounded-2xl overflow-hidden cursor-pointer",
        "bg-[oklch(0.10_0.04_285)] border border-[oklch(0.22_0.08_285)]",
        "[transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-[oklch(0.55_0.25_295/0.5)] hover:-translate-y-0.5",
        rMeta.ringGlow,
      )}
    >
      {/* Rim light that matches rarity */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-8 top-0 h-px",
          tier === "common"   && "bg-gradient-to-r from-transparent via-[oklch(0.55_0.14_285/0.5)] to-transparent",
          tier === "uncommon" && "bg-gradient-to-r from-transparent via-[oklch(0.65_0.16_150/0.6)] to-transparent",
          tier === "rare"     && "bg-gradient-to-r from-transparent via-[oklch(0.74_0.15_220/0.7)] to-transparent",
          tier === "ultra"    && "bg-gradient-to-r from-transparent via-[oklch(0.82_0.16_88/0.8)] to-transparent",
        )}
      />

      {/* Cursor-tracked inner bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/lc:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_35%_45%_at_var(--mx,50%)_var(--my,50%),oklch(0.55_0.25_295/0.2),transparent_70%)]"
      />

      {/* Card image arena */}
      <div className="aspect-[2/3] relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[oklch(0.14_0.08_290)] via-[oklch(0.10_0.05_285)] to-[oklch(0.08_0.04_285)]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_100%,oklch(0.55_0.25_295/0.25),transparent_60%)]" />
        <div aria-hidden className="absolute inset-0 pattern-seance opacity-30" />

        {card.imageSmall ? (
          <Image
            src={card.imageSmall}
            alt={card.name}
            fill
            className="relative object-contain p-3 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/lc:scale-[1.06] drop-shadow-[0_8px_24px_oklch(0_0_0/0.5)]"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xs tracking-wide relative">
            No image
          </div>
        )}

        {/* Foil shimmer overlay */}
        {isFoil && (
          <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30 group-hover/lc:opacity-60 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[oklch(0.82_0.16_88/0.3)] to-transparent [background-size:200%_200%] animate-[shimmer_3s_linear_infinite]" />
          </div>
        )}

        {/* Listing type badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md border", typeInfo.cls)}>
            {typeInfo.label}
          </span>
        </div>

        {/* Rarity tier — top-left, sigil + label */}
        <div className="absolute top-2 left-2 z-10">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md border", rMeta.cls)}>
            <span aria-hidden>{rMeta.sigil}</span>
            {rMeta.label}
          </span>
        </div>

        {/* Foil chip */}
        {isFoil && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[oklch(0.90_0.14_88)] bg-[oklch(0.30_0.14_88/0.4)] border border-[oklch(0.82_0.16_88/0.5)] backdrop-blur-md">
              <Sparkles className="size-2.5" />
              Foil
            </span>
          </div>
        )}

        {/* Quick peek CTA — reveals on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover/lc:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-10">
          <span className="flex items-center justify-center gap-1.5 w-full h-8 rounded-lg bg-[oklch(0.14_0.10_290/0.92)] backdrop-blur-md border border-[oklch(0.55_0.25_295/0.5)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.90_0.12_295)] shadow-[0_8px_24px_-4px_oklch(0_0_0/0.5),0_0_24px_-4px_oklch(0.55_0.25_295/0.5)]">
            <Eye className="size-3" />
            Peek the details
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="relative p-3.5 flex flex-col gap-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.78_0.2_295)]/80 truncate">
          {card.tcgSet.name}
        </p>
        <p className="font-semibold text-sm leading-snug text-foreground line-clamp-2 group-hover/lc:text-[oklch(0.95_0.04_295)] transition-colors">
          {card.name}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[oklch(0.22_0.08_285/0.6)]">
          <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold border", cMeta.cls)}>
            <ShieldCheck className="size-2.5" />
            {cMeta.label}
          </span>

          {listing.askingPrice ? (
            <span className="font-mono text-base font-semibold tabular-nums text-foreground group-hover/lc:text-[oklch(0.90_0.14_88)] transition-colors">
              €{Number(listing.askingPrice).toFixed(2)}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.78_0.2_295)]/80 font-semibold">Trade only</span>
          )}
        </div>

        <Link
          href={`/profile/${listing.seller.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-muted-foreground/60 hover:text-[oklch(0.78_0.2_295)] truncate transition-colors mt-0.5"
        >
          by {sellerName}
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
      <div className="relative overflow-hidden rounded-2xl border border-dashed border-[oklch(0.55_0.25_295/0.25)] bg-[oklch(0.08_0.04_285/0.4)] py-28 text-center">
        <div aria-hidden className="absolute inset-0 pattern-seance opacity-30" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,oklch(0.55_0.25_295/0.18),transparent_70%)]" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative w-20 h-20">
            <Image src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png" alt="" fill className="object-contain opacity-50 animate-float drop-shadow-[0_0_16px_oklch(0.55_0.25_295/0.6)]" unoptimized />
          </div>
          <p className="font-display text-xl text-foreground/80">No listings answer</p>
          <p className="text-sm text-muted-foreground max-w-sm">The séance is quiet here. Try loosening a filter — or be the first to list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="group/more relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[oklch(0.10_0.05_290/0.6)] backdrop-blur-sm border border-[oklch(0.55_0.25_295/0.3)] text-sm font-medium text-foreground/80 hover:text-foreground hover:border-[oklch(0.55_0.25_295/0.55)] hover:bg-[oklch(0.14_0.08_290/0.7)] hover:shadow-[0_0_24px_-4px_oklch(0.55_0.25_295/0.55)] transition-all disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Summoning more…
              </>
            ) : (
              <>
                Summon more
                <ArrowRight className="size-4 group-hover/more:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
