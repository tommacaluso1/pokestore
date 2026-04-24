export default function Loading() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 w-48 bg-secondary/50 rounded-lg" />
      <div className="space-y-2 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-card border border-border/40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
