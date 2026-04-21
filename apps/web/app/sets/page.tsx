import Link from "next/link";
import { getAllSets } from "@/lib/queries/sets";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export const metadata = { title: "All Sets — PokéStore" };

export default async function SetsPage() {
  const sets = await getAllSets();

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold">Sets</h1>
        <p className="text-muted-foreground text-sm mt-2">{sets.length} sets available</p>
      </div>

      {sets.length === 0 ? (
        <p className="text-muted-foreground text-center py-24">No sets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.slug}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-[0_0_18px_oklch(0.54_0.24_285/0.10)] transition-all duration-200 flex flex-col justify-between gap-4"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  {set.series}
                </p>
                <h2 className="font-bold text-base group-hover:text-primary transition-colors leading-tight">
                  {set.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(set.releaseDate).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {set._count.products} {set._count.products === 1 ? "product" : "products"}
                </Badge>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
