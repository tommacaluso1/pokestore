"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  xp:       number;
  level:    number;
  progress: number;
  needed:   number;
  pct:      number;
  showLabels?: boolean;
  className?: string;
};

// Animated XP bar — fills from 0 to `pct` on mount. Rim glow + shimmer.
export function XPBar({ xp, level, progress, needed, pct, showLabels = true, className }: Props) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(pct));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-mono text-muted-foreground uppercase tracking-[0.22em]">
            LV {level} → {level + 1}
          </span>
          <span className="font-mono tabular-nums text-foreground/80">
            {progress.toLocaleString()} / {needed.toLocaleString()}
          </span>
        </div>
      )}

      <div className="relative h-2.5 rounded-full overflow-hidden bg-[oklch(0.12_0.06_285)] border border-[oklch(0.22_0.08_285/0.6)]">
        {/* Progress fill */}
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-[oklch(0.55_0.25_295)] via-[oklch(0.62_0.23_280)] to-[oklch(0.74_0.15_220)] transition-[width] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${Math.max(0, Math.min(100, animated))}%` }}
        >
          {/* Shimmer sweep */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent [background-size:200%_100%] animate-[shimmer_2.2s_linear_infinite]" />
          {/* Rim glow at leading edge */}
          <div aria-hidden className="absolute right-0 top-0 h-full w-1 bg-[oklch(0.88_0.12_215)] shadow-[0_0_12px_oklch(0.74_0.15_220),0_0_24px_oklch(0.55_0.25_295/0.7)]" />
        </div>

        {/* Tick marks every 25% */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex">
          {[25, 50, 75].map((t) => (
            <span key={t} className="absolute top-0 bottom-0 w-px bg-[oklch(0_0_0/0.3)]" style={{ left: `${t}%` }} />
          ))}
        </div>
      </div>

      {showLabels && (
        <p className="text-[10px] font-mono text-muted-foreground/60 text-right tabular-nums">
          {xp.toLocaleString()} total XP
        </p>
      )}
    </div>
  );
}
