export default function MarketplaceLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-10 w-48 rounded-lg bg-muted/50 animate-pulse" />
          <div className="h-4 w-28 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-muted/40 animate-pulse" />
          <div className="h-9 w-28 rounded-lg bg-muted/50 animate-pulse" />
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="h-24 rounded-xl bg-muted/30 animate-pulse mb-8" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-muted/40 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 rounded bg-muted/50 w-4/5" />
                  <div className="h-3 rounded bg-muted/30 w-2/3" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 rounded-full bg-muted/40" />
                <div className="h-6 w-20 rounded bg-muted/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
