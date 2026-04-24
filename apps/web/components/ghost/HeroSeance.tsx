"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Ghost } from "lucide-react";
import { GlowButton } from "@/components/ghost/GlowButton";
import { FloatingOrbs } from "@/components/ghost/FloatingOrbs";
import { SectionEyebrow } from "@/components/ghost/SectionEyebrow";
import { Button } from "@/components/ui/button";

type Props = {
  stats: { listings: number; trades: number; collectors: number };
};

// Mouse-parallax Gengar + staggered reveal + stat ribbon.
// Asymmetric: title on the left, Gengar offset right, spilling out of container.
export function HeroSeance({ stats }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gengarRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let rafId: number | null = null;
    let px = 0, py = 0; // target
    let cx = 0, cy = 0; // current (lerped)

    const tick = () => {
      cx += (px - cx) * 0.08;
      cy += (py - cy) * 0.08;
      if (gengarRef.current) {
        gengarRef.current.style.transform =
          `translate3d(${cx * -24}px, ${cy * -24}px, 0) rotate(${cx * -2}deg)`;
      }
      if (shineRef.current) {
        shineRef.current.style.background =
          `radial-gradient(ellipse 40% 30% at ${50 + cx * 20}% ${40 + cy * 20}%, oklch(0.74 0.15 220 / 0.22), transparent 70%)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;  // -1..1
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };

    root.addEventListener("mousemove", onMove);
    rafId = requestAnimationFrame(tick);

    return () => {
      root.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden rounded-[2rem] border border-[oklch(0.55_0.25_295/0.22)] isolate"
    >
      {/* ── Layered backdrop ─────────────────────────────────────────────── */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-[oklch(0.10_0.05_290)] via-[oklch(0.08_0.04_285)] to-[oklch(0.06_0.03_285)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_100%,oklch(0.22_0.14_295/0.5),transparent_60%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_0%,oklch(0.25_0.18_220/0.35),transparent_60%)]" />
      <div aria-hidden className="absolute inset-0 pattern-seance opacity-50" />
      <div aria-hidden className="absolute inset-0 scanline opacity-30" />

      {/* Mouse-driven cyan shine */}
      <div ref={shineRef} aria-hidden className="pointer-events-none absolute inset-0" />

      {/* Orbs — float around the whole hero */}
      <FloatingOrbs count={7} />

      {/* ── Gengar focal — absolute right, parallax ──────────────────────── */}
      <div
        ref={gengarRef}
        className="pointer-events-none absolute right-[-8%] top-1/2 -translate-y-1/2 w-[70vmin] h-[70vmin] sm:w-[56vmin] sm:h-[56vmin] lg:w-[48vmin] lg:h-[48vmin] max-w-[640px] max-h-[640px] will-change-transform"
      >
        {/* Ground aura */}
        <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[20%] rounded-full blur-3xl bg-[oklch(0.55_0.25_295/0.6)] opacity-70 animate-breathe" />
        {/* Eye-line aura */}
        <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-3xl bg-[radial-gradient(circle_at_center,oklch(0.55_0.25_295/0.55),transparent_65%)] animate-pulse-glow" />

        <Image
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
          alt="Gengar, ghost of the marketplace"
          fill
          priority
          unoptimized
          className="object-contain drop-shadow-[0_0_56px_oklch(0.55_0.25_295/0.7)] animate-float"
        />
      </div>

      {/* ── Content stack ────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 px-6 sm:px-12 lg:px-16 py-20 sm:py-28 lg:py-36 max-w-[56rem]"
        initial="hidden"
        animate="visible"
        variants={{
          hidden:  {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        }}
      >
        <motion.div
          variants={{
            hidden:  { opacity: 0, y: 16, filter: "blur(6px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="mb-6"
        >
          <SectionEyebrow sigil="✦" accent="violet">Séance Open · {stats.listings} listings live</SectionEyebrow>
        </motion.div>

        <motion.h1
          variants={{
            hidden:  { opacity: 0, y: 24, filter: "blur(8px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.04em] mb-8"
        >
          Cards <span className="italic font-normal ghost-text">whisper</span><br />
          back, here.
        </motion.h1>

        <motion.p
          variants={{
            hidden:  { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="text-base sm:text-lg text-foreground/75 max-w-md mb-10 leading-relaxed"
        >
          A haunted little storefront for Pokémon TCG. Seal-fresh packs from the shelf,
          rarities from other trainers&apos; binders. Trade, sell, or both.
        </motion.p>

        <motion.div
          variants={{
            hidden:  { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
          }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link href="/shop">
            <GlowButton size="lg" className="gap-2 pl-5 pr-6 h-12 text-base">
              <Sparkles className="size-4" />
              Open the shop
            </GlowButton>
          </Link>
          <Link href="/marketplace">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 h-12 px-5 text-base bg-[oklch(0.10_0.05_290/0.5)] backdrop-blur-sm border-[oklch(0.55_0.25_295/0.3)] hover:bg-[oklch(0.14_0.08_290/0.6)] hover:border-[oklch(0.55_0.25_295/0.5)]"
            >
              <Ghost className="size-4" />
              Marketplace
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Stat ribbon — spaced, mono */}
        <motion.div
          variants={{
            hidden:  { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1, delay: 0.4 } },
          }}
          className="mt-16 sm:mt-24 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-[oklch(0.55_0.25_295/0.15)] pt-6"
        >
          {[
            { label: "Listings live",  value: stats.listings },
            { label: "Trades sealed",  value: stats.trades   },
            { label: "Trainers",       value: stats.collectors },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-semibold text-foreground tabular-nums">
                {s.value.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                {s.label}
              </span>
            </div>
          ))}
          <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-[oklch(0.74_0.15_220)]/80 inline-flex items-center gap-2">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[oklch(0.74_0.15_220)] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full size-1.5 bg-[oklch(0.74_0.15_220)]" />
            </span>
            Spectre online
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
