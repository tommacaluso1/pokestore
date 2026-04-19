import Link from "next/link";
import { getAllSets } from "@/lib/queries/sets";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "All Sets — PokéStore" };

export default async function SetsPage() {
  const sets = await getAllSets();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Sets</h1>
        <p className="text-muted-foreground text-sm mt-1">{sets.length} sets available</p>
      </div>

      {sets.length === 0 ? (
        <p className="text-muted-foreground text-center py-24">No sets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.slug}`}
              className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold group-hover:text-primary transition-colors leading-tight">
                    {set.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{set.series}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {set._count.products} {set._count.products === 1 ? "product" : "products"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Released{" "}
                {new Date(set.releaseDate).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
