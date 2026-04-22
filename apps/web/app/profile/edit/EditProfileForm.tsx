"use client";

import { useState, useActionState, useEffect } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { updateProfileAction, setShowcaseAction, setFeaturedCardsAction } from "@/lib/actions/profile";
import { AVATARS } from "@/components/AvatarDisplay";
import { BadgeCard } from "@/components/BadgeCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Badge, UserBadge } from "@repo/db";

// ── Theme definitions ───────────────────────────────────────────────────────

export const THEMES = [
  { id: "purple",   label: "Gengar",    color: "#7c3aed", unlockLevel: 1  },
  { id: "midnight", label: "Midnight",  color: "#4338ca", unlockLevel: 1  },
  { id: "gold",     label: "Gold",      color: "#d97706", unlockLevel: 10 },
  { id: "crimson",  label: "Crimson",   color: "#dc2626", unlockLevel: 20 },
  { id: "forest",   label: "Forest",    color: "#059669", unlockLevel: 15 },
  { id: "ocean",    label: "Ocean",     color: "#0891b2", unlockLevel: 30 },
];

// ── Types ───────────────────────────────────────────────────────────────────

type EarnedBadge = UserBadge & { badge: Badge };

type InventoryItem = {
  id: string;
  quantity: number;
  condition: string;
  foil: boolean;
  card: { name: string; imageSmall: string | null; tcgSet: { name: string } };
};

type Props = {
  userId:    string;
  level:     number;
  avatarId:  string;
  themeId:   string;
  bio?:      string | null;
  earnedBadges:  EarnedBadge[];
  showcaseIds:   string[];   // current userBadge IDs in positions 1-3
  featuredIds:   string[];   // current userCard IDs in positions 1-3
  inventory: InventoryItem[];
};

// ── Component ───────────────────────────────────────────────────────────────

export function EditProfileForm({
  userId, level, avatarId: initAvatar, themeId: initTheme, bio: initBio,
  earnedBadges, showcaseIds: initShowcase, featuredIds: initFeatured, inventory,
}: Props) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, {});

  const [avatar,   setAvatar]   = useState(initAvatar);
  const [theme,    setTheme]    = useState(initTheme);
  const [bio,      setBio]      = useState(initBio ?? "");
  const [showcase, setShowcase] = useState<(string | null)[]>(
    [initShowcase[0] ?? null, initShowcase[1] ?? null, initShowcase[2] ?? null],
  );
  const [featured, setFeatured] = useState<(string | null)[]>(
    [initFeatured[0] ?? null, initFeatured[1] ?? null, initFeatured[2] ?? null],
  );

  const [saving, setSaving] = useState(false);

  // Persist showcase + featured when they change
  async function saveShowcase(next: (string | null)[]) {
    setShowcase(next);
    await setShowcaseAction(next.map((id, i) => ({ position: i + 1, userBadgeId: id })));
  }

  async function saveFeatured(next: (string | null)[]) {
    setFeatured(next);
    await setFeaturedCardsAction(next.map((id, i) => ({ position: i + 1, userCardId: id })));
  }

  function toggleShowcase(userBadgeId: string) {
    const next = [...showcase];
    const idx  = next.indexOf(userBadgeId);
    if (idx !== -1) {
      next[idx] = null;
    } else {
      const empty = next.indexOf(null);
      if (empty !== -1) next[empty] = userBadgeId;
    }
    saveShowcase(next);
  }

  function toggleFeatured(userCardId: string) {
    const next = [...featured];
    const idx  = next.indexOf(userCardId);
    if (idx !== -1) {
      next[idx] = null;
    } else {
      const empty = next.indexOf(null);
      if (empty !== -1) next[empty] = userCardId;
    }
    saveFeatured(next);
  }

  const CONDITION_SHORT: Record<string, string> = {
    MINT: "M", NEAR_MINT: "NM", LIGHTLY_PLAYED: "LP",
    MODERATELY_PLAYED: "MP", HEAVILY_PLAYED: "HP", DAMAGED: "D",
  };

  return (
    <div className="space-y-10">

      {/* ── Avatar ────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold mb-4 text-foreground">Avatar</h2>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
          {Object.entries(AVATARS).map(([id, av]) => (
            <button
              key={id}
              type="button"
              title={av.label}
              onClick={() => setAvatar(id)}
              className={[
                "aspect-square rounded-xl flex items-center justify-center text-2xl transition-all border",
                `bg-gradient-to-br ${av.bg}`,
                avatar === id
                  ? "border-primary shadow-[0_0_12px_oklch(0.54_0.24_285/0.4)] scale-110"
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105",
              ].join(" ")}
            >
              {av.emoji}
            </button>
          ))}
        </div>
      </section>

      {/* ── Theme ─────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold mb-1 text-foreground">Theme</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Higher-tier themes unlock as you level up.
        </p>
        <div className="flex flex-wrap gap-3">
          {THEMES.map((t) => {
            const locked  = level < t.unlockLevel;
            const active  = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={locked}
                onClick={() => !locked && setTheme(t.id)}
                className={[
                  "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                  locked
                    ? "opacity-30 cursor-not-allowed border-border/30 text-muted-foreground"
                    : active
                      ? "border-primary bg-primary/10 text-foreground shadow-[0_0_10px_oklch(0.54_0.24_285/0.25)]"
                      : "border-border/50 hover:border-border text-foreground/80 hover:text-foreground",
                ].join(" ")}
              >
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                {t.label}
                {locked && (
                  <span className="text-[10px] text-muted-foreground/50 ml-1">
                    Lv{t.unlockLevel}
                  </span>
                )}
                {active && <Check className="size-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Bio ───────────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold mb-3 text-foreground">Bio</h2>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          placeholder="Tell other traders about yourself…"
          rows={3}
          className="resize-none bg-secondary/40 border-border/60"
        />
        <p className="text-xs text-muted-foreground/60 mt-1 text-right">{bio.length}/160</p>
      </section>

      {/* ── Save avatar/theme/bio ─────────────────────────────────────────── */}
      <form action={profileAction}>
        <input type="hidden" name="avatarId" value={avatar} />
        <input type="hidden" name="themeId"  value={theme}  />
        <input type="hidden" name="bio"       value={bio}   />
        {profileState.error && (
          <p className="text-sm text-destructive mb-3">{profileState.error}</p>
        )}
        {profileState.success && (
          <p className="text-sm text-emerald-400 mb-3">Profile saved.</p>
        )}
        <Button type="submit" disabled={profilePending} className="w-full sm:w-auto">
          {profilePending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <hr className="border-border/30" />

      {/* ── Badge showcase ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold mb-1 text-foreground">Badge showcase</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Pick up to 3 earned badges to pin to your profile.
        </p>

        {/* Slots preview */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2].map((i) => {
            const ub = earnedBadges.find((b) => b.id === showcase[i]);
            return (
              <div
                key={i}
                className="flex-1 aspect-square rounded-2xl border border-dashed border-border/50 flex items-center justify-center bg-secondary/10 text-muted-foreground/40 text-xs"
              >
                {ub ? (
                  <div className="relative w-full h-full p-1">
                    <BadgeCard badge={ub.badge} earnedAt={ub.earnedAt} size="sm" />
                    <button
                      onClick={() => toggleShowcase(ub.id)}
                      className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive/80 flex items-center justify-center"
                    >
                      <X className="size-3 text-white" />
                    </button>
                  </div>
                ) : (
                  `Slot ${i + 1}`
                )}
              </div>
            );
          })}
        </div>

        {earnedBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete trades, list cards, and level up to earn badges.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {earnedBadges.map((ub) => {
              const pinned = showcase.includes(ub.id);
              return (
                <button
                  key={ub.id}
                  type="button"
                  onClick={() => toggleShowcase(ub.id)}
                  disabled={!pinned && !showcase.includes(null)}
                  className={[
                    "relative transition-all",
                    pinned ? "ring-2 ring-primary rounded-2xl" : "",
                    !pinned && !showcase.includes(null) ? "opacity-40 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  <BadgeCard badge={ub.badge} earnedAt={ub.earnedAt} size="sm" />
                  {pinned && (
                    <div className="absolute -top-1 -right-1 size-4 rounded-full bg-primary flex items-center justify-center">
                      <Check className="size-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <hr className="border-border/30" />

      {/* ── Featured cards ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold mb-1 text-foreground">Featured cards</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Showcase up to 3 cards from your collection.
        </p>

        {/* Slots */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2].map((i) => {
            const uc = inventory.find((c) => c.id === featured[i]);
            return (
              <div
                key={i}
                className="flex-1 aspect-[2/3] rounded-xl border border-dashed border-border/50 flex items-center justify-center bg-secondary/10 text-muted-foreground/40 text-xs relative overflow-hidden"
              >
                {uc ? (
                  <>
                    {uc.card.imageSmall && (
                      <Image src={uc.card.imageSmall} alt={uc.card.name} fill className="object-contain p-2" unoptimized />
                    )}
                    <button
                      onClick={() => toggleFeatured(uc.id)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-destructive/80 flex items-center justify-center z-10"
                    >
                      <X className="size-3 text-white" />
                    </button>
                  </>
                ) : (
                  `Slot ${i + 1}`
                )}
              </div>
            );
          })}
        </div>

        {inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground">Your collection is empty.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-border/40 divide-y divide-border/30">
            {inventory.map((uc) => {
              const pinned = featured.includes(uc.id);
              return (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => toggleFeatured(uc.id)}
                  disabled={!pinned && !featured.includes(null)}
                  className={[
                    "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                    pinned
                      ? "bg-primary/10"
                      : "hover:bg-secondary/40",
                    !pinned && !featured.includes(null) ? "opacity-40 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  <div className="relative w-8 h-11 shrink-0">
                    {uc.card.imageSmall
                      ? <Image src={uc.card.imageSmall} alt={uc.card.name} fill className="object-contain" unoptimized />
                      : <div className="w-full h-full bg-secondary rounded" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{uc.card.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {uc.card.tcgSet.name}
                      <span className="mx-1 opacity-40">·</span>
                      {CONDITION_SHORT[uc.condition] ?? uc.condition}
                      {uc.foil && <span className="ml-1 text-amber-400/80">✦</span>}
                    </p>
                  </div>
                  {pinned && <Check className="size-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
