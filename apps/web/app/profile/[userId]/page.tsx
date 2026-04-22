import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { getFullProfile, getAllBadges } from "@/lib/queries/profile";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { LevelBadge } from "@/components/LevelBadge";
import { XPBar } from "@/components/XPBar";
import { BadgeCard } from "@/components/BadgeCard";
import { Button } from "@/components/ui/button";
import { THEMES } from "../edit/EditProfileForm";

type Props = { params: Promise<{ userId: string }> };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "NM", LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP", HEAVILY_PLAYED: "HP", DAMAGED: "D",
};

const CATEGORY_LABELS: Record<string, string> = {
  TRADING: "Trading", SELLING: "Selling", COLLECTING: "Collecting",
  LISTING: "Listing", LEVEL: "Level", SPECIAL: "Special",
};

export async function generateMetadata({ params }: Props) {
  const { userId } = await params;
  const { user } = await getFullProfile(userId);
  if (!user) return {};
  return { title: `${user.name ?? user.email} — PokéStore` };
}

export default async function ProfilePage({ params }: Props) {
  const { userId } = await params;
  const [{ user, xpInfo, badges, profile, stats }, allBadges, session] = await Promise.all([
    getFullProfile(userId),
    getAllBadges(),
    auth(),
  ]);

  if (!user) notFound();

  const isOwn   = session?.user?.id === userId;
  const theme   = THEMES.find((t) => t.id === (profile?.themeId ?? "purple")) ?? THEMES[0]!;
  const earnedIds = new Set(badges.map((b) => b.badgeId));

  // Group all badges by category
  const byCategory = allBadges.reduce<Record<string, typeof allBadges>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto" style={{ "--accent": theme.color } as React.CSSProperties}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground/80 truncate">{user.name ?? user.email}</span>
      </nav>

      {/* ── Profile header ───────────────────────────────────────────────── */}
      <div className="relative rounded-3xl border border-border/60 bg-card overflow-hidden mb-6
                      shadow-[0_4px_32px_oklch(0.54_0.24_285/0.08)]">
        {/* Top gradient accent bar */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}88)` }}
        />

        <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <AvatarDisplay
            avatarId={profile?.avatarId}
            size="xl"
            className="shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight truncate">
                {user.name ?? user.email?.split("@")[0]}
              </h1>
              <LevelBadge level={xpInfo.level} />
            </div>

            {user.email && (
              <p className="text-xs text-muted-foreground mb-3">
                Joined {new Date(user.createdAt).toLocaleDateString("en-GB", {
                  month: "long", year: "numeric",
                })}
              </p>
            )}

            {profile?.bio && (
              <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{profile.bio}</p>
            )}

            {/* XP bar */}
            <XPBar {...xpInfo} className="max-w-sm" />
          </div>

          {/* Edit button */}
          {isOwn && (
            <Link href="/profile/edit" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="size-3.5" />
                Edit profile
              </Button>
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 border-t border-border/40">
          {[
            { label: "Trades",   value: stats.trades   },
            { label: "Sales",    value: stats.sales    },
            { label: "Cards",    value: stats.cards    },
            { label: "Listings", value: stats.listings },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-4 gap-0.5 border-r border-border/30 last:border-r-0">
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Showcase badges ──────────────────────────────────────────────── */}
      {(profile?.showcase?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Showcase
          </h2>
          <div className="flex gap-3">
            {profile!.showcase.map((s) => (
              <div key={s.id} className="flex-1 max-w-[140px]">
                <BadgeCard
                  badge={s.userBadge.badge}
                  earnedAt={s.userBadge.earnedAt}
                  earned
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured cards ───────────────────────────────────────────────── */}
      {(profile?.featured?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Featured cards
          </h2>
          <div className="flex gap-4">
            {profile!.featured.map((f) => {
              const card = f.userCard.card;
              return (
                <div
                  key={f.id}
                  className="flex-1 max-w-[140px] aspect-[2/3] relative bg-gradient-to-b from-secondary/20 to-secondary/40 rounded-2xl overflow-hidden border border-border/60
                             hover:border-primary/40 hover:shadow-[0_4px_20px_oklch(0.54_0.24_285/0.15)] transition-all group"
                  title={`${card.name} · ${CONDITION_LABELS[f.userCard.condition] ?? f.userCard.condition}${f.userCard.foil ? " · Foil" : ""}`}
                >
                  {card.imageSmall ? (
                    <Image
                      src={card.imageLarge ?? card.imageSmall}
                      alt={card.name}
                      fill
                      className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                      No image
                    </div>
                  )}
                  {f.userCard.foil && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold text-amber-400 bg-black/40 rounded-full px-1.5 py-0.5">✦ Foil</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── All badges ───────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Badges
            <span className="ml-2 text-xs font-bold text-foreground/60">
              {badges.length}/{allBadges.length}
            </span>
          </h2>
        </div>

        {Object.entries(byCategory).map(([category, catBadges]) => (
          <div key={category} className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
              {CATEGORY_LABELS[category] ?? category}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {catBadges.map((b) => {
                const ub = badges.find((earned) => earned.badgeId === b.id);
                return (
                  <BadgeCard
                    key={b.id}
                    badge={b}
                    earned={earnedIds.has(b.id)}
                    earnedAt={ub?.earnedAt}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
