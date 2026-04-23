"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { createReviewAction } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type Props = { offerId: string; sellerName: string };

export function ReviewForm({ offerId, sellerName }: Props) {
  const boundAction = createReviewAction.bind(null, offerId);
  const [state, formAction, pending] = useActionState(boundAction, {});
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Review submitted!");
      setDone(true);
    }
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  if (done) {
    return (
      <p className="text-xs text-emerald-400 font-medium">Review submitted ✓</p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="rating" value={selected} />

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(n)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`size-5 transition-colors ${
                n <= (hovered || selected)
                  ? "fill-amber-400 text-amber-400"
                  : "text-border fill-transparent"
              }`}
            />
          </button>
        ))}
        {selected > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            {["", "Poor", "Fair", "Good", "Great", "Excellent"][selected]}
          </span>
        )}
      </div>

      <Textarea
        name="comment"
        placeholder={`Leave a comment about ${sellerName}… (optional)`}
        rows={2}
        className="bg-secondary/50 border-border/80 resize-none text-xs"
      />

      <Button
        type="submit"
        size="sm"
        disabled={pending || selected === 0}
        className="h-7 px-3 text-xs"
      >
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
