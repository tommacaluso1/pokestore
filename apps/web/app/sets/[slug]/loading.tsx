export default function SetLoading() {
  return (
    <div>
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5 mb-8">
        <div className="h-3 w-8 rounded bg-muted/50 animate-pulse" />
        <div className="h-3 w-3 rounded bg-muted/30 animate-pulse" />
        <div className="h-3 w-24 rounded bg-muted/50 animate-pulse" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-9 w-64 rounded-lg bg-muted/50 animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted/30 animate-pulse" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted/40" />
            <div className="p-3 space-y-2">
              <div className="h-4 rounded bg-muted/50 w-3/4" />
              <div className="h-3 rounded bg-muted/30 w-1/2" />
              <div className="h-5 rounded bg-muted/40 w-1/3 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
