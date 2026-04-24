import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Button> & {
  accent?: "violet" | "cyan";
};

// Primary-weight CTA with pulsing violet halo. Use sparingly — 1–2 per view.
export function GlowButton({ className, accent = "violet", ...props }: Props) {
  return (
    <span className="relative inline-flex isolate">
      <span
        aria-hidden
        className={cn(
          "absolute -inset-1.5 rounded-[14px] blur-xl opacity-70 animate-pulse-glow -z-10",
          accent === "violet"
            ? "bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.25_295/0.6),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_center,oklch(0.74_0.15_220/0.55),transparent_70%)]",
        )}
      />
      <Button
        {...props}
        className={cn(
          "relative z-10 shadow-[0_4px_24px_-4px_oklch(0.55_0.25_295/0.7),inset_0_1px_0_oklch(1_0_0/0.15)]",
          "border border-[oklch(0.70_0.22_295/0.4)]",
          className,
        )}
      />
    </span>
  );
}
