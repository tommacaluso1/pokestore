import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, Ghost } from "lucide-react";
import { getProducts } from "@/lib/queries/products";
import { getAllSets } from "@/lib/queries/sets";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ProductType } from "@repo/db";

export const metadata = { title: "Shop — PokéStore" };

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "PACK", label: "Booster Pack" },
  { value: "BOX", label: "Booster Box" },
  { value: "ETB", label: "Elite Trainer Box" },
  { value: "BUNDLE", label: "Bundle" },
];

type Props = { searchParams: Promise<{ type?: string; set?: string; inStock?: string }> };

export default async function ShopPage({ searchParams }: Props) {
  const { type, set: setId, inStock } = await searchParams;

  const [products, sets] = await Promise.all([
    getProducts({
      type: type as ProductType | undefined,
      setId: setId || undefined,
      inStock: inStock === "1",
      limit: 48,
    }),
    getAllSets(),
  ]);

  const activeFilters = [type, setId, inStock === "1"].filter(Boolean).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Shop</h1>
        <p className="text-muted-foreground text-sm">
          {products.length} product{products.length !== 1 ? "s" : ""}
          {activeFilters > 0 ? " (filtered)" : ""}
        </p>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-3 mb-8 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mr-1">
          <SlidersHorizontal className="size-4" />
          <span className="font-medium">Filter</span>
        </div>

        <Select name="type" defaultValue={type ?? ""} className="w-40">
          {TYPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>

        <Select name="set" defaultValue={setId ?? ""} className="w-44">
          <option value="">All sets</option>
          {sets.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            name="inStock"
            value="1"
            defaultChecked={inStock === "1"}
            className="accent-primary"
          />
          <span className="text-muted-foreground">In stock only</span>
        </label>

        <div className="flex gap-2 ml-auto">
          <Button type="submit" size="sm">Apply</Button>
          {activeFilters > 0 && (
            <Link href="/shop">
              <Button variant="ghost" size="sm">Clear</Button>
            </Link>
          )}
        </div>
      </form>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-border/40 rounded-2xl">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.54_0.24_285/0.35),transparent_70%)] blur-lg" />
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
              fill
              className="object-contain opacity-50 drop-shadow-[0_0_16px_oklch(0.54_0.24_285/0.4)]"
              unoptimized
            />
          </div>
          <p className="font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
          <Link href="/shop" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Clear filters</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
