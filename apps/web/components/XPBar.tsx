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

export function XPBar({ xp, level, progress, needed, pct, showLabels = true, className }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            Level {level} → {level + 1}
          </span>
          <span className="font-semibold text-foreground/80 tabular-nums">
            {progress.toLocaleString()} / {needed.toLocaleString()} XP
          </span>
        </div>
      )}
      <div className="h-2 bg-secondary/60 rounded-full overflow-hidden border border-border/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabels && (
        <p className="text-[11px] text-muted-foreground/70 text-right">
          {xp.toLocaleString()} total XP
        </p>
      )}
    </div>
  );
}
