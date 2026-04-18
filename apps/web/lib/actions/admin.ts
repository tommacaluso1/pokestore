"use server";

import { db } from "@repo/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");
}

// ─── Sets ─────────────────────────────────────────────────────────────────────

export async function createSet(prevState: unknown, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const series = formData.get("series") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await db.set.create({ data: { name, series, slug, releaseDate: new Date(releaseDate) } });
  revalidatePath("/admin/sets");
  redirect("/admin/sets");
}

export async function deleteSet(id: string) {
  await requireAdmin();
  await db.set.delete({ where: { id } });
  revalidatePath("/admin/sets");
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(prevState: unknown, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const setId = formData.get("setId") as string;
  const type = formData.get("type") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const slug = `${name}-${setId}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await db.product.create({
    data: {
      name, slug, setId, price, stock, description: description || null,
      imageUrl: imageUrl || null,
      type: type as "PACK" | "BOX" | "ETB" | "BUNDLE",
    },
  });
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateStock(id: string, stock: number) {
  await requireAdmin();
  await db.product.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  revalidatePath("/admin/products");
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  await db.order.update({
    where: { id },
    data: { status: status as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" },
  });
  revalidatePath("/admin/orders");
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function updateUserRole(id: string, role: string) {
  await requireAdmin();
  await db.user.update({
    where: { id },
    data: { role: role as "CUSTOMER" | "ADMIN" },
  });
  revalidatePath("/admin/users");
}
