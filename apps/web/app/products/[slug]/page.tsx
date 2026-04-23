import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Package, Tag } from "lucide-react";
import { getProductBySlug } from "@/lib/queries/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";
import { PackModelClient } from "@/components/PackModelClient";

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
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="size-3" />
        <Link href={`/sets/${product.set.slug}`} className="hover:text-foreground transition-colors">
          {product.set.name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* 3D Pack Model */}
        <div className="relative aspect-square bg-gradient-to-b from-secondary/40 to-background border border-border rounded-2xl overflow-hidden">
          <PackModelClient
            productType={product.type}
            setSlug={product.set.slug}
            setName={product.set.name}
            imageUrl={product.imageUrl}
            logoUrl={product.set.logoUrl}
            cameraZ={2.0}
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.set.name}</p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
          </div>

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <Package className="size-3" />
              {TYPE_LABELS[product.type] ?? product.type}
            </Badge>
            <Badge variant={inStock ? "outline" : "destructive"} className="gap-1">
              {inStock ? `${product.stock} in stock` : "Out of stock"}
            </Badge>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 py-4 border-t border-border">
            <Tag className="size-4 text-muted-foreground" />
            <span className="text-3xl font-bold text-primary">
              €{Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Add to cart */}
          <form action={addToCart.bind(null, product.id)}>
            <Button size="lg" className="w-full gap-2" disabled={!inStock}>
              <ShoppingCart className="size-4" />
              {inStock ? "Add to cart" : "Out of stock"}
            </Button>
          </form>

          {/* Back link */}
          <Link
            href={`/sets/${product.set.slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            ← More from {product.set.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
