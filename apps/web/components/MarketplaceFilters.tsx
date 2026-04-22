"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TYPE_OPTIONS = [
  { value: "",               label: "All" },
  { value: "SALE",           label: "Sale" },
  { value: "TRADE",          label: "Trade" },
  { value: "TRADE_OR_SALE",  label: "Trade or Sale" },
];

const CONDITION_OPTIONS = [
  { value: "",                  label: "Any condition" },
  { value: "MINT",              label: "Mint" },
  { value: "NEAR_MINT",         label: "Near Mint" },
  { value: "LIGHTLY_PLAYED",    label: "Lightly Played" },
  { value: "MODERATELY_PLAYED", label: "Mod. Played" },
  { value: "HEAVILY_PLAYED",    label: "Heavily Played" },
  { value: "DAMAGED",           label: "Damaged" },
];

type Props = {
  sets: { id: string; name: string; series: string }[];
};

export function MarketplaceFilters({ sets }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const type      = searchParams.get("type")      ?? "";
  const condition = searchParams.get("condition") ?? "";
  const setId     = searchParams.get("setId")     ?? "";
  const q         = searchParams.get("q")         ?? "";

  const hasFilters = !!(type || condition || setId || q);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("cursor");
    startTransition(() => { router.push(`/marketplace?${params.toString()}`); });
  }

  const handleSearch = useCallback(
    debounce((value: string) => update("q", value), 350),
    [searchParams.toString()]
  );

  function clearAll() {
    startTransition(() => { router.push("/marketplace"); });
  }

  return (
    <div className="flex flex-col gap-3 mb-8 p-4 bg-card border border-border rounded-xl">
      {/* Row 1: search + clear */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            defaultValue={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search card name…"
            className="pl-9"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-muted-foreground shrink-0">
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Row 2: type + condition + set */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0 mr-1">
          <SlidersHorizontal className="size-3.5" />
          <span className="font-medium text-xs">Filter</span>
        </div>

        {/* Type pills */}
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update("type", opt.value)}
              className={[
                "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 border",
                type === opt.value
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_10px_oklch(0.54_0.24_285/0.30)]"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Condition select */}
        <select
          value={condition}
          onChange={(e) => update("condition", e.target.value)}
          className="h-7 rounded-lg border border-border bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {CONDITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Set select */}
        <select
          value={setId}
          onChange={(e) => update("setId", e.target.value)}
          className="h-7 rounded-lg border border-border bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-44"
        >
          <option value="">All sets</option>
          {sets.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}
