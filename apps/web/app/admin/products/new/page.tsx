"use client";

import { useActionState } from "react";
import { createProduct } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

export default function NewProductPage() {
  const [, action, pending] = useActionState(createProduct, undefined);
  const [sets, setSets] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/sets").then((r) => r.json()).then(setSets);
  }, []);

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Product name</Label>
          <Input id="name" name="name" placeholder="Booster Pack" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="setId">Set</Label>
          <select id="setId" name="setId" required
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select a set…</option>
            {sets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" required
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="PACK">Booster Pack</option>
            <option value="BOX">Booster Box</option>
            <option value="ETB">Elite Trainer Box</option>
            <option value="BUNDLE">Bundle</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (€)</Label>
            <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="4.99" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" min="0" placeholder="100" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Optional" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create product"}
        </Button>
      </form>
    </div>
  );
}
