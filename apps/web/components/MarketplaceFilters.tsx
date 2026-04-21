"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_OPTIONS = [
  { value: "",              label: "All listings" },
  { value: "SALE",         label: "For sale" },
  { value: "TRADE",        label: "Trade only" },
  { value: "TRADE_OR_SALE", label: "Trade or sale" },
];

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("type", value);
    else params.delete("type");
    router.push(`/marketplace?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
        <SlidersHorizontal className="size-4" />
        <span className="font-semibold">Filter</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border",
              type === opt.value
                ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_oklch(0.54_0.24_285/0.35)]"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {type && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter("")}
          className="ml-auto gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
