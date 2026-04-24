export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto space-y-3 animate-pulse">
      <div className="h-8 w-40 bg-secondary/50 rounded-lg" />
      <div className="h-4 w-56 bg-secondary/40 rounded" />
      <div className="space-y-3 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border/40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
