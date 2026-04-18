import { notFound } from "next/navigation";
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
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">{set.series}</p>
        <h1 className="text-3xl font-bold">{set.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Released{" "}
          {new Date(set.releaseDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {set.products.length === 0 ? (
        <p className="text-muted-foreground">No products in this set yet.</p>
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
