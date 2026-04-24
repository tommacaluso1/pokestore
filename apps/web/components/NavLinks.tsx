"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/shop",        label: "Shop" },
  { href: "/sets",        label: "Sets" },
  { href: "/marketplace", label: "Market" },
  { href: "/leaderboard", label: "Ranks" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative px-3 py-1.5 text-sm rounded-lg transition-all",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-[oklch(0.14_0.08_290/0.5)]",
            )}
          >
            <span className="relative z-10">{label}</span>
            {active && (
              <>
                <span aria-hidden className="absolute inset-0 rounded-lg bg-[oklch(0.16_0.10_290/0.6)] border border-[oklch(0.55_0.25_295/0.3)]" />
                <span aria-hidden className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[oklch(0.74_0.15_220)] shadow-[0_0_8px_oklch(0.74_0.15_220)]" />
              </>
            )}
          </Link>
        );
      })}
    </>
  );
}
