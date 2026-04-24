import Image from "next/image";
import { Zap, Flame } from "lucide-react";

type TickerItem = {
  id: string;
  type: "listing" | "trade";
  cardName: string;
  cardImage: string | null;
  price: number | null;
  sellerName?: string | null;
  offererName?: string | null;
};

type Props = {
  items: TickerItem[];
  className?: string;
};

// Horizontal marquee of recent activity. Duplicates items for seamless loop.
// Pure CSS animation (ticker-slide keyframe in globals.css).
export function LiveTicker({ items, className }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div
      className={`relative overflow-hidden border-y border-[oklch(0.55_0.25_295/0.2)] bg-[oklch(0.08_0.04_285/0.6)] backdrop-blur-sm ${className ?? ""}`}
    >
      {/* Edge fades */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Header pill */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[oklch(0.82_0.17_295)] bg-[oklch(0.12_0.06_285)] border border-[oklch(0.55_0.25_295/0.35)] rounded-full px-2.5 py-1 shadow-[0_0_16px_oklch(0.55_0.25_295/0.35)]">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.74_0.15_220)] opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full size-1.5 bg-[oklch(0.74_0.15_220)]" />
        </span>
        Live
      </div>

      <div className="flex gap-3 py-3 pl-32 pr-12 animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item.id}-${i}`}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground shrink-0"
          >
            {item.type === "listing" ? (
              <Flame className="size-3 text-[oklch(0.78_0.2_30)]" />
            ) : (
              <Zap className="size-3 text-[oklch(0.78_0.2_295)]" />
            )}

            {item.cardImage && (
              <span className="relative size-5 shrink-0 rounded overflow-hidden bg-[oklch(0.14_0.06_285)]">
                <Image src={item.cardImage} alt="" fill className="object-contain" unoptimized />
              </span>
            )}

            <span className="text-foreground/90 font-medium">{item.cardName}</span>

            {item.type === "listing" ? (
              <>
                <span className="text-[oklch(0.78_0.2_30)]/70">listed</span>
                {item.price != null && (
                  <span className="font-mono text-[oklch(0.82_0.16_88)]">€{item.price.toFixed(2)}</span>
                )}
                {item.sellerName && <span className="text-muted-foreground/60">by {item.sellerName}</span>}
              </>
            ) : (
              <>
                <span className="text-[oklch(0.78_0.2_295)]/70">traded</span>
                {item.sellerName && item.offererName && (
                  <span className="text-muted-foreground/60">{item.offererName} → {item.sellerName}</span>
                )}
              </>
            )}

            <span className="text-[oklch(0.55_0.25_295)]/50 ml-1">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
