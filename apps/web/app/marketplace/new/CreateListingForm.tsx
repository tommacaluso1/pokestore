"use client";

import { useState, useActionState, useMemo } from "react";
import Image from "next/image";
import { Search, CheckCircle2 } from "lucide-react";
import { createListingAction } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserInventoryItem } from "@/lib/queries/inventory";
import { CONDITION_LABELS } from "@/lib/marketplace/labels";

type InventoryItem = UserInventoryItem;

type Props = { inventory: InventoryItem[] };

export function CreateListingForm({ inventory }: Props) {
  const [state, formAction, pending] = useActionState(createListingAction, {});
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inventory.filter(
      (item) =>
        item.card.name.toLowerCase().includes(q) ||
        item.card.tcgSet.name.toLowerCase().includes(q) ||
        (item.card.rarity?.toLowerCase().includes(q) ?? false)
    );
  }, [search, inventory]);

  const activeListedQty = selected
    ? selected.listings.reduce((s, l) => s + l.quantity, 0)
    : 0;
  const availableQty = selected ? selected.quantity - activeListedQty : 0;

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      {/* Hidden field */}
      {selected && <input type="hidden" name="userCardId" value={selected.id} />}

      {/* Card picker */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Select a card from your inventory</p>

        {inventory.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Your inventory is empty. Open some packs first!
          </p>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, set or rarity…"
                className="pl-9"
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center">No cards match.</p>
              ) : (
                filtered.map((item) => {
                  const listedQty = item.listings.reduce((s, l) => s + l.quantity, 0);
                  const avail = item.quantity - listedQty;
                  const isSelected = selected?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={avail === 0}
                      onClick={() => setSelected(isSelected ? null : item)}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : avail === 0
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-secondary/40",
                      ].join(" ")}
                    >
                      {item.card.imageSmall ? (
                        <div className="relative size-10 shrink-0 rounded overflow-hidden bg-black/10">
                          <Image src={item.card.imageSmall} alt={item.card.name} fill className="object-contain" unoptimized />
                        </div>
                      ) : (
                        <div className="size-10 shrink-0 rounded bg-secondary/40" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.card.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.card.tcgSet.name} · {CONDITION_LABELS[item.condition] ?? item.condition}
                          {item.foil ? " · Foil" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {avail}/{item.quantity} avail.
                        </p>
                        {isSelected && <CheckCircle2 className="size-4 text-primary ml-auto mt-0.5" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selected && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
                Selected: <span className="font-semibold">{selected.card.name}</span>
                {" · "}{CONDITION_LABELS[selected.condition] ?? selected.condition}
                {" · "}{availableQty} available
              </div>
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity" name="quantity" type="number"
              min="1" max={availableQty || 1} defaultValue="1" required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Optional details…" rows={2} className="resize-none" />
          </div>
        </div>
      </div>

      {/* Listing type */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Listing type</p>

        <div className="flex gap-2 flex-wrap">
          {[
            { value: "SALE",          label: "Sale only" },
            { value: "TRADE",         label: "Trade only" },
            { value: "TRADE_OR_SALE", label: "Trade or Sale" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setListingType(opt.value)}
              className={[
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                listingType === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="listingType" value={listingType} />

        {listingType !== "TRADE" && (
          <div className="space-y-1">
            <Label htmlFor="askingPrice">Asking price (€)</Label>
            <Input id="askingPrice" name="askingPrice" type="number" step="0.01" min="0" placeholder="0.00" />
            <p className="text-xs text-muted-foreground">Leave blank for trade-only listings.</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <a href="/marketplace" className="flex-1">
          <Button variant="outline" type="button" className="w-full">Cancel</Button>
        </a>
        <Button
          type="submit"
          className="flex-1"
          disabled={pending || !selected || !listingType}
        >
          {pending ? "Creating…" : "Create listing"}
        </Button>
      </div>
    </form>
  );
}
