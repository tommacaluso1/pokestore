import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/queries/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

const TYPE_LABELS: Record<string, string> = {
  PACK: "Booster Pack",
  BOX: "Booster Box",
  ETB: "Elite Trainer Box",
  BUNDLE: "Bundle",
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} — PokéStore` };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const inStock = product.stock > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href={`/sets/${product.set.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
        ← {product.set.name}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square relative bg-card border border-border rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-6" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{product.set.name}</p>
            <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          </div>

          <Badge variant="secondary">{TYPE_LABELS[product.type] ?? product.type}</Badge>

          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-3xl font-bold mb-1">€{Number(product.price).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">
              {inStock ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>

          <Button size="lg" className="w-full" disabled={!inStock}>
            {inStock ? "Add to cart" : "Out of stock"}
          </Button>
        </div>
      </div>
    </div>
  );
}
