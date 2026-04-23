import Link from "next/link";
import { Trophy, Layers } from "lucide-react";
import { getTopTraders, getTopCollectors } from "@/lib/queries/leaderboard";
import { LevelBadge } from "@/components/LevelBadge";

export const metadata = { title: "Leaderboard — PokéStore" };

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const [traders, collectors] = await Promise.all([
    getTopTraders(10),
    getTopCollectors(10),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Trophy className="size-8 text-amber-400" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-2">Top traders and collectors on PokéStore</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Top Traders */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            <Trophy className="size-4 text-amber-400" />
            Top Traders
          </h2>
          <div className="space-y-2">
            {traders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No completed trades yet.</p>
            ) : (
              traders.map((entry, i) => (
                <Link
                  key={entry.user.id}
                  href={`/profile/${entry.user.id}`}
                  className="flex items-center gap-3 bg-card border border-border/60 rounded-xl px-4 py-3 hover:border-primary/40 transition-all group"
                >
                  <span className="text-lg w-6 text-center shrink-0">
                    {MEDAL[i] ?? `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {entry.user.name ?? entry.user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.trades} completed trade{entry.trades !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <LevelBadge level={entry.level} size="sm" />
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Top Collectors */}
        <section>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            <Layers className="size-4 text-primary" />
            Top Collectors
          </h2>
          <div className="space-y-2">
            {collectors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No collectors yet.</p>
            ) : (
              collectors.map((entry, i) => (
                <Link
                  key={entry.user.id}
                  href={`/profile/${entry.user.id}`}
                  className="flex items-center gap-3 bg-card border border-border/60 rounded-xl px-4 py-3 hover:border-primary/40 transition-all group"
                >
                  <span className="text-lg w-6 text-center shrink-0">
                    {MEDAL[i] ?? `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {entry.user.name ?? entry.user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.uniqueCards} unique · {entry.totalCards} total
                    </p>
                  </div>
                  <LevelBadge level={entry.level} size="sm" />
                </Link>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
