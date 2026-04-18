import { db } from "@repo/db";

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { set: true },
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { set: true },
  });
}

export async function getProductsBySet(setId: string) {
  return db.product.findMany({
    where: { setId },
    orderBy: { type: "asc" },
  });
}
