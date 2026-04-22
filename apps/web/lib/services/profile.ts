import { db } from "@repo/db";

export async function getOrCreateProfile(userId: string) {
  return db.userProfile.upsert({
    where:  { userId },
    update: {},
    create: { userId },
    include: {
      showcase: {
        include: { userBadge: { include: { badge: true } } },
        orderBy: { position: "asc" },
      },
      featured: {
        include: { userCard: { include: { card: { include: { tcgSet: true } } } } },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function updateProfile(
  userId: string,
  data: { avatarId?: string; themeId?: string; bio?: string },
) {
  return db.userProfile.upsert({
    where:  { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function setShowcase(
  userId: string,
  slots: { position: number; userBadgeId: string | null }[],
) {
  await db.profileShowcase.deleteMany({ where: { profileId: userId } });
  const valid = slots.filter((s) => s.userBadgeId !== null);
  if (valid.length > 0) {
    await db.profileShowcase.createMany({
      data: valid.map((s) => ({
        profileId:   userId,
        userBadgeId: s.userBadgeId!,
        position:    s.position,
      })),
    });
  }
}

export async function setFeaturedCards(
  userId: string,
  slots: { position: number; userCardId: string | null }[],
) {
  await db.profileFeaturedCard.deleteMany({ where: { profileId: userId } });
  const valid = slots.filter((s) => s.userCardId !== null);
  if (valid.length > 0) {
    await db.profileFeaturedCard.createMany({
      data: valid.map((s) => ({
        profileId:  userId,
        userCardId: s.userCardId!,
        position:   s.position,
      })),
    });
  }
}
