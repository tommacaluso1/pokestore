import { cache } from "react";
import { db, ProductType } from "@repo/db";

export type ProductFilters = {
  setId?: string;
  type?: ProductType;
  inStock?: boolean;
  limit?: number;
};

// Serialise Decimal → number at the query boundary so Client Components
// receive plain objects (React 19 / Next 16 strict serialisation).
function serialiseProduct<T extends { price: { toString(): string } }>(p: T) {
  return { ...p, price: Number(p.price.toString()) };
}

export async function getProducts({ setId, type, inStock, limit = 20 }: ProductFilters = {}) {
  const rows = await db.product.findMany({
    where: {
      ...(setId && { setId }),
      ...(type && { type }),
      ...(inStock && { stock: { gt: 0 } }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { set: true },
  });
  return rows.map(serialiseProduct);
}

export async function getFeaturedProducts(limit = 8) {
  const rows = await db.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { set: true },
  });
  return rows.map(serialiseProduct);
}

export const getProductBySlug = cache(async function getProductBySlug(slug: string) {
  const row = await db.product.findUnique({
    where: { slug },
    include: { set: true },
  });
  return row ? serialiseProduct(row) : null;
});

export async function getProductsBySet(setId: string) {
  const rows = await db.product.findMany({
    where: { setId },
    orderBy: { type: "asc" },
  });
  return rows.map(serialiseProduct);
}
