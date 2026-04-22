import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Pencil } from "lucide-react";
import { auth } from "@/auth";
import {
  getFullProfile, getAllBadges,
  getUserProfileCards, getUserProfileListings,
  getUserCompletedTrades, getUserCompletedSales,
} from "@/lib/queries/profile";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { LevelBadge } from "@/components/LevelBadge";
import { XPBar } from "@/components/XPBar";
import { BadgeCard } from "@/components/BadgeCard";
import { Button } from "@/components/ui/button";
import { THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

type Props = {
  params:       Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "NM", LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP", HEAVILY_PLAYED: "HP", DAMAGED: "D",
};

const CATEGORY_LABELS: Record<string, string> = {
  TRADING: "Trading", SELLING: "Selling", COLLECTING: "Collecting",
  LISTING: "Listing", LEVEL: "Level", SPECIAL: "Special",
};

const TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  TRADE:         { label: "Trade only",    cls: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  SALE:          { label: "For sale",      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  TRADE_OR_SALE: { label: "Trade or Sale", cls: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
};

export async function generateMetadata({ params }: Pick<Props, "params">) {
  const { userId } = await params;
  const { user } = await getFullProfile(userId);
  if (!user) return {};
  return { title: `${user.name ?? user.email} — PokéStore` };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { userId } = await params;
  const { tab }    = await searchParams;

  const [{ user, xpInfo, badges, profile, stats }, allBadges, session] = await Promise.all([
    getFullProfile(userId),
    getAllBadges(),
    auth(),
  ]);

  if (!user) notFound();

  // Fetch data for the active tab
  const [cards, listings, trades, sales] = await Promise.all([
    tab === "cards"    ? getUserProfileCards(userId)    : Promise.resolve(null),
    tab === "listings" ? getUserProfileListings(userId) : Promise.resolve(null),
    tab === "trades"   ? getUserCompletedTrades(userId) : Promise.resolve(null),
    tab === "sales"    ? getUserCompletedSales(userId)  : Promise.resolve(null),
  ]);

  const isOwn    = session?.user?.id === userId;
  const theme    = THEMES.find((t) => t.id === (profile?.themeId ?? "purple")) ?? THEMES[0]!;
  const earnedIds = new Set(badges.map((b) => b.badgeId));

  const byCategory = allBadges.reduce<Record<string, typeof allBadges>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  const TABS = [
    { id: "trades",   label: "Trades",   value: stats.trades   },
    { id: "sales",    label: "Sales",    value: stats.sales    },
    { id: "cards",    label: "Cards",    value: stats.cards    },
    { id: "listings", label: "Listings", value: stats.listings },
  ] as const;

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
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}88)` }}
        />

        <div className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <AvatarDisplay
            avatarId={profile?.avatarId}
            size="xl"
            className="shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          />

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

            <XPBar {...xpInfo} className="max-w-sm" />
          </div>

          {isOwn && (
            <Link href="/profile/edit" className="shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="size-3.5" />
                Edit profile
              </Button>
            </Link>
          )}
        </div>

        {/* Stats row — each item is a tab link */}
        <div className="grid grid-cols-4 border-t border-border/40">
          {TABS.map(({ id, label, value }) => {
            const active = tab === id;
            return (
              <Link
                key={id}
                href={active ? `/profile/${userId}` : `/profile/${userId}?tab=${id}`}
                className={cn(
                  "flex flex-col items-center py-4 gap-0.5 border-r border-border/30 last:border-r-0 transition-colors hover:bg-secondary/20",
                  active && "bg-secondary/30",
                )}
              >
                <p className={cn("text-xl font-bold", active ? "text-primary" : "text-foreground")}>
                  {value}
                </p>
                <p className={cn("text-xs", active ? "text-primary/70" : "text-muted-foreground")}>
                  {label}
                </p>
              </Link>
            );
          })}
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
                <BadgeCard badge={s.userBadge.badge} earnedAt={s.userBadge.earnedAt} earned />
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

      {/* ── Tab content OR default badges view ───────────────────────────── */}
      {tab === "cards" && cards && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Collection
            <span className="ml-2 text-xs font-bold text-foreground/60">{stats.cards}</span>
          </h2>
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No cards yet.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {cards.map((uc) => (
                <div
                  key={uc.id}
                  className="flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                  title={`${uc.card.name} · ${CONDITION_LABELS[uc.condition] ?? uc.condition}${uc.foil ? " · Foil" : ""}`}
                >
                  <div className="aspect-[2/3] relative bg-gradient-to-b from-secondary/20 to-secondary/40">
                    {uc.card.imageSmall ? (
                      <Image
                        src={uc.card.imageSmall}
                        alt={uc.card.name}
                        fill
                        className="object-contain p-1.5 group-hover:scale-[1.03] transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">?</div>
                    )}
                    {uc.foil && (
                      <span className="absolute top-1 right-1 text-[9px] font-bold text-amber-400 bg-black/40 rounded-full px-1 py-0.5">✦</span>
                    )}
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10px] font-semibold leading-tight truncate">{uc.card.name}</p>
                    <p className="text-[9px] text-muted-foreground/70 truncate">{uc.card.tcgSet.name}</p>
                    <span className="text-[9px] text-muted-foreground/60">{CONDITION_LABELS[uc.condition] ?? uc.condition}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "listings" && listings && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Active listings
            <span className="ml-2 text-xs font-bold text-foreground/60">{stats.listings}</span>
          </h2>
          {listings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No active listings.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listings.map((l) => {
                const card     = l.userCard.card;
                const typeInfo = TYPE_STYLES[l.listingType] ?? { label: l.listingType, cls: "bg-secondary text-foreground border-border" };
                return (
                  <Link
                    key={l.id}
                    href={`/marketplace/${l.id}`}
                    className="group flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-[0_4px_20px_oklch(0.54_0.24_285/0.12)] transition-all"
                  >
                    <div className="aspect-[2/3] relative bg-gradient-to-b from-secondary/20 to-secondary/40">
                      {card.imageSmall ? (
                        <Image
                          src={card.imageSmall}
                          alt={card.name}
                          fill
                          className="object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">No image</div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${typeInfo.cls}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 flex flex-col gap-1">
                      <p className="text-xs font-semibold leading-tight truncate group-hover:text-primary transition-colors">
                        {card.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{card.tcgSet.name}</p>
                      {l.askingPrice ? (
                        <p className="text-sm font-bold text-primary">€{Number(l.askingPrice).toFixed(2)}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground italic">Trade only</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "trades" && trades && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Completed trades
            <span className="ml-2 text-xs font-bold text-foreground/60">{stats.trades}</span>
          </h2>
          {trades.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No completed trades yet.</p>
          ) : (
            <div className="space-y-3">
              {trades.map((t) => {
                const listedCard = t.listing.userCard.card;
                const isSeller   = t.listing.sellerId === userId;
                return (
                  <div key={t.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4">
                    {listedCard.imageSmall && (
                      <div className="relative size-12 shrink-0">
                        <Image src={listedCard.imageSmall} alt={listedCard.name} fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{listedCard.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isSeller ? `Traded to ${t.offerer.name ?? "user"}` : `Traded from listing`}
                      </p>
                      {t.items.length > 0 && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                          + {t.items.map((i) => i.userCard.card.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/60 shrink-0">
                      {new Date(t.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "sales" && sales && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Completed sales
            <span className="ml-2 text-xs font-bold text-foreground/60">{stats.sales}</span>
          </h2>
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No completed sales yet.</p>
          ) : (
            <div className="space-y-3">
              {sales.map((s) => {
                const soldCard = s.listing.userCard.card;
                return (
                  <div key={s.id} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-4">
                    {soldCard.imageSmall && (
                      <div className="relative size-12 shrink-0">
                        <Image src={soldCard.imageSmall} alt={soldCard.name} fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{soldCard.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Sold to {s.offerer.name ?? "user"}
                      </p>
                    </div>
                    {s.cashAmount && (
                      <p className="text-base font-bold text-emerald-400 shrink-0">
                        €{Number(s.cashAmount).toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/60 shrink-0">
                      {new Date(s.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Default view: all badges by category */}
      {!tab && (
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
      )}
    </div>
  );
}
