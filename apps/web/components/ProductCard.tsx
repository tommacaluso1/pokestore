import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  PACK: "Booster Pack",
  BOX: "Booster Box",
  ETB: "Elite Trainer Box",
  BUNDLE: "Bundle",
};

export function ProductCard({ product }: Props) {
  const inStock = product.stock > 0;

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors group">
      <Link href={`/products/${product.slug}`}>
        <CardContent className="p-4">
          <div className="aspect-square relative bg-black/20 rounded-md mb-3 overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-1">{product.set.name}</p>
          <h3 className="font-semibold text-sm leading-tight mb-2">{product.name}</h3>

          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {TYPE_LABELS[product.type] ?? product.type}
            </Badge>
            {!inStock && (
              <span className="text-xs text-destructive">Out of stock</span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span className="font-bold text-lg">€{Number(product.price).toFixed(2)}</span>
        <form action={addToCart.bind(null, product.id)}>
          <Button size="sm" disabled={!inStock}>Add to cart</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
