"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto py-24 text-center">
      <h2 className="text-lg font-semibold text-foreground">Something went wrong loading the marketplace.</h2>
      <p className="text-sm text-muted-foreground mt-2">
        This is usually temporary. Try again in a moment.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
