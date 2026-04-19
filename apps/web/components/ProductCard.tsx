import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    type: string;
    price: any;
    stock: number;
    imageUrl: string | null;
    set: { name: string };
  };
};

const TYPE_LABELS: Record<string, string> = {
  PACK: "Pack",
  BOX: "Booster Box",
  ETB: "ETB",
  BUNDLE: "Bundle",
};

export function ProductCard({ product }: Props) {
  const inStock = product.stock > 0;

  return (
    <div className="group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_20px_oklch(0.54_0.24_285/0.12)] transition-all duration-200">
      <Link href={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-b from-secondary/50 to-background overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-4xl select-none">
              ◈
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground bg-card px-2 py-1 rounded-md border border-border">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-0.5 truncate">{product.set.name}</p>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs rounded-md px-1.5">
              {TYPE_LABELS[product.type] ?? product.type}
            </Badge>
            <span className="font-bold text-base text-primary">
              €{Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      {/* Add to cart */}
      <div className="px-3 pb-3 mt-auto">
        <form action={addToCart.bind(null, product.id)}>
          <Button
            size="sm"
            className="w-full gap-2"
            disabled={!inStock}
          >
            <ShoppingCart className="size-3.5" />
            {inStock ? "Add to cart" : "Out of stock"}
          </Button>
        </form>
      </div>
    </div>
  );
}
