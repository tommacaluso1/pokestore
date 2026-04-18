import { db } from "@repo/db";

export async function getAllSets() {
  return db.set.findMany({
    orderBy: { releaseDate: "desc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getSetBySlug(slug: string) {
  return db.set.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { type: "asc" },
      },
    },
  });
}
