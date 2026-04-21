import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSetBySlug } from "@/lib/queries/sets";
import { ProductCard } from "@/components/ProductCard";

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
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/sets" className="hover:text-foreground transition-colors">Sets</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{set.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {set.series}
        </p>
        <h1 className="text-4xl font-bold">{set.name}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Released{" "}
          {new Date(set.releaseDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}{" "}
          · {set.products.length} {set.products.length === 1 ? "product" : "products"}
        </p>
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
