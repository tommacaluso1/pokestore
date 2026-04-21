"use client";

import { useActionState } from "react";
import { makeOfferAction } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = { listingId: string };

export function OfferForm({ listingId }: Props) {
  const boundAction = makeOfferAction.bind(null, listingId);
  const [state, formAction, pending] = useActionState(boundAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="space-y-1">
        <Label htmlFor="offerType">Offer type</Label>
        <Select id="offerType" name="offerType" required>
          <option value="">Select type</option>
          <option value="CASH">Cash</option>
          <option value="TRADE">Trade cards</option>
          <option value="MIXED">Cash + Cards</option>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="cashAmount">Cash amount (€)</Label>
        <Input id="cashAmount" name="cashAmount" type="number" step="0.01" min="0" placeholder="0.00" />
      </div>

      <div className="space-y-1">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="Optional message to the seller…" rows={2} />
      </div>

      <p className="text-xs text-muted-foreground">
        Card-based trades require selecting from your inventory — coming soon.
      </p>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send offer"}
      </Button>
    </form>
  );
}
