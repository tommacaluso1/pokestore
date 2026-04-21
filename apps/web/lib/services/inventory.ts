import { db, CardCondition } from "@repo/db";

export async function addCardToInventory(
  userId: string,
  cardId: string,
  condition: CardCondition,
  quantity = 1,
  foil = false
) {
  return db.userCard.upsert({
    where: { userId_cardId_condition_foil: { userId, cardId, condition, foil } },
    update: { quantity: { increment: quantity } },
    create: { userId, cardId, condition, quantity, foil },
  });
}

export async function removeCardFromInventory(
  userId: string,
  userCardId: string,
  quantity = 1
) {
  const userCard = await db.userCard.findUnique({ where: { id: userCardId } });
  if (!userCard || userCard.userId !== userId) {
    throw new Error("Card not found in inventory.");
  }
  if (userCard.quantity < quantity) {
    throw new Error("Insufficient quantity.");
  }

  const listed = await db.listing.aggregate({
    where: { userCardId, status: "ACTIVE" },
    _sum: { quantity: true },
  });
  const available = userCard.quantity - (listed._sum.quantity ?? 0);
  if (available < quantity) {
    throw new Error("Some copies are tied to active listings.");
  }

  if (userCard.quantity === quantity) {
    return db.userCard.delete({ where: { id: userCardId } });
  }
  return db.userCard.update({
    where: { id: userCardId },
    data: { quantity: { decrement: quantity } },
  });
}

export async function getUserInventory(
  userId: string,
  opts: { condition?: CardCondition; search?: string } = {}
) {
  return db.userCard.findMany({
    where: {
      userId,
      ...(opts.condition && { condition: opts.condition }),
      ...(opts.search && {
        card: { name: { contains: opts.search, mode: "insensitive" } },
      }),
    },
    include: {
      card: { include: { tcgSet: true } },
      listings: {
        where: { status: "ACTIVE" },
        select: { id: true, quantity: true },
      },
    },
    orderBy: { acquiredAt: "desc" },
  });
}

export async function getUserCard(userId: string, userCardId: string) {
  const uc = await db.userCard.findUnique({
    where: { id: userCardId },
    include: { card: { include: { tcgSet: true } } },
  });
  if (!uc || uc.userId !== userId) return null;
  return uc;
}

// Returns how many copies are not tied to an active listing
export async function getAvailableQuantity(userCardId: string): Promise<number> {
  const [uc, listed] = await Promise.all([
    db.userCard.findUnique({ where: { id: userCardId }, select: { quantity: true } }),
    db.listing.aggregate({
      where: { userCardId, status: "ACTIVE" },
      _sum: { quantity: true },
    }),
  ]);
  if (!uc) return 0;
  return uc.quantity - (listed._sum.quantity ?? 0);
}
