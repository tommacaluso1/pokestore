import { cn } from "@/lib/utils";
import type { Badge } from "@repo/db";

// Icon map — Lucide icons by iconKey
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

const TIER_STYLES = {
  COMMON:    {
    ring:    "border-border/50",
    bg:      "bg-secondary/40",
    icon:    "text-foreground/60",
    label:   "text-muted-foreground",
    glow:    "",
  },
  RARE:      {
    ring:    "border-violet-500/40",
    bg:      "bg-violet-500/10",
    icon:    "text-violet-300",
    label:   "text-violet-300",
    glow:    "shadow-[0_0_16px_oklch(0.54_0.24_285/0.25)]",
  },
  LEGENDARY: {
    ring:    "border-amber-500/50",
    bg:      "bg-amber-500/10",
    icon:    "text-amber-300",
    label:   "text-amber-300",
    glow:    "shadow-[0_0_20px_oklch(0.75_0.18_80/0.35)]",
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
  const tier    = TIER_STYLES[badge.tier] ?? TIER_STYLES.COMMON;
  const Icon    = ICONS[badge.iconKey] ?? Star;
  const locked  = !earned;

  return (
    <div
      title={locked ? `${badge.name} — ${badge.description}` : badge.description}
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-200",
        locked
          ? "border-border/30 bg-secondary/10 opacity-40 grayscale"
          : cn(tier.ring, tier.bg, tier.glow),
        size === "sm" ? "p-2.5" : "p-4",
        className,
      )}
    >
      {/* Icon */}
      <div className={cn(
        "rounded-xl flex items-center justify-center",
        locked ? "bg-secondary/30" : "bg-background/40",
        size === "sm" ? "size-8" : "size-12",
      )}>
        {locked
          ? <Lock className="size-4 text-muted-foreground/40" />
          : <Icon className={cn(size === "sm" ? "size-4" : "size-6", tier.icon)} />
        }
      </div>

      {/* Name + tier */}
      <div className="text-center space-y-0.5">
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
          "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
          locked
            ? "border-border/20 text-muted-foreground/30"
            : badge.tier === "LEGENDARY"
              ? "border-amber-500/30 text-amber-400/80"
              : badge.tier === "RARE"
                ? "border-violet-500/30 text-violet-400/80"
                : "border-border/40 text-muted-foreground/60",
        )}>
          {badge.tier.toLowerCase()}
        </span>
      )}
    </div>
  );
}
