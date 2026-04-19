"use client";

import { useActionState } from "react";
import { createListing } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CreateListingForm() {
  const [state, formAction, pending] = useActionState(createListing, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Card details</p>

        <div className="space-y-1">
          <Label htmlFor="title">Listing title</Label>
          <Input id="title" name="title" placeholder="e.g. Charizard ex — Scarlet & Violet" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="cardName">Card name</Label>
            <Input id="cardName" name="cardName" placeholder="Charizard ex" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="setName">Set name</Label>
            <Input id="setName" name="setName" placeholder="Scarlet & Violet" />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="condition">Condition</Label>
          <Select id="condition" name="condition" required>
            <option value="">Select condition</option>
            <option value="MINT">Mint</option>
            <option value="NEAR_MINT">Near Mint</option>
            <option value="LIGHTLY_PLAYED">Lightly Played</option>
            <option value="MODERATELY_PLAYED">Moderately Played</option>
            <option value="HEAVILY_PLAYED">Heavily Played</option>
            <option value="DAMAGED">Damaged</option>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Any extra details about the card..." rows={3} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
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
          {pending ? "Creating..." : "Create listing"}
        </Button>
      </div>
    </form>
  );
}
