export default function Loading() {
  return (
    <div className="max-w-xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-secondary/50 rounded-lg" />
      <div className="h-64 bg-card border border-border/40 rounded-2xl" />
      <div className="h-10 bg-secondary/40 rounded-lg" />
    </div>
  );
}
