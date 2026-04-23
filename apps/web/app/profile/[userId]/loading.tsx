export default function ProfileLoading() {
  return (
    <div>
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5 mb-8">
        <div className="h-3 w-8 rounded bg-muted/50 animate-pulse" />
        <div className="h-3 w-3 rounded bg-muted/30 animate-pulse" />
        <div className="h-3 w-28 rounded bg-muted/50 animate-pulse" />
      </div>

      {/* Profile header skeleton */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6 animate-pulse">
        <div className="h-28 bg-muted/30" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-muted/50 ring-4 ring-background shrink-0" />
            <div className="pb-1 space-y-2 flex-1">
              <div className="h-6 w-40 rounded-lg bg-muted/50" />
              <div className="h-4 w-24 rounded bg-muted/30" />
            </div>
          </div>
          {/* XP bar skeleton */}
          <div className="h-2 w-full rounded-full bg-muted/30 mb-4" />
          {/* Bio skeleton */}
          <div className="space-y-1.5">
            <div className="h-3 w-full rounded bg-muted/30" />
            <div className="h-3 w-4/5 rounded bg-muted/30" />
          </div>
        </div>
      </div>

      {/* Stats tabs skeleton */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="h-6 w-8 rounded bg-muted/50 mx-auto mb-1" />
            <div className="h-3 w-12 rounded bg-muted/30 mx-auto" />
          </div>
        ))}
      </div>

      {/* Badges skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="h-5 w-24 rounded bg-muted/50 mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
