"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { fileReportAction } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  { value: "FAKE_LISTING",       label: "Fake listing" },
  { value: "ITEM_NOT_RECEIVED",  label: "Item not received" },
  { value: "WRONG_ITEM_SENT",    label: "Wrong item sent" },
  { value: "HARASSMENT",        label: "Harassment" },
  { value: "SCAM",              label: "Scam" },
  { value: "OTHER",             label: "Other" },
];

type Props = { reportedId: string; offerId?: string };

export function ReportUserButton({ reportedId, offerId }: Props) {
  const boundAction = fileReportAction.bind(null, reportedId);
  const [state, formAction, pending] = useActionState(boundAction, {});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success("Report submitted. Our team will review it.");
      setOpen(false);
    }
  }, [state.success]);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive transition-colors"
      >
        <Flag className="size-3" />
        Report
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2 p-3 rounded-xl border border-border/60 bg-card">
      {offerId && <input type="hidden" name="offerId" value={offerId} />}

      <select
        name="reason"
        required
        defaultValue=""
        className="w-full h-8 rounded-lg border border-border/80 bg-secondary/50 text-xs px-2 text-foreground"
      >
        <option value="" disabled>Select reason…</option>
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <Textarea
        name="description"
        placeholder="Additional details (optional)"
        rows={2}
        className="bg-secondary/50 border-border/80 resize-none text-xs"
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={pending} className="text-xs h-7 px-3">
          {pending ? "Sending…" : "Submit report"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)} className="text-xs h-7 px-3">
          Cancel
        </Button>
      </div>
    </form>
  );
}
