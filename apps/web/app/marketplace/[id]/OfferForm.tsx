"use client";

import { useActionState, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
  const [selected, setSelected]   = useState<Selected>({});
  const [done, setDone]            = useState(false);

  useEffect(() => {
    if (state.success) {
      setDone(true);
      setOfferType("");
      setSelected({});
    }
  }, [state.success]);

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

  // ── Success screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="size-14 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
          <CheckCircle2 className="size-7 text-primary" />
        </div>
        <div>
          <p className="text-lg font-semibold">Offer sent!</p>
          <p className="text-sm text-muted-foreground mt-1">
            The seller will review your offer and respond shortly.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setDone(false)}>
            Send another
          </Button>
          <Link href="/marketplace/my-offers">
            <Button size="sm" className="gap-1.5">
              My offers <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Offer form ─────────────────────────────────────────────────────────────
  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <span className="mt-0.5 text-destructive">⚠</span>
          <p className="text-sm text-destructive leading-snug">{state.error}</p>
        </div>
      )}

      {/* Hidden serialised card selection */}
      <input type="hidden" name="offeredCards" value={JSON.stringify(offeredCards)} />

      {/* Offer type */}
      <div className="space-y-1.5">
        <Label htmlFor="offerType" className="text-sm font-semibold text-foreground">
          Offer type
        </Label>
        <Select
          id="offerType"
          name="offerType"
          required
          value={offerType}
          onChange={(e) => { setOfferType(e.target.value); setSelected({}); }}
          className="h-10 bg-secondary/50 border-border/80 text-foreground focus-visible:border-primary"
        >
          <option value="">Select type…</option>
          <option value="CASH">Cash only</option>
          <option value="TRADE">Trade cards</option>
          <option value="MIXED">Cash + cards</option>
        </Select>
      </div>

      {/* Cash amount */}
      {needsCash && (
        <div className="space-y-1.5">
          <Label htmlFor="cashAmount" className="text-sm font-semibold text-foreground">
            Cash amount (€)
          </Label>
          <Input
            id="cashAmount"
            name="cashAmount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className="h-10 bg-secondary/50 border-border/80"
          />
        </div>
      )}

      {/* Card picker */}
      {needsCards && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-foreground">Cards to offer</Label>
            {offeredCards.length > 0 && (
              <span className="text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                {offeredCards.length} selected
              </span>
            )}
          </div>

          {tradeable.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-secondary/20 px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No cards available in your inventory.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Open some packs or add cards before making a trade.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-secondary/20 overflow-hidden">
              <div className="divide-y divide-border/40 max-h-64 overflow-y-auto">
                {tradeable.map((uc) => {
                  const max        = availableQty(uc);
                  const isSelected = uc.id in selected;

                  return (
                    <div
                      key={uc.id}
                      onClick={() => toggleCard(uc.id, max)}
                      className={[
                        "flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors",
                        isSelected
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "hover:bg-secondary/60",
                      ].join(" ")}
                    >
                      {/* Selection indicator */}
                      <div className={[
                        "size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                        isSelected ? "border-primary bg-primary" : "border-border/60",
                      ].join(" ")}>
                        {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                      </div>

                      {/* Card thumbnail */}
                      <div className="relative w-7 h-10 shrink-0">
                        {uc.card.imageSmall ? (
                          <Image
                            src={uc.card.imageSmall}
                            alt={uc.card.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-secondary" />
                        )}
                      </div>

                      {/* Card info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate leading-tight">
                          {uc.card.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {uc.card.tcgSet.name}
                          <span className="mx-1 opacity-40">·</span>
                          {CONDITION_SHORT[uc.condition] ?? uc.condition}
                          {uc.foil && (
                            <span className="ml-1 text-amber-400/80">✦ Foil</span>
                          )}
                          <span className="mx-1 opacity-40">·</span>
                          <span className="text-foreground/70">{max} avail.</span>
                        </p>
                      </div>

                      {/* Qty spinner */}
                      {isSelected && (
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                          <Input
                            type="number"
                            min={1}
                            max={max}
                            value={selected[uc.id]}
                            onChange={(e) => setQty(uc.id, parseInt(e.target.value) || 1, max)}
                            className="w-16 h-8 text-center text-sm bg-card border-primary/40"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-sm font-semibold text-foreground">
          Message <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Describe your offer or ask the seller a question…"
          rows={3}
          className="bg-secondary/50 border-border/80 resize-none"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-sm font-semibold gap-2"
        disabled={pending || !offerType}
      >
        {pending ? "Sending…" : "Send offer"}
      </Button>
    </form>
  );
}
