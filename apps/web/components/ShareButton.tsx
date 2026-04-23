"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  url?: string;
  label?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default" | "lg";
};

export function ShareButton({ url, label = "Copy link", variant = "outline", size = "sm" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
    await navigator.clipboard.writeText(target);
    toast.success("Link copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant={variant} size={size} onClick={handleCopy} className="gap-1.5">
      {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}
