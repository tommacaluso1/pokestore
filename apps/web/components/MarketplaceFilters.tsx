"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const TYPE_OPTIONS = [
  { value: "",              label: "All" },
  { value: "SALE",          label: "Sale" },
  { value: "TRADE",         label: "Trade" },
  { value: "TRADE_OR_SALE", label: "Trade or Sale" },
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
  const [isPending, startTransition] = useTransition();

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
    startTransition(() => router.push(`/marketplace?${params.toString()}`));
  }

  const handleSearch = useCallback(
    debounce((value: string) => update("q", value), 350),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.toString()]
  );

  function clearAll() {
    startTransition(() => router.push("/marketplace"));
  }

  const filterSelectClass = [
    "h-8 rounded-lg border border-border bg-secondary/60 px-2.5 text-xs font-medium text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
    "transition-colors hover:border-primary/50 max-w-48",
    isPending ? "opacity-60 pointer-events-none" : "",
  ].join(" ");

  return (
    <div
      className={[
        "flex flex-col gap-3 mb-8 p-4 bg-card border border-border/60 rounded-2xl",
        "shadow-[0_2px_12px_oklch(0.54_0.24_285/0.06)]",
        isPending ? "opacity-80" : "",
      ].join(" ")}
    >
      {/* Row 1: search + clear */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            key={q}
            defaultValue={q}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search card name…"
            className="pl-9 h-9 bg-secondary/50 border-border/70 focus-visible:border-primary text-sm"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium text-muted-foreground border border-border/60 hover:text-foreground hover:border-border transition-colors shrink-0"
          >
            <X className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Row 2: filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 shrink-0 mr-0.5">
          Filter
        </span>

        {/* Listing type pills */}
        <div className="flex gap-1.5 flex-wrap">
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => update("type", opt.value)}
                className={[
                  "px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150",
                  active
                    ? "bg-primary text-white border-primary shadow-[0_0_12px_oklch(0.54_0.24_285/0.35)]"
                    : "bg-secondary/40 text-foreground/80 border-border/50 hover:bg-secondary/70 hover:border-border hover:text-foreground",
                ].join(" ")}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-4 w-px bg-border/60" />

        {/* Condition */}
        <select
          value={condition}
          onChange={(e) => update("condition", e.target.value)}
          className={filterSelectClass}
        >
          {CONDITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Set */}
        {sets.length > 0 && (
          <select
            value={setId}
            onChange={(e) => update("setId", e.target.value)}
            className={filterSelectClass}
          >
            <option value="">All sets</option>
            {sets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
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
