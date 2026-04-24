import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/sets", label: "Sets" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex gap-8 min-h-[calc(100vh-4rem)]">
      <aside className="w-48 shrink-0 pt-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3 px-3">
          Admin
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 pt-2">{children}</div>
    </div>
  );
}
