"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ListChecks, Mailbox, Package, Shield, LogOut, Sparkles, ShoppingBag, Library, Compass, Trophy, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { LevelBadge } from "@/components/LevelBadge";

const browseLinks = [
  { href: "/shop",        label: "Shop",        Icon: ShoppingBag },
  { href: "/sets",        label: "Sets",        Icon: Library },
  { href: "/marketplace", label: "Marketplace", Icon: Compass },
  { href: "/leaderboard", label: "Leaderboard", Icon: Trophy },
];

type SignedInUser = {
  id:       string;
  name:     string | null;
  email:    string | null;
  avatarId: string | null;
  level:    number | null;
  isAdmin:  boolean;
  unverified: boolean;
};

type Props = {
  user?: SignedInUser | null;
  signOutAction?: () => void | Promise<void>;
};

// Two-section mobile drawer. When signed in: account block at the top
// (avatar, level, name + email + verified state) followed by account
// actions (profile, my listings, my offers, orders, admin, sign out).
// Always: browse links underneath. Logged out: browse + sign-in / register CTAs.
export function MobileMenu({ user, signOutAction }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[oklch(0.16_0.08_290/0.6)] transition-colors"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-[oklch(0.04_0.02_285/0.7)] backdrop-blur-sm"
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-label="Mobile menu"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[oklch(0.08_0.04_285/0.95)] backdrop-blur-xl border-b border-[oklch(0.55_0.25_295/0.25)] shadow-[0_24px_64px_-12px_oklch(0_0_0/0.6)]"
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.25_295/0.45)] to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-0 pattern-seance opacity-20" />

            <div className="relative px-4 pt-4 pb-5 space-y-4">

              {/* ─── Account block (signed in) ────────────────────── */}
              {user && (
                <>
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-2xl bg-[oklch(0.10_0.06_290/0.7)] border border-[oklch(0.55_0.25_295/0.25)] p-3 hover:border-[oklch(0.55_0.25_295/0.55)] hover:bg-[oklch(0.14_0.08_290/0.7)] transition-all"
                  >
                    <AvatarDisplay avatarId={user.avatarId} size="md" className="shadow-[0_0_24px_-4px_oklch(0.55_0.25_295/0.6)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm truncate text-foreground">{user.name ?? user.email?.split("@")[0]}</p>
                        {user.level !== null && <LevelBadge level={user.level} size="sm" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      {user.unverified && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[oklch(0.92_0.14_88)]">Unverified · check your email</p>
                      )}
                    </div>
                    <span aria-hidden className="text-[oklch(0.55_0.25_295)]/50 group-hover:text-[oklch(0.78_0.2_295)] transition-colors">→</span>
                  </Link>

                  <nav className="space-y-1">
                    <SectionLabel>Account</SectionLabel>
                    <DrawerItem href="/profile/edit"            Icon={User}        label="Edit profile" pathname={pathname} />
                    <DrawerItem href="/marketplace/my-listings" Icon={ListChecks}  label="My listings"  pathname={pathname} />
                    <DrawerItem href="/marketplace/my-offers"   Icon={Mailbox}     label="My offers"    pathname={pathname} />
                    <DrawerItem href="/orders"                  Icon={Package}     label="Orders"       pathname={pathname} />
                    {user.isAdmin && (
                      <DrawerItem href="/admin" Icon={Shield} label="Admin" pathname={pathname} accent="cyan" />
                    )}
                    {signOutAction && (
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[oklch(0.86_0.12_25)] hover:text-[oklch(0.92_0.16_25)] hover:bg-[oklch(0.20_0.10_25/0.4)] transition-colors text-left"
                        >
                          <LogOut className="size-4" />
                          Sign out
                        </button>
                      </form>
                    )}
                  </nav>

                  <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.25_295/0.25)] to-transparent" />
                </>
              )}

              {/* ─── Browse (always visible) ──────────────────────── */}
              <nav className="space-y-1">
                <SectionLabel>Browse</SectionLabel>
                {browseLinks.map(({ href, label, Icon }) => (
                  <DrawerItem key={href} href={href} Icon={Icon} label={label} pathname={pathname} />
                ))}
              </nav>

              {/* ─── Auth CTAs (logged out) ──────────────────────── */}
              {!user && (
                <>
                  <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.25_295/0.25)] to-transparent" />
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.55_0.25_295)] hover:bg-[oklch(0.62_0.25_295)] text-white text-sm font-medium py-3 shadow-[0_0_24px_-4px_oklch(0.55_0.25_295/0.7),inset_0_1px_0_oklch(1_0_0/0.15)] border border-[oklch(0.70_0.22_295/0.4)]"
                    >
                      <LogIn className="size-4" />
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.10_0.06_290/0.7)] backdrop-blur-sm hover:bg-[oklch(0.14_0.08_290/0.8)] text-foreground text-sm font-medium py-3 border border-[oklch(0.55_0.25_295/0.3)] hover:border-[oklch(0.55_0.25_295/0.55)]"
                    >
                      <UserPlus className="size-4" />
                      Register
                    </Link>
                  </div>
                </>
              )}

              {/* Sigil flourish */}
              <p aria-hidden className="text-center text-[oklch(0.55_0.25_295)]/40 text-xs tracking-[0.5em]">
                ✦  ✧  ✦
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[oklch(0.78_0.2_295)]/70">
      {children}
    </p>
  );
}

function DrawerItem({
  href, Icon, label, pathname, accent = "violet",
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  pathname: string;
  accent?: "violet" | "cyan";
}) {
  const active = pathname === href || pathname.startsWith(href + "/");
  const accentText = accent === "cyan" ? "text-[oklch(0.85_0.15_215)]" : "text-[oklch(0.85_0.16_295)]";
  const accentBg   = accent === "cyan" ? "bg-[oklch(0.20_0.12_220/0.4)]" : "bg-[oklch(0.18_0.10_290/0.5)]";

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? `${accentBg} ${accentText} border border-[oklch(0.55_0.25_295/0.3)]`
          : "text-foreground/85 hover:text-foreground hover:bg-[oklch(0.14_0.08_290/0.5)]",
      )}
    >
      <Icon className={cn("size-4", active && accentText, !active && "text-muted-foreground")} />
      {label}
      {active && <Sparkles className="ml-auto size-3 opacity-60" />}
    </Link>
  );
}
