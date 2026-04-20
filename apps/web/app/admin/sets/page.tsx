import Link from "next/link";
import { getAllSets } from "@/lib/queries/sets";
import { deleteSet } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sets — Admin" };

export default async function AdminSetsPage() {
  const sets = await getAllSets();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sets</h1>
        <Link href="/admin/sets/new">
          <Button>Add set</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {sets.map((set: (typeof sets)[number]) => (
          <div key={set.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{set.name}</p>
              <p className="text-xs text-muted-foreground">{set.series} · {set._count.products} products</p>
            </div>
            <form action={deleteSet.bind(null, set.id)}>
              <Button variant="destructive" size="sm" type="submit">Delete</Button>
            </form>
          </div>
        ))}
        {sets.length === 0 && <p className="text-muted-foreground">No sets yet.</p>}
      </div>
    </div>
  );
}
