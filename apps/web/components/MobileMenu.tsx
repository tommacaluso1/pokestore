"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/sets", label: "Sets" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/orders", label: "Orders" },
];

export function MobileMenu({ isAdmin }: { isAdmin?: boolean }) {
  const adminLinks = isAdmin ? [{ href: "/admin", label: "Admin" }] : [];
  const links = [...baseLinks, ...adminLinks];
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-lg px-6 py-4 flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
