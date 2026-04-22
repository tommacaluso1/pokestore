"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { makeOfferAction } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type InventoryCard = {
  id: string;
  quantity: number;
  condition: string;
  foil: boolean;
  card: {
    name: string;
    imageSmall: string | null;
    rarity: string | null;
    tcgSet: { name: string };
  };
  listings: { quantity: number }[];
};

const CONDITION_SHORT: Record<string, string> = {
  MINT: "M",
  NEAR_MINT: "NM",
  LIGHTLY_PLAYED: "LP",
  MODERATELY_PLAYED: "MP",
  HEAVILY_PLAYED: "HP",
  DAMAGED: "D",
};

function availableQty(card: InventoryCard): number {
  return card.quantity - card.listings.reduce((s, l) => s + l.quantity, 0);
}

type Selected = Record<string, number>;

type Props = {
  listingId: string;
  inventory: InventoryCard[];
};

export function OfferForm({ listingId, inventory }: Props) {
  const boundAction = makeOfferAction.bind(null, listingId);
  const [state, formAction, pending] = useActionState(boundAction, {});
  const [offerType, setOfferType] = useState("");
  const [selected, setSelected] = useState<Selected>({});

  const needsCards = offerType === "TRADE" || offerType === "MIXED";
  const needsCash  = offerType === "CASH"  || offerType === "MIXED";
  const tradeable  = inventory.filter((c) => availableQty(c) > 0);

  function toggleCard(id: string, max: number) {
    setSelected((prev) => {
      if (id in prev) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  }

  function setQty(id: string, val: number, max: number) {
    setSelected((prev) => ({ ...prev, [id]: Math.max(1, Math.min(val, max)) }));
  }

  const offeredCards = Object.entries(selected).map(([userCardId, quantity]) => ({
    userCardId,
    quantity,
  }));

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <input type="hidden" name="offeredCards" value={JSON.stringify(offeredCards)} />

      <div className="space-y-1">
        <Label htmlFor="offerType">Offer type</Label>
        <Select
          id="offerType"
          name="offerType"
          required
          value={offerType}
          onChange={(e) => { setOfferType(e.target.value); setSelected({}); }}
        >
          <option value="">Select type</option>
          <option value="CASH">Cash</option>
          <option value="TRADE">Trade cards</option>
          <option value="MIXED">Cash + Cards</option>
        </Select>
      </div>

      {needsCash && (
        <div className="space-y-1">
          <Label htmlFor="cashAmount">Cash amount (€)</Label>
          <Input
            id="cashAmount"
            name="cashAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
          />
        </div>
      )}

      {needsCards && (
        <div className="space-y-2">
          <Label>Cards to offer</Label>
          {tradeable.length === 0 ? (
            <p className="text-xs text-muted-foreground rounded-lg border border-border px-3 py-4 text-center">
              Your inventory has no available cards to offer.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {tradeable.map((uc) => {
                const max        = availableQty(uc);
                const isSelected = uc.id in selected;
                return (
                  <div
                    key={uc.id}
                    onClick={() => toggleCard(uc.id, max)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-8 h-11 shrink-0">
                      {uc.card.imageSmall ? (
                        <Image
                          src={uc.card.imageSmall}
                          alt={uc.card.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full rounded bg-muted" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uc.card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {uc.card.tcgSet.name}
                        {" · "}{CONDITION_SHORT[uc.condition] ?? uc.condition}
                        {uc.foil && " · Foil"}
                        {" · "}{max} avail.
                      </p>
                    </div>

                    {/* Qty spinner — stop click from toggling */}
                    {isSelected && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Input
                          type="number"
                          min={1}
                          max={max}
                          value={selected[uc.id]}
                          onChange={(e) => setQty(uc.id, parseInt(e.target.value) || 1, max)}
                          className="w-16 h-8 text-center text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {needsCards && offeredCards.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {offeredCards.length} card{offeredCards.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Optional message to the seller…"
          rows={2}
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send offer"}
      </Button>
    </form>
  );
}
