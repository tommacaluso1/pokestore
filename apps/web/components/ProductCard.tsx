"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import { ShoppingCart, Plus, Sparkles, Layers, Package, Gift } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
import { PackModelClient } from "./PackModelClient";
import { cn } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    type: string;
    price: string | number | { toString(): string };
    stock: number;
    imageUrl: string | null;
    set: { name: string; slug: string; logoUrl?: string | null };
  };
};

const TYPE_META: Record<string, { label: string; Icon: typeof Sparkles; cls: string; dot: string; tier: "common" | "rare" | "legendary" | "special" }> = {
  PACK:   { label: "Pack",         Icon: Sparkles, cls: "text-[oklch(0.85_0.10_295)] border-[oklch(0.55_0.25_295/0.35)] bg-[oklch(0.55_0.25_295/0.1)]", dot: "bg-[oklch(0.55_0.25_295)]", tier: "common" },
  BOX:    { label: "Booster Box",  Icon: Layers,   cls: "text-[oklch(0.88_0.12_215)] border-[oklch(0.74_0.15_220/0.4)] bg-[oklch(0.74_0.15_220/0.1)]", dot: "bg-[oklch(0.74_0.15_220)]", tier: "rare" },
  ETB:    { label: "Elite Trainer",Icon: Package,  cls: "text-[oklch(0.88_0.14_88)] border-[oklch(0.82_0.16_88/0.4)]  bg-[oklch(0.82_0.16_88/0.1)]",  dot: "bg-[oklch(0.82_0.16_88)]",  tier: "legendary" },
  BUNDLE: { label: "Bundle",       Icon: Gift,     cls: "text-[oklch(0.82_0.20_335)] border-[oklch(0.66_0.28_335/0.4)] bg-[oklch(0.66_0.28_335/0.1)]", dot: "bg-[oklch(0.66_0.28_335)]", tier: "special" },
};

const TIER_GLOW: Record<string, string> = {
  common:    "group-hover/pc:shadow-[0_16px_48px_-12px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.55_0.25_295/0.3),0_0_48px_-8px_oklch(0.55_0.25_295/0.5)]",
  rare:      "group-hover/pc:shadow-[0_16px_48px_-12px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.74_0.15_220/0.35),0_0_56px_-8px_oklch(0.74_0.15_220/0.55)]",
  legendary: "group-hover/pc:shadow-[0_16px_48px_-12px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.82_0.16_88/0.4),0_0_64px_-8px_oklch(0.82_0.16_88/0.55)]",
  special:   "group-hover/pc:shadow-[0_16px_48px_-12px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.66_0.28_335/0.4),0_0_56px_-8px_oklch(0.66_0.28_335/0.55)]",
};

export function ProductCard({ product }: Props) {
  const inStock = product.stock > 0;
  const meta = TYPE_META[product.type] ?? TYPE_META.PACK!;
  const TypeIcon = meta.Icon;
  const lowStock = inStock && product.stock <= 3;

  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top)  / rect.height;
    ref.current.style.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${((x - 0.5) * 5).toFixed(2)}deg`);
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
      style={{ transformStyle: "preserve-3d" } as React.CSSProperties}
      className={cn(
        "group/pc relative flex flex-col rounded-2xl overflow-hidden border border-[oklch(0.22_0.08_285)]",
        "bg-[oklch(0.10_0.04_285)]",
        "[transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-[oklch(0.55_0.25_295/0.45)]",
        TIER_GLOW[meta.tier],
      )}
    >
      {/* ── Tier rim light at top ────────────────────────────────────────── */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-8 top-0 h-px",
          meta.tier === "legendary" && "bg-gradient-to-r from-transparent via-[oklch(0.82_0.16_88/0.6)] to-transparent",
          meta.tier === "rare"      && "bg-gradient-to-r from-transparent via-[oklch(0.74_0.15_220/0.6)] to-transparent",
          meta.tier === "special"   && "bg-gradient-to-r from-transparent via-[oklch(0.66_0.28_335/0.6)] to-transparent",
          meta.tier === "common"    && "bg-gradient-to-r from-transparent via-[oklch(0.70_0.22_295/0.5)] to-transparent",
        )}
      />

      {/* ── Cursor-tracking inner glow ──────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/pc:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_40%_50%_at_var(--mx,50%)_var(--my,50%),oklch(0.55_0.25_295/0.18),transparent_70%)]"
      />

      <Link href={`/products/${product.slug}`} className="relative flex-1 flex flex-col">
        {/* ── 3D Pack arena ────────────────────────────────────────────── */}
        <div className="relative aspect-square overflow-hidden">
          {/* Arena backdrop */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,oklch(0.18_0.10_295/0.6),transparent_60%)]" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.15_0.08_220/0.4),transparent_60%)]" />
          <div aria-hidden className="absolute inset-0 pattern-seance opacity-40" />

          {/* Spotlight */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_30%_20%_at_50%_110%,oklch(0.55_0.25_295/0.6),transparent_70%)] blur-xl opacity-60 group-hover/pc:opacity-100 transition-opacity duration-700" />

          <PackModelClient
            productType={product.type}
            setSlug={product.set.slug}
            setName={product.set.name}
            imageUrl={product.imageUrl}
            logoUrl={product.set.logoUrl}
            cameraZ={2.4}
            lowQuality
          />

          {/* Tier badge — top-left, glass */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] border backdrop-blur-md",
                meta.cls,
              )}
            >
              <TypeIcon className="size-3" />
              {meta.label}
            </span>
          </div>

          {/* Stock pill — top-right */}
          {inStock ? (
            lowStock && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] border border-[oklch(0.70_0.22_30/0.4)] bg-[oklch(0.70_0.22_30/0.15)] text-[oklch(0.88_0.15_40)] backdrop-blur-md">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.78_0.22_30)] opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full size-1.5 bg-[oklch(0.78_0.22_30)]" />
                  </span>
                  {product.stock} left
                </span>
              </div>
            )
          ) : (
            <div className="absolute inset-0 bg-background/75 backdrop-blur-sm flex items-center justify-center z-20">
              <span className="font-display text-lg tracking-[-0.02em] text-muted-foreground border border-border/40 bg-card px-4 py-1.5 rounded-full">
                Sold out
              </span>
            </div>
          )}
        </div>

        {/* ── Info ───────────────────────────────────────────────────── */}
        <div className="relative p-4 pb-3 flex-1 flex flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.78_0.2_295)]/80 mb-1 truncate">
            {product.set.name}
          </p>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-3 group-hover/pc:text-foreground transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto flex items-baseline justify-between">
            <span className="font-mono text-xl font-semibold tabular-nums text-foreground group-hover/pc:text-[oklch(0.88_0.12_295)] transition-colors">
              €{Number(product.price).toFixed(2)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 flex items-center gap-1">
              <span className={cn("size-1.5 rounded-full", meta.dot)} />
              {meta.tier}
            </span>
          </div>
        </div>
      </Link>

      {/* ── Add-to-cart — reveals cleanly on hover ────────────────────── */}
      {inStock && (
        <div className="px-4 pb-4">
          <form action={addToCart.bind(null, product.id)}>
            <button
              type="submit"
              className="group/btn relative w-full h-9 rounded-lg overflow-hidden bg-[oklch(0.14_0.08_290)] border border-[oklch(0.55_0.25_295/0.25)] text-sm font-medium transition-all duration-300 hover:bg-[oklch(0.20_0.14_290)] hover:border-[oklch(0.55_0.25_295/0.5)] hover:shadow-[inset_0_1px_0_oklch(1_0_0/0.08),0_0_24px_-4px_oklch(0.55_0.25_295/0.6)]"
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2 h-full w-full text-foreground/90 group-hover/btn:text-foreground">
                <Plus className="size-3.5 transition-transform duration-300 group-hover/btn:rotate-90" />
                Add to cart
                <ShoppingCart className="size-3.5 opacity-0 -ml-1 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" />
              </span>
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[oklch(0.55_0.25_295/0.25)] to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
