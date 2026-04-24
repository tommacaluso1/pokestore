import { cn } from "@/lib/utils";

type Props = {
  level: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function tier(level: number) {
  if (level >= 30) return {
    cls: "text-[oklch(0.90_0.14_88)] bg-[oklch(0.30_0.14_88/0.35)] border-[oklch(0.82_0.16_88/0.55)] shadow-[0_0_16px_oklch(0.82_0.16_88/0.5),inset_0_1px_0_oklch(1_0_0/0.12)]",
    sigil: "✦",
  };
  if (level >= 15) return {
    cls: "text-[oklch(0.88_0.22_295)] bg-[oklch(0.30_0.18_295/0.4)] border-[oklch(0.70_0.22_295/0.55)] shadow-[0_0_12px_oklch(0.55_0.25_295/0.5),inset_0_1px_0_oklch(1_0_0/0.1)]",
    sigil: "✧",
  };
  if (level >= 5) return {
    cls: "text-[oklch(0.88_0.15_215)] bg-[oklch(0.30_0.14_220/0.4)] border-[oklch(0.74_0.15_220/0.5)] shadow-[0_0_10px_oklch(0.74_0.15_220/0.4)]",
    sigil: "◆",
  };
  return {
    cls: "text-foreground/70 bg-[oklch(0.16_0.06_285/0.5)] border-[oklch(0.22_0.08_285/0.7)]",
    sigil: "●",
  };
}

export function LevelBadge({ level, size = "md", className }: Props) {
  const t = tier(level);
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-bold border rounded-full leading-none backdrop-blur-sm",
        t.cls,
        size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1"
        : size === "lg" ? "text-sm px-3 py-1.5 gap-1.5"
        : "text-[11px] px-2 py-1 gap-1",
        className,
      )}
    >
      <span aria-hidden className={cn(
        size === "sm" ? "text-[9px]" : size === "lg" ? "text-sm" : "text-[10px]",
      )}>
        {t.sigil}
      </span>
      <span className={cn(
        "uppercase tracking-widest",
        size === "sm" ? "text-[8px]" : "text-[9px]",
      )}>LV</span>
      <span className="tabular-nums">{level}</span>
    </span>
  );
}
