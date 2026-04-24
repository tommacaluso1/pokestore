import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Optional leading symbol (e.g. "✦", "✧", "◈") */
  sigil?: string;
  accent?: "violet" | "cyan" | "gold" | "magenta";
};

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  violet:  "text-[oklch(0.78_0.20_295)]",
  cyan:    "text-[oklch(0.82_0.15_215)]",
  gold:    "text-[oklch(0.82_0.16_88)]",
  magenta: "text-[oklch(0.78_0.24_335)]",
};

// Micro-label used to introduce a section. Decorative bookend marks + sigil.
export function SectionEyebrow({ children, className, sigil = "✦", accent = "violet" }: Props) {
  return (
    <p className={cn(
      "inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em]",
      ACCENT[accent],
      className,
    )}>
      <span aria-hidden className="inline-block w-6 h-px bg-current opacity-40" />
      {sigil && <span aria-hidden className="text-[14px] leading-none">{sigil}</span>}
      <span>{children}</span>
      <span aria-hidden className="inline-block w-6 h-px bg-current opacity-40" />
    </p>
  );
}
