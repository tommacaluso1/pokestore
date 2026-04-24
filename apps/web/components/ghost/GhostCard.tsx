"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** Enable 3D mouse-tracking tilt. Default true. */
  tilt?: boolean;
  /** Glow intensity 0-3. */
  glow?: 0 | 1 | 2 | 3;
  /** Accent hue for glow — violet | cyan | magenta | gold */
  accent?: "violet" | "cyan" | "magenta" | "gold";
  as?: "div" | "article" | "section";
};

const GLOW: Record<NonNullable<Props["glow"]>, string> = {
  0: "",
  1: "shadow-[0_4px_24px_-8px_oklch(0_0_0/0.4),0_0_0_1px_oklch(0.55_0.25_295/0.1)]",
  2: "shadow-[0_8px_40px_-8px_oklch(0_0_0/0.5),0_0_0_1px_oklch(0.55_0.25_295/0.18),0_0_32px_-8px_oklch(0.55_0.25_295/0.25)]",
  3: "shadow-[0_16px_56px_-12px_oklch(0_0_0/0.55),0_0_0_1px_oklch(0.55_0.25_295/0.25),0_0_64px_-12px_oklch(0.55_0.25_295/0.45)]",
};

const ACCENT_GRADIENT: Record<NonNullable<Props["accent"]>, string> = {
  violet:  "from-[oklch(0.55_0.25_295/0.14)] via-transparent to-transparent",
  cyan:    "from-[oklch(0.74_0.15_220/0.14)] via-transparent to-transparent",
  magenta: "from-[oklch(0.66_0.28_335/0.12)] via-transparent to-transparent",
  gold:    "from-[oklch(0.82_0.16_88/0.12)]  via-transparent to-transparent",
};

// Ghost card — layered surface with hover bloom + optional 3D tilt.
// Always: fog radial + main surface + edge aura. Hover: bloom + slight tilt.
export function GhostCard({
  children,
  className,
  tilt = true,
  glow = 1,
  accent = "violet",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0..1
    const y = (e.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * 6;   // -3..3
    const rotX = (0.5 - y) * 6;
    ref.current.style.setProperty("--rx", `${rotX.toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${rotY.toFixed(2)}deg`);
    ref.current.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };

  const Component = Tag as "div";

  return (
    <Component
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" } as React.CSSProperties}
      className={cn(
        "group/ghostcard relative rounded-2xl bg-deep border border-[oklch(0.22_0.08_285/0.8)]",
        "transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-[oklch(0.55_0.25_295/0.45)]",
        tilt && "[transform:perspective(900px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))]",
        GLOW[glow],
        className,
      )}
    >
      {/* Inner accent — radial gradient following cursor */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover/ghostcard:opacity-100 transition-opacity duration-500",
          "bg-[radial-gradient(ellipse_40%_60%_at_var(--gx,50%)_var(--gy,50%),oklch(0.55_0.25_295/0.18),transparent_70%)]",
        )}
      />

      {/* Static accent wash */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-60 bg-gradient-to-br",
          ACCENT_GRADIENT[accent],
        )}
      />

      {/* Top rim light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.70_0.22_295/0.5)] to-transparent"
      />

      <div className="relative">{children}</div>
    </Component>
  );
}
