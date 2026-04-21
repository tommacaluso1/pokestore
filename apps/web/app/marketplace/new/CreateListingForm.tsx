"use client";

import { useActionState } from "react";
import { createListingAction } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateListingForm() {
  const [state, formAction, pending] = useActionState(createListingAction, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Card from your inventory</p>

        <div className="space-y-1">
          <Label htmlFor="userCardId">Inventory card ID</Label>
          <Input id="userCardId" name="userCardId" placeholder="Your UserCard ID" required />
          <p className="text-xs text-muted-foreground">
            Inventory browser coming soon — paste your card ID from your collection for now.
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Any extra details about the card…" rows={3} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Listing type</p>

        <div className="space-y-1">
          <Label htmlFor="listingType">Type</Label>
          <Select id="listingType" name="listingType" required>
            <option value="">Select type</option>
            <option value="SALE">Sale only</option>
            <option value="TRADE">Trade only</option>
            <option value="TRADE_OR_SALE">Trade or Sale</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="askingPrice">Asking price (€)</Label>
          <Input id="askingPrice" name="askingPrice" type="number" step="0.01" min="0" placeholder="0.00" />
          <p className="text-xs text-muted-foreground">Leave blank for trade-only listings.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <a href="/marketplace" className="flex-1">
          <Button variant="outline" type="button" className="w-full">Cancel</Button>
        </a>
        <Button type="submit" className="flex-1" disabled={pending}>
          {pending ? "Creating…" : "Create listing"}
        </Button>
      </div>
    </form>
  );
}
