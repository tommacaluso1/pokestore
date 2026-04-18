import Link from "next/link";
import { getAllSets } from "@/lib/queries/sets";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "All Sets — PokéStore" };

export default async function SetsPage() {
  const sets = await getAllSets();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">All Sets</h1>

      {sets.length === 0 ? (
        <p className="text-muted-foreground">No sets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/sets/${set.slug}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{set.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{set.series}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(set.releaseDate).toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="secondary">{set._count.products}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
