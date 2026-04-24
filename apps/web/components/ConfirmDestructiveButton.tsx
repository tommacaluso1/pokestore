"use client";

import { useRef } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  action: () => void | Promise<void>;   // server action (already bound)
  triggerLabel: React.ReactNode;
  triggerVariant?: "outline" | "ghost" | "destructive";
  triggerClassName?: string;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

// Wraps a server action in a confirmation dialog. The hidden form submits on
// confirm click, invoking the already-bound server action. Used for
// cancel-listing / cancel-offer and any destructive one-click flow.
export function ConfirmDestructiveButton({
  action,
  triggerLabel,
  triggerVariant = "outline",
  triggerClassName,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={action} className="hidden" />
      <AlertDialog.Root>
        <AlertDialog.Trigger
          render={<Button variant={triggerVariant} size="sm" className={triggerClassName} />}
        >
          {triggerLabel}
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-150" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,26rem)] bg-card border border-border/60 rounded-2xl shadow-[0_24px_64px_-12px_oklch(0_0_0/0.6)] p-6 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 transition-all duration-150">
            <AlertDialog.Title className="text-base font-semibold text-foreground">
              {title}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </AlertDialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <AlertDialog.Close render={<Button variant="outline" size="sm" />}>
                {cancelLabel}
              </AlertDialog.Close>
              <AlertDialog.Close
                render={<Button variant="destructive" size="sm" />}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {confirmLabel}
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
