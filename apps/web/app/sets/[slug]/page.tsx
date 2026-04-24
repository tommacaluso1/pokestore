import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getSetBySlug } from "@/lib/queries/sets";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const set = await getSetBySlug(slug);
  if (!set) return {};
  return { title: `${set.name} — PokéStore` };
}

export default async function SetPage({ params }: Props) {
  const { slug } = await params;
  const set = await getSetBySlug(slug);
  if (!set) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/sets" className="hover:text-foreground transition-colors">Sets</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{set.name}</span>
      </nav>

      {/* Set hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-10 border border-border/40">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.13_0.07_285)] to-[oklch(0.09_0.04_285)]" />
        <div aria-hidden className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(oklch(0.95_0.02_295)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_120%,oklch(0.54_0.24_285/0.18),transparent_70%)]" />

        {/* Symbol watermark */}
        {set.symbolUrl && (
          <div aria-hidden className="absolute right-6 top-1/2 -translate-y-1/2 w-32 h-32 opacity-10">
            <Image src={set.symbolUrl} alt="" fill className="object-contain" unoptimized />
          </div>
        )}

        <div className="relative px-8 py-10 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Logo */}
          {set.logoUrl && (
            <div className="relative w-52 h-20 shrink-0 drop-shadow-[0_4px_20px_oklch(0_0_0/0.5)]">
              <Image src={set.logoUrl} alt={set.name} fill className="object-contain object-left" unoptimized />
            </div>
          )}
          <div className="sm:pb-0.5 text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80 mb-1">
              {set.series}
            </p>
            {!set.logoUrl && (
              <h1 className="text-3xl font-bold text-foreground mb-1">{set.name}</h1>
            )}
            <p className="text-sm text-muted-foreground">
              Released{" "}
              {new Date(set.releaseDate).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
              {" · "}
              <span className="text-foreground font-medium">
                {set.products.length} {set.products.length === 1 ? "product" : "products"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {set.products.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-border/50 rounded-2xl text-muted-foreground">
          <p className="font-medium">No products in this set yet.</p>
          <p className="text-sm mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {set.products.map((product) => (
            <ProductCard key={product.id} product={{ ...product, set }} />
          ))}
        </div>
      )}
    </div>
  );
}
