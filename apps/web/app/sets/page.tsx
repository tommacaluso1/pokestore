import Link from "next/link";
import Image from "next/image";
import { getAllSets } from "@/lib/queries/sets";

export const metadata = { title: "All Sets — PokéStore" };

export default async function SetsPage() {
  const sets = await getAllSets();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Sets</h1>
        <p className="text-muted-foreground text-sm mt-2">{sets.length} sets available</p>
      </div>

      {sets.length === 0 ? (
        <p className="text-muted-foreground text-center py-24">No sets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.slug}`}
              className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-[0_4px_28px_oklch(0.54_0.24_285/0.14)] transition-all duration-300 flex flex-col"
            >
              {/* Background glow on hover */}
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,oklch(0.54_0.24_285/0.10),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Set logo area */}
              <div className="relative h-36 bg-gradient-to-b from-[oklch(0.13_0.07_285)] to-[oklch(0.10_0.04_285)] flex items-center justify-center overflow-hidden border-b border-border/40">
                {/* Dot grid background */}
                <div aria-hidden className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(oklch(0.95_0.02_295)_1px,transparent_1px)] [background-size:20px_20px]" />
                {/* Symbol watermark (far right, large, subtle) */}
                {set.symbolUrl && (
                  <div aria-hidden className="absolute right-3 bottom-2 w-20 h-20 opacity-10">
                    <Image src={set.symbolUrl} alt="" fill className="object-contain" unoptimized />
                  </div>
                )}
                {set.logoUrl ? (
                  <div className="relative w-48 h-24 drop-shadow-[0_2px_16px_oklch(0_0_0/0.5)] group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={set.logoUrl}
                      alt={set.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p className="text-lg font-bold text-foreground/60 px-4 text-center">{set.name}</p>
                )}
              </div>

              {/* Card info */}
              <div className="relative p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-0.5">
                    {set.series}
                  </p>
                  <h2 className="font-bold text-sm group-hover:text-primary transition-colors leading-snug">
                    {set.name}
                  </h2>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-xs text-muted-foreground">
                    {new Date(set.releaseDate).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <span className="text-xs font-semibold text-primary/80 group-hover:text-primary transition-colors">
                    {set._count.products} products →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
