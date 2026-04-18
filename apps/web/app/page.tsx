import Link from "next/link";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getAllSets } from "@/lib/queries/sets";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [products, sets] = await Promise.all([
    getFeaturedProducts(8),
    getAllSets(),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-primary">Pokémon</span> Booster Packs
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Authentic sealed products. Every set, every format.
        </p>
        <Link href="/sets">
          <Button size="lg" className="mt-2">Browse All Sets</Button>
        </Link>
      </section>

      {/* Sets */}
      {sets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Sets</h2>
            <Link href="/sets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sets.slice(0, 8).map((set) => (
              <Link
                key={set.id}
                href={`/sets/${set.slug}`}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors text-center"
              >
                <p className="font-semibold text-sm">{set.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{set.series}</p>
                <p className="text-xs text-primary mt-1">{set._count.products} products</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No products yet.</p>
          <p className="text-sm mt-1">Add some from the admin panel.</p>
        </section>
      )}
    </div>
  );
}
