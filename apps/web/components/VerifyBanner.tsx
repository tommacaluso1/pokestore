"use client";

import { useState, useTransition } from "react";
import { Mail, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { resendVerificationAction } from "@/lib/actions/auth";

// Sticky banner shown under the navbar when the current user has not yet
// verified their email. Dismissible per-session via state. Server is the
// source of truth — closing the banner doesn't hide the gate on actions.
export function VerifyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (dismissed) return null;

  const onResend = () => {
    startTransition(async () => {
      const result = await resendVerificationAction();
      if (result.ok) {
        toast.success("Verification email sent — check your inbox.");
      } else {
        toast.error(result.error ?? "Couldn't resend right now.");
      }
    });
  };

  return (
    <div className="sticky top-16 z-40">
      <div className="relative overflow-hidden border-b border-[oklch(0.82_0.16_88/0.3)] bg-[oklch(0.18_0.10_85/0.7)] backdrop-blur-md">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,oklch(0.82_0.16_88/0.18),transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 h-12 flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center size-7 rounded-full bg-[oklch(0.30_0.14_88/0.5)] border border-[oklch(0.82_0.16_88/0.45)]">
              <Mail className="size-3.5 text-[oklch(0.92_0.14_88)]" />
            </div>
            <p className="text-[oklch(0.94_0.06_88)] truncate">
              <span className="font-semibold hidden sm:inline">Verify your email</span>
              <span className="hidden sm:inline mx-1.5 opacity-50">·</span>
              <span className="text-[oklch(0.85_0.10_88)]">Required to list cards or trade.</span>
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onResend}
              disabled={pending}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[oklch(0.82_0.16_88/0.4)] bg-[oklch(0.30_0.14_88/0.4)] text-[oklch(0.94_0.10_88)] hover:bg-[oklch(0.36_0.14_88/0.5)] hover:border-[oklch(0.82_0.16_88/0.6)] transition-all disabled:opacity-60 inline-flex items-center gap-1.5"
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <Mail className="size-3" />}
              {pending ? "Sending…" : "Resend"}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="size-7 rounded-md flex items-center justify-center text-[oklch(0.85_0.10_88)]/70 hover:text-[oklch(0.92_0.14_88)] hover:bg-[oklch(0.30_0.14_88/0.4)] transition-colors"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
