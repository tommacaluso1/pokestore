"use client";

import { useActionState } from "react";
import { createSet } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewSetPage() {
  const [, action, pending] = useActionState(createSet, undefined);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add Set</h1>
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Set name</Label>
          <Input id="name" name="name" placeholder="Scarlet & Violet: Prismatic Evolutions" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="series">Series</Label>
          <Input id="series" name="series" placeholder="Scarlet & Violet" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="releaseDate">Release date</Label>
          <Input id="releaseDate" name="releaseDate" type="date" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create set"}
        </Button>
      </form>
    </div>
  );
}
