import { db } from "@repo/db";

export async function getAllProducts() {
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { set: { select: { name: true } } },
  });
}

export async function getAllOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
}

export async function getAllUsers() {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
