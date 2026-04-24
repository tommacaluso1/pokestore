import { cn } from "@/lib/utils";
import type { Badge } from "@repo/db";

import {
  Handshake, CreditCard, Crown, Tag, ShoppingBag, Coins,
  Circle, BookOpen, Trophy, Sparkles, Store, Flame,
  Star, Medal, Gem, Wallet, Lock,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  handshake: Handshake,
  cards:     CreditCard,
  crown:     Crown,
  tag:       Tag,
  shop:      ShoppingBag,
  money:     Coins,
  pokeball:  Circle,
  album:     BookOpen,
  trophy:    Trophy,
  sparkle:   Sparkles,
  store:     Store,
  fire:      Flame,
  star:      Star,
  medal:     Medal,
  gem:       Gem,
  wallet:    Wallet,
};

// Tier visuals tuned for dark ghost palette. Each tier has a distinct glow.
const TIER_STYLES = {
  COMMON: {
    ring:    "border-[oklch(0.22_0.08_285/0.6)]",
    bg:      "bg-[oklch(0.14_0.06_285/0.5)]",
    icon:    "text-foreground/70",
    label:   "text-foreground/80",
    glow:    "",
    aura:    "",
  },
  RARE: {
    ring:    "border-[oklch(0.55_0.25_295/0.45)]",
    bg:      "bg-[oklch(0.30_0.16_290/0.25)]",
    icon:    "text-[oklch(0.85_0.16_295)]",
    label:   "text-[oklch(0.85_0.16_295)]",
    glow:    "shadow-[0_8px_24px_-6px_oklch(0_0_0/0.5),0_0_24px_-2px_oklch(0.55_0.25_295/0.45)]",
    aura:    "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.55_0.25_295/0.3),transparent_70%)]",
  },
  LEGENDARY: {
    ring:    "border-[oklch(0.82_0.16_88/0.55)]",
    bg:      "bg-[oklch(0.30_0.14_88/0.25)]",
    icon:    "text-[oklch(0.92_0.14_88)]",
    label:   "text-[oklch(0.92_0.14_88)]",
    glow:    "shadow-[0_10px_28px_-6px_oklch(0_0_0/0.55),0_0_36px_-4px_oklch(0.82_0.16_88/0.6)]",
    aura:    "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.82_0.16_88/0.4),transparent_70%)]",
  },
};

type Props = {
  badge:    Pick<Badge, "id" | "name" | "description" | "tier" | "iconKey">;
  earned?:  boolean;
  earnedAt?: Date | string | null;
  size?:    "sm" | "md";
  className?: string;
};

export function BadgeCard({ badge, earned = true, earnedAt, size = "md", className }: Props) {
  const tier = TIER_STYLES[badge.tier] ?? TIER_STYLES.COMMON;
  const Icon = ICONS[badge.iconKey] ?? Star;
  const locked = !earned;

  return (
    <div
      title={locked ? `${badge.name} — ${badge.description}` : badge.description}
      className={cn(
        "group/badge relative overflow-hidden flex flex-col items-center gap-2 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        locked
          ? "border-[oklch(0.22_0.08_285/0.3)] bg-[oklch(0.10_0.04_285/0.5)] opacity-55"
          : cn(tier.ring, tier.bg, tier.glow, "hover:-translate-y-0.5"),
        size === "sm" ? "p-2.5" : "p-4",
        className,
      )}
    >
      {/* Aura */}
      {!locked && tier.aura && (
        <div aria-hidden className={cn("pointer-events-none absolute inset-0 opacity-80 group-hover/badge:opacity-100 transition-opacity", tier.aura)} />
      )}

      {/* Faint seance pattern for earned legendary */}
      {!locked && badge.tier === "LEGENDARY" && (
        <div aria-hidden className="pointer-events-none absolute inset-0 pattern-seance opacity-30" />
      )}

      {/* Icon */}
      <div className={cn(
        "relative rounded-xl flex items-center justify-center border",
        locked
          ? "bg-[oklch(0.10_0.04_285/0.6)] border-[oklch(0.22_0.08_285/0.4)]"
          : cn(
              "bg-[oklch(0.08_0.04_285/0.7)] backdrop-blur-sm",
              badge.tier === "LEGENDARY" && "border-[oklch(0.82_0.16_88/0.4)]",
              badge.tier === "RARE"      && "border-[oklch(0.55_0.25_295/0.4)]",
              badge.tier === "COMMON"    && "border-[oklch(0.22_0.08_285/0.5)]",
            ),
        size === "sm" ? "size-9" : "size-14",
      )}>
        {locked ? (
          <Lock className="size-4 text-muted-foreground/30" />
        ) : (
          <>
            <Icon className={cn(
              "relative z-10 drop-shadow-[0_0_8px_oklch(0.55_0.25_295/0.4)]",
              size === "sm" ? "size-4" : "size-6",
              tier.icon,
            )} />
            {/* Icon halo */}
            {badge.tier !== "COMMON" && (
              <div
                aria-hidden
                className={cn(
                  "absolute inset-0 rounded-xl blur-md opacity-60 animate-breathe",
                  badge.tier === "LEGENDARY"
                    ? "bg-[radial-gradient(circle,oklch(0.82_0.16_88/0.5),transparent_70%)]"
                    : "bg-[radial-gradient(circle,oklch(0.55_0.25_295/0.5),transparent_70%)]",
                )}
              />
            )}
          </>
        )}
      </div>

      {/* Name + meta */}
      <div className="relative text-center space-y-0.5">
        <p className={cn(
          "font-semibold leading-tight",
          size === "sm" ? "text-[11px]" : "text-xs",
          locked ? "text-muted-foreground/50" : tier.label,
        )}>
          {badge.name}
        </p>
        {size === "md" && (
          <p className="text-[10px] text-muted-foreground/60 leading-tight line-clamp-2">
            {locked ? badge.description : (earnedAt
              ? new Date(earnedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
              : badge.description
            )}
          </p>
        )}
      </div>

      {/* Tier pill */}
      {size === "md" && (
        <span className={cn(
          "relative text-[9px] font-bold uppercase tracking-[0.22em] px-2 py-0.5 rounded-full border font-mono",
          locked
            ? "border-[oklch(0.22_0.08_285/0.3)] text-muted-foreground/30"
            : badge.tier === "LEGENDARY"
              ? "border-[oklch(0.82_0.16_88/0.35)] text-[oklch(0.92_0.14_88)]"
              : badge.tier === "RARE"
                ? "border-[oklch(0.55_0.25_295/0.35)] text-[oklch(0.85_0.16_295)]"
                : "border-[oklch(0.22_0.08_285/0.5)] text-muted-foreground/70",
        )}>
          {badge.tier.toLowerCase()}
        </span>
      )}
    </div>
  );
}
