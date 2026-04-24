// Decorative floating violet / cyan orbs. Place inside a relative container
// that defines the bounds. Pure CSS — no JS.

type Props = {
  className?: string;
  count?: number;
};

export function FloatingOrbs({ className, count = 5 }: Props) {
  // Deterministic seeds so SSR + client match
  const orbs = Array.from({ length: count }).map((_, i) => {
    const seed = (i * 137) % 100;
    const left = (seed * 3.7) % 100;
    const top  = (seed * 5.3) % 100;
    const size = 40 + (seed % 60);
    const delay = (seed % 10) * -0.6;
    const dur = 6 + (seed % 7);
    const isCyan = seed % 3 === 0;
    return { left, top, size, delay, dur, isCyan };
  });

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {orbs.map((o, i) => (
        <span
          key={i}
          className="absolute rounded-full blur-2xl animate-float"
          style={{
            left:  `${o.left}%`,
            top:   `${o.top}%`,
            width: `${o.size}px`,
            height:`${o.size}px`,
            animationDuration: `${o.dur}s`,
            animationDelay:    `${o.delay}s`,
            background: o.isCyan
              ? "radial-gradient(circle at 50% 50%, oklch(0.74 0.15 220 / 0.55), transparent 70%)"
              : "radial-gradient(circle at 50% 50%, oklch(0.55 0.25 295 / 0.55), transparent 70%)",
          }}
        />
      ))}
    </div>
  );
}
