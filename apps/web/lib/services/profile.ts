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

const ALLOWED_AVATARS = new Set([
  "gengar", "pikachu", "eevee", "mewtwo", "charizard", "bulbasaur",
  "squirtle", "umbreon", "espeon", "lucario", "garchomp", "sylveon",
]);

const ALLOWED_THEMES = new Set([
  "purple", "midnight", "gold", "crimson", "forest", "ocean",
]);

export async function updateProfile(
  userId: string,
  data: { avatarId?: string; themeId?: string; bio?: string },
) {
  const safe: { avatarId?: string; themeId?: string; bio?: string } = {};
  if (data.avatarId !== undefined) {
    if (!ALLOWED_AVATARS.has(data.avatarId)) throw new Error("Invalid avatar.");
    safe.avatarId = data.avatarId;
  }
  if (data.themeId !== undefined) {
    if (!ALLOWED_THEMES.has(data.themeId)) throw new Error("Invalid theme.");
    safe.themeId = data.themeId;
  }
  if (data.bio !== undefined) {
    safe.bio = data.bio.slice(0, 160);
  }

  return db.userProfile.upsert({
    where:  { userId },
    update: safe,
    create: { userId, ...safe },
  });
}

// Verify every supplied userBadgeId actually belongs to the caller before
// writing to their showcase. Prevents featuring badges owned by someone else.
export async function setShowcase(
  userId: string,
  slots: { position: number; userBadgeId: string | null }[],
) {
  const ids = slots.map((s) => s.userBadgeId).filter((id): id is string => !!id);

  if (ids.length > 0) {
    const owned = await db.userBadge.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    const ownedSet = new Set(owned.map((u) => u.id));
    for (const id of ids) {
      if (!ownedSet.has(id)) throw new Error("You can only showcase badges you own.");
    }
  }

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

// Same ownership verification for featured cards.
export async function setFeaturedCards(
  userId: string,
  slots: { position: number; userCardId: string | null }[],
) {
  const ids = slots.map((s) => s.userCardId).filter((id): id is string => !!id);

  if (ids.length > 0) {
    const owned = await db.userCard.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });
    const ownedSet = new Set(owned.map((u) => u.id));
    for (const id of ids) {
      if (!ownedSet.has(id)) throw new Error("You can only feature cards you own.");
    }
  }

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
