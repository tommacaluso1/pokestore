import { db } from "@repo/db";

const BASE_URL = "https://api.pokemontcg.io/v2";

function apiHeaders(): Record<string, string> {
  const key = process.env.POKEMONTCG_API_KEY;
  return key ? { "X-Api-Key": key } : {};
}

// ─── API types ────────────────────────────────────────────────────────────────

type ApiSet = {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  releaseDate: string; // "2023/08/11"
  images: { symbol: string; logo: string };
};

type ApiCard = {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  artist?: string;
  images: { small: string; large: string };
  set: { id: string };
};

// ─── Public API ───────────────────────────────────────────────────────────────

export type IngestResult = {
  set: { id: string; name: string };
  cardsUpserted: number;
};

/**
 * Fetches a TCG set and all its cards from pokemontcg.io and upserts them
 * into the local database. Safe to call multiple times (idempotent).
 *
 * @param tcgSetId   pokemontcg.io set ID, e.g. "sv3"
 * @param storeSetId Optional FK to the store's Set model to link the two
 */
export async function fetchAndStoreSet(
  tcgSetId: string,
  storeSetId?: string
): Promise<IngestResult> {
  const setRes = await fetch(`${BASE_URL}/sets/${tcgSetId}`, {
    headers: apiHeaders(),
    next: { revalidate: 86400 }, // cache for 24 h in Next.js fetch
  });
  if (!setRes.ok) {
    throw new Error(`pokemontcg.io set fetch failed — status ${setRes.status}`);
  }
  const { data: apiSet }: { data: ApiSet } = await setRes.json();

  // Upsert the TCG set record
  const tcgSet = await db.tcgSet.upsert({
    where: { id: tcgSetId },
    update: {
      name: apiSet.name,
      series: apiSet.series,
      printedTotal: apiSet.printedTotal,
      symbolUrl: apiSet.images.symbol,
      logoUrl: apiSet.images.logo,
      ...(storeSetId !== undefined && { storeSetId }),
    },
    create: {
      id: tcgSetId,
      name: apiSet.name,
      series: apiSet.series,
      printedTotal: apiSet.printedTotal,
      releaseDate: parseReleaseDate(apiSet.releaseDate),
      symbolUrl: apiSet.images.symbol,
      logoUrl: apiSet.images.logo,
      ...(storeSetId !== undefined && { storeSetId }),
    },
  });

  // Fetch all cards (pokemontcg.io max pageSize = 250)
  let page = 1;
  let fetched = 0;
  let totalCount = Infinity;

  while (fetched < totalCount) {
    const cardsRes = await fetch(
      `${BASE_URL}/cards?q=set.id:${tcgSetId}&pageSize=250&page=${page}`,
      { headers: apiHeaders() }
    );
    if (!cardsRes.ok) {
      throw new Error(`pokemontcg.io cards fetch failed — status ${cardsRes.status}`);
    }
    const body: { data: ApiCard[]; totalCount: number } = await cardsRes.json();

    if (page === 1) totalCount = body.totalCount;
    if (!body.data.length) break;

    // Upsert each card individually (no createMany because of upsert semantics)
    for (const card of body.data) {
      await db.pokemonCard.upsert({
        where: { id: card.id },
        update: {
          name: card.name,
          number: card.number,
          rarity: card.rarity ?? null,
          artist: card.artist ?? null,
          imageSmall: card.images.small,
          imageLarge: card.images.large,
        },
        create: {
          id: card.id,
          name: card.name,
          number: card.number,
          rarity: card.rarity ?? null,
          artist: card.artist ?? null,
          imageSmall: card.images.small,
          imageLarge: card.images.large,
          tcgSetId,
        },
      });
      fetched++;
    }

    page++;
  }

  return { set: { id: tcgSet.id, name: tcgSet.name }, cardsUpserted: fetched };
}

/**
 * Search cards by name. Checks the local database first; falls back to the
 * pokemontcg.io API if no local results are found.
 */
export async function searchCards(query: string, limit = 20) {
  const local = await db.pokemonCard.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    take: limit,
    include: { tcgSet: true },
    orderBy: { name: "asc" },
  });

  if (local.length > 0) return local;

  const res = await fetch(
    `${BASE_URL}/cards?q=name:"${encodeURIComponent(query)}"&pageSize=${limit}`,
    { headers: apiHeaders() }
  );
  if (!res.ok) throw new Error(`pokemontcg.io search failed — status ${res.status}`);
  const { data }: { data: ApiCard[] } = await res.json();
  return data;
}

/**
 * Fetch a single card by its pokemontcg.io ID. Checks local DB first.
 */
export async function getCard(cardId: string) {
  const local = await db.pokemonCard.findUnique({
    where: { id: cardId },
    include: { tcgSet: true },
  });
  if (local) return local;

  const res = await fetch(`${BASE_URL}/cards/${cardId}`, { headers: apiHeaders() });
  if (!res.ok) throw new Error(`pokemontcg.io card fetch failed — status ${res.status}`);
  const { data }: { data: ApiCard } = await res.json();
  return data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseReleaseDate(raw: string): Date {
  // pokemontcg.io returns dates as "2023/08/11"
  return new Date(raw.replace(/\//g, "-"));
}
