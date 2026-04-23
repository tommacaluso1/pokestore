import { cache } from "react";
import { db, ProductType } from "@repo/db";

export type ProductFilters = {
  setId?: string;
  type?: ProductType;
  inStock?: boolean;
  limit?: number;
};

export async function getProducts({ setId, type, inStock, limit = 20 }: ProductFilters = {}) {
  return db.product.findMany({
    where: {
      ...(setId && { setId }),
      ...(type && { type }),
      ...(inStock && { stock: { gt: 0 } }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { set: true },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { set: true },
  });
}

export const getProductBySlug = cache(async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { set: true },
  });
});

export async function getProductsBySet(setId: string) {
  return db.product.findMany({
    where: { setId },
    orderBy: { type: "asc" },
  });
}
