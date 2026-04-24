"use server";

import { db } from "@repo/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { fetchAndStoreSet } from "@/lib/services/cardIngestion";
import { addCardToInventory, removeCardFromInventory } from "@/lib/services/inventory";
import type { CardCondition } from "@repo/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
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
      name, slug, setId, price, stock,
      description: description || null,
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

// ─── Card ingestion ───────────────────────────────────────────────────────────

export type IngestState = { error?: string; result?: string };

export async function ingestTcgSet(
  _prev: IngestState,
  formData: FormData
): Promise<IngestState> {
  await requireAdmin();

  const tcgSetId  = formData.get("tcgSetId")?.toString().trim();
  const storeSetId = formData.get("storeSetId")?.toString().trim() || undefined;

  if (!tcgSetId) return { error: "pokemontcg.io set ID is required (e.g. sv3)." };

  try {
    const result = await fetchAndStoreSet(tcgSetId, storeSetId);
    revalidatePath("/admin/cards");
    return {
      result: `Ingested "${result.set.name}" — ${result.cardsUpserted} cards upserted.`,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ─── Inventory management (admin override) ────────────────────────────────────

export type AdminInventoryState = { error?: string };

export async function adminAddCardToInventory(
  _prev: AdminInventoryState,
  formData: FormData
): Promise<AdminInventoryState> {
  await requireAdmin();

  const userId    = formData.get("userId")?.toString();
  const cardId    = formData.get("cardId")?.toString();
  const condition = formData.get("condition")?.toString() as CardCondition;
  const quantity  = parseInt(formData.get("quantity")?.toString() ?? "1", 10);
  const foil      = formData.get("foil") === "true";

  if (!userId || !cardId || !condition) {
    return { error: "userId, cardId, and condition are required." };
  }
  if (isNaN(quantity) || quantity < 1) return { error: "Invalid quantity." };

  const card = await db.pokemonCard.findUnique({ where: { id: cardId } });
  if (!card) return { error: `Card "${cardId}" not found in local database. Ingest the set first.` };

  try {
    await addCardToInventory(userId, cardId, condition, quantity, foil);
    revalidatePath("/admin/users");
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function adminRemoveCardFromInventory(userCardId: string, userId: string) {
  await requireAdmin();
  try {
    await removeCardFromInventory(userId, userCardId);
    revalidatePath("/admin/users");
  } catch {
    // swallow — UI will reflect DB state on next render
  }
}
