import Link from "next/link";
import { getAllProducts } from "@/lib/queries/admin";
import { deleteProduct } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {products.map((p: (typeof products)[number]) => (
          <div key={p.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.set.name}</p>
            </div>
            <Badge variant="secondary">{p.type}</Badge>
            <span className="text-sm font-semibold">€{Number(p.price).toFixed(2)}</span>
            <span className="text-sm text-muted-foreground w-16 text-right">{p.stock} in stock</span>
            <form action={deleteProduct.bind(null, p.id)}>
              <Button variant="destructive" size="sm" type="submit">Delete</Button>
            </form>
          </div>
        ))}
        {products.length === 0 && <p className="text-muted-foreground">No products yet.</p>}
      </div>
    </div>
  );
}
