// Global ambient fog + seance pattern rendered once at the <html> root.
// Fixed-positioned, pointer-events: none, z-index 0. Drifts slowly for a
// "breathing" backdrop across every page.

export function AmbientField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Base deepening — radial vignette pulling eye to center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,oklch(0.14_0.08_295/0.6),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_100%,oklch(0.20_0.10_295/0.35),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_100%,oklch(0.18_0.08_220/0.28),transparent_70%)]" />

      {/* Drifting violet plume */}
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[140vmin] h-[140vmin] opacity-50 animate-drift-slow">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.55_0.25_295/0.25),transparent_60%)] blur-3xl" />
      </div>

      {/* Cyan counter-plume (the ghost-detector side) */}
      <div className="absolute bottom-0 -right-1/3 w-[100vmin] h-[100vmin] opacity-40 animate-drift">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.74_0.15_220/0.20),transparent_60%)] blur-3xl" />
      </div>

      {/* Seance-dot pattern */}
      <div className="absolute inset-0 pattern-seance opacity-60" />

      {/* Subtle scanline */}
      <div className="absolute inset-0 scanline opacity-40" />
    </div>
  );
}
