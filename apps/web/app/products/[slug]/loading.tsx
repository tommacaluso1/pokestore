export default function ProductLoading() {
  return (
    <div>
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5 mb-8">
        <div className="h-3 w-8 rounded bg-muted/50 animate-pulse" />
        <div className="h-3 w-3 rounded bg-muted/30 animate-pulse" />
        <div className="h-3 w-20 rounded bg-muted/50 animate-pulse" />
        <div className="h-3 w-3 rounded bg-muted/30 animate-pulse" />
        <div className="h-3 w-32 rounded bg-muted/50 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image skeleton */}
        <div className="aspect-square rounded-2xl bg-muted/40 animate-pulse" />

        {/* Info panel skeleton */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="h-8 w-3/4 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted/30 animate-pulse" />
          </div>
          <div className="h-6 w-20 rounded-full bg-muted/40 animate-pulse" />
          <div className="h-10 w-28 rounded-lg bg-muted/50 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 rounded bg-muted/30 w-full animate-pulse" />
            <div className="h-4 rounded bg-muted/30 w-5/6 animate-pulse" />
            <div className="h-4 rounded bg-muted/30 w-4/6 animate-pulse" />
          </div>
          <div className="h-12 rounded-xl bg-muted/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
