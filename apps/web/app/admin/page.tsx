import Link from "next/link";
import { db } from "@repo/db";

export const metadata = { title: "Admin — PokéStore" };

export default async function AdminPage() {
  const [products, sets, orders, users] = await Promise.all([
    db.product.count(),
    db.set.count(),
    db.order.count(),
    db.user.count(),
  ]);

  const stats = [
    { label: "Products", value: products, href: "/admin/products" },
    { label: "Sets", value: sets, href: "/admin/sets" },
    { label: "Orders", value: orders, href: "/admin/orders" },
    { label: "Users", value: users, href: "/admin/users" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: "/admin/sets/new", label: "Add new set" },
          { href: "/admin/products/new", label: "Add new product" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-primary text-white rounded-lg p-4 text-center font-medium hover:bg-primary/90 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
