import { db } from "@repo/db";

export async function getCart(userId?: string, sessionCartId?: string) {
  if (userId) {
    return db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { set: { select: { name: true } } } } },
        },
      },
    });
  }
  if (sessionCartId) {
    return db.cart.findUnique({
      where: { id: sessionCartId },
      include: {
        items: {
          include: { product: { include: { set: { select: { name: true } } } } },
        },
      },
    });
  }
  return null;
}

export async function getOrdersByUser(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true, imageUrl: true } } },
      },
    },
  });
}
