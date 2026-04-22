import { cn } from "@/lib/utils";

type Props = {
  level: number;
  size?: "sm" | "md";
  className?: string;
};

function tierColor(level: number) {
  if (level >= 30) return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_oklch(0.75_0.18_80/0.3)]";
  if (level >= 15) return "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_8px_oklch(0.54_0.24_285/0.3)]";
  if (level >= 5)  return "bg-sky-500/20 text-sky-300 border-sky-500/40";
  return "bg-secondary text-foreground/70 border-border/50";
}

export function LevelBadge({ level, size = "md", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold border rounded-full leading-none",
        tierColor(level),
        size === "sm" ? "text-[10px] px-2 py-0.5 gap-0.5" : "text-xs px-2.5 py-1 gap-1",
        className,
      )}
    >
      <span className={size === "sm" ? "text-[9px]" : "text-[10px]"}>LV</span>
      {level}
    </span>
  );
}
