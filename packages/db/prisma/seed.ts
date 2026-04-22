import { PrismaClient, CardCondition, ListingType, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── TCG sets — sv1–sv3 linked to store, sv3pt5–sv9 marketplace-only ──────────

const ALL_TCG_SETS = [
  { id: "sv1",    name: "Scarlet & Violet",      series: "Scarlet & Violet", printedTotal: 198,
    releaseDate: new Date("2023-03-31"),
    symbolUrl: "https://images.pokemontcg.io/sv1/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv1/logo.png",
    storeSlug: "scarlet-violet" },
  { id: "sv2",    name: "Paldea Evolved",         series: "Scarlet & Violet", printedTotal: 279,
    releaseDate: new Date("2023-06-09"),
    symbolUrl: "https://images.pokemontcg.io/sv2/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv2/logo.png",
    storeSlug: "paldea-evolved" },
  { id: "sv3",    name: "Obsidian Flames",        series: "Scarlet & Violet", printedTotal: 197,
    releaseDate: new Date("2023-08-11"),
    symbolUrl: "https://images.pokemontcg.io/sv3/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv3/logo.png",
    storeSlug: "obsidian-flames" },
  { id: "sv3pt5", name: "151",                    series: "Scarlet & Violet", printedTotal: 207,
    releaseDate: new Date("2023-09-22"),
    symbolUrl: "https://images.pokemontcg.io/sv3pt5/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv3pt5/logo.png" },
  { id: "sv4",    name: "Paradox Rift",           series: "Scarlet & Violet", printedTotal: 182,
    releaseDate: new Date("2023-11-03"),
    symbolUrl: "https://images.pokemontcg.io/sv4/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv4/logo.png" },
  { id: "sv4pt5", name: "Paldean Fates",          series: "Scarlet & Violet", printedTotal: 245,
    releaseDate: new Date("2024-01-26"),
    symbolUrl: "https://images.pokemontcg.io/sv4pt5/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv4pt5/logo.png" },
  { id: "sv5",    name: "Temporal Forces",        series: "Scarlet & Violet", printedTotal: 162,
    releaseDate: new Date("2024-03-22"),
    symbolUrl: "https://images.pokemontcg.io/sv5/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv5/logo.png" },
  { id: "sv6",    name: "Twilight Masquerade",    series: "Scarlet & Violet", printedTotal: 167,
    releaseDate: new Date("2024-05-24"),
    symbolUrl: "https://images.pokemontcg.io/sv6/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv6/logo.png" },
  { id: "sv6pt5", name: "Shrouded Fable",         series: "Scarlet & Violet", printedTotal: 99,
    releaseDate: new Date("2024-08-02"),
    symbolUrl: "https://images.pokemontcg.io/sv6pt5/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv6pt5/logo.png" },
  { id: "sv7",    name: "Stellar Crown",          series: "Scarlet & Violet", printedTotal: 142,
    releaseDate: new Date("2024-09-13"),
    symbolUrl: "https://images.pokemontcg.io/sv7/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv7/logo.png" },
  { id: "sv8",    name: "Surging Sparks",         series: "Scarlet & Violet", printedTotal: 191,
    releaseDate: new Date("2024-11-08"),
    symbolUrl: "https://images.pokemontcg.io/sv8/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv8/logo.png" },
  { id: "sv8pt5", name: "Prismatic Evolutions",   series: "Scarlet & Violet", printedTotal: 131,
    releaseDate: new Date("2025-01-17"),
    symbolUrl: "https://images.pokemontcg.io/sv8pt5/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv8pt5/logo.png" },
  { id: "sv9",    name: "Journey Together",       series: "Scarlet & Violet", printedTotal: 150,
    releaseDate: new Date("2025-03-28"),
    symbolUrl: "https://images.pokemontcg.io/sv9/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv9/logo.png" },
];

// ─── Store products (sv1–sv3 only) ───────────────────────────────────────────

type ProductSeed = { name: string; slug: string; type: ProductType; price: number; stock: number; description: string };

const PRODUCTS_BY_SET: Record<string, ProductSeed[]> = {
  "scarlet-violet": [
    { name: "Scarlet & Violet Booster Pack",     slug: "sv-booster-pack", type: "PACK", price: 4.99,   stock: 150, description: "10 cards per pack. Includes at least 1 rare card." },
    { name: "Scarlet & Violet Booster Box",       slug: "sv-booster-box",  type: "BOX",  price: 109.99, stock: 20,  description: "36 booster packs. Best value for serious collectors." },
    { name: "Scarlet & Violet Elite Trainer Box", slug: "sv-etb",          type: "ETB",  price: 54.99,  stock: 30,  description: "9 booster packs, sleeves, dice, and full accessories." },
  ],
  "paldea-evolved": [
    { name: "Paldea Evolved Booster Pack",        slug: "pe-booster-pack", type: "PACK", price: 4.99,   stock: 200, description: "10 cards per pack featuring new Paldean Pokémon." },
    { name: "Paldea Evolved Booster Box",         slug: "pe-booster-box",  type: "BOX",  price: 114.99, stock: 15,  description: "36 booster packs. Highest pull rates in the SV series." },
    { name: "Paldea Evolved Elite Trainer Box",   slug: "pe-etb",          type: "ETB",  price: 54.99,  stock: 25,  description: "9 booster packs plus premium accessories." },
  ],
  "obsidian-flames": [
    { name: "Obsidian Flames Booster Pack",       slug: "of-booster-pack", type: "PACK", price: 4.99,   stock: 180, description: "10 cards per pack. Features Charizard ex and Tera-type Pokémon." },
    { name: "Obsidian Flames Booster Box",        slug: "of-booster-box",  type: "BOX",  price: 119.99, stock: 12,  description: "36 packs. Most sought-after set of the SV era." },
    { name: "Obsidian Flames Elite Trainer Box",  slug: "of-etb",          type: "ETB",  price: 59.99,  stock: 20,  description: "9 booster packs with exclusive Charizard-themed accessories." },
  ],
};

// ─── Pricing ──────────────────────────────────────────────────────────────────

const RARITY_BASE: Record<string, number> = {
  "Rare Holo":                  3,
  "Illustration Rare":          12,
  "Double Rare":                18,
  "ACE SPEC Rare":              35,
  "Shiny Rare":                 25,
  "Ultra Rare":                 60,
  "Special Illustration Rare":  120,
  "Shiny Ultra Rare":           150,
  "Hyper Rare":                 200,
};

const COND_MULT: Record<CardCondition, number> = {
  MINT: 1.15, NEAR_MINT: 1.0, LIGHTLY_PLAYED: 0.80,
  MODERATELY_PLAYED: 0.60, HEAVILY_PLAYED: 0.35, DAMAGED: 0.15,
};

function cardPrice(rarity: string | null | undefined, cond: CardCondition, discount = 0): number {
  const base = (RARITY_BASE[rarity ?? ""] ?? 8) * COND_MULT[cond];
  return Math.max(0.99, Math.round(base * (1 - discount) * 100) / 100);
}

// ─── API fetch ────────────────────────────────────────────────────────────────

const MARKETPLACE_RARITIES = new Set([
  "Rare Holo", "Illustration Rare", "Double Rare",
  "Ultra Rare", "Special Illustration Rare", "Hyper Rare",
  "ACE SPEC Rare", "Shiny Rare", "Shiny Ultra Rare",
]);

const RARITY_SORT: Record<string, number> = {
  "Hyper Rare": 1, "Special Illustration Rare": 2, "Shiny Ultra Rare": 3,
  "Ultra Rare": 4, "ACE SPEC Rare": 5, "Double Rare": 6,
  "Illustration Rare": 7, "Shiny Rare": 8, "Rare Holo": 9,
};

interface ApiCard {
  id: string; name: string; number: string; rarity?: string;
  artist?: string; images: { small?: string; large?: string };
  tcgSetId?: string;
}

interface CardRow {
  id: string; name: string; number: string; rarity: string | null;
  artist: string | null; imageSmall: string | null; imageLarge: string | null;
  tcgSetId: string;
}

async function fetchSetCards(setId: string): Promise<CardRow[]> {
  try {
    const url = `https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=250`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json() as { data: ApiCard[] };
    return (json.data ?? [])
      .filter(c => MARKETPLACE_RARITIES.has(c.rarity ?? ""))
      .sort((a, b) => (RARITY_SORT[a.rarity ?? ""] ?? 9) - (RARITY_SORT[b.rarity ?? ""] ?? 9))
      .map(c => ({
        id: c.id, name: c.name, number: c.number,
        rarity: c.rarity ?? null, artist: c.artist ?? null,
        imageSmall: c.images?.small ?? null, imageLarge: c.images?.large ?? null,
        tcgSetId: setId,
      }));
  } catch (e) {
    console.warn(`  ⚠ Could not fetch ${setId}: ${(e as Error).message}`);
    return [];
  }
}

// Interleave cards from different sets so every user gets multi-set variety
function interleave(groups: CardRow[][]): CardRow[] {
  const out: CardRow[] = [];
  const max = Math.max(...groups.map(g => g.length));
  for (let i = 0; i < max; i++)
    for (const g of groups)
      if (i < g.length) out.push(g[i]!);
  return out;
}

// ─── Users ────────────────────────────────────────────────────────────────────

const USERS = [
  // — original 4 —
  { email: "ash@pokestore.dev",      name: "Ash Ketchum",  archetype: "seller"    },
  { email: "misty@pokestore.dev",    name: "Misty",        archetype: "trader"    },
  { email: "brock@pokestore.dev",    name: "Brock",        archetype: "seller"    },
  { email: "gary@pokestore.dev",     name: "Gary Oak",     archetype: "seller"    },
  // — collectors —
  { email: "giovanni@pokestore.dev", name: "Giovanni",     archetype: "collector" },
  { email: "sabrina@pokestore.dev",  name: "Sabrina",      archetype: "collector" },
  { email: "red@pokestore.dev",      name: "Red",          archetype: "collector" },
  { email: "lusamine@pokestore.dev", name: "Lusamine",     archetype: "collector" },
  { email: "dawn@pokestore.dev",     name: "Dawn",         archetype: "collector" },
  // — sellers —
  { email: "lorelei@pokestore.dev",  name: "Lorelei",      archetype: "seller"    },
  { email: "surge@pokestore.dev",    name: "Lt. Surge",    archetype: "seller"    },
  { email: "blue@pokestore.dev",     name: "Blue",         archetype: "seller"    },
  { email: "cynthia@pokestore.dev",  name: "Cynthia",      archetype: "seller"    },
  { email: "guzma@pokestore.dev",    name: "Guzma",        archetype: "seller"    },
  { email: "acerola@pokestore.dev",  name: "Acerola",      archetype: "seller"    },
  { email: "may@pokestore.dev",      name: "May",          archetype: "seller"    },
  // — traders —
  { email: "erika@pokestore.dev",    name: "Erika",        archetype: "trader"    },
  { email: "lance@pokestore.dev",    name: "Lance",        archetype: "trader"    },
  { email: "blaine@pokestore.dev",   name: "Blaine",       archetype: "trader"    },
  { email: "koga@pokestore.dev",     name: "Koga",         archetype: "trader"    },
  { email: "steven@pokestore.dev",   name: "Steven Stone", archetype: "trader"    },
  { email: "iris@pokestore.dev",     name: "Iris",         archetype: "trader"    },
  { email: "gladion@pokestore.dev",  name: "Gladion",      archetype: "trader"    },
  { email: "nanu@pokestore.dev",     name: "Nanu",         archetype: "trader"    },
] as const;

// Cards given to each archetype
const CARDS_WANTED = { collector: 14, seller: 10, trader: 8 } as const;

// Condition cycling per archetype (index = card position in hand)
const COND_CYCLE: Record<string, CardCondition[]> = {
  collector: ["MINT","MINT","NEAR_MINT","NEAR_MINT","MINT","NEAR_MINT","NEAR_MINT","MINT","NEAR_MINT","NEAR_MINT","MINT","NEAR_MINT","MINT","NEAR_MINT"],
  seller:    ["NEAR_MINT","NEAR_MINT","LIGHTLY_PLAYED","NEAR_MINT","LIGHTLY_PLAYED","MODERATELY_PLAYED","NEAR_MINT","NEAR_MINT","LIGHTLY_PLAYED","NEAR_MINT"],
  trader:    ["NEAR_MINT","LIGHTLY_PLAYED","NEAR_MINT","LIGHTLY_PLAYED","MODERATELY_PLAYED","NEAR_MINT","LIGHTLY_PLAYED","NEAR_MINT"],
};

// ─── Description templates ────────────────────────────────────────────────────

const condLabel = (c: CardCondition) => c.replace(/_/g, " ").toLowerCase();

const SALE_TMPL = [
  (n: string, c: CardCondition) => `${n} (${condLabel(c)}) — sleeved since pull, tracked shipping included.`,
  (n: string, c: CardCondition) => `${n} in ${condLabel(c)} condition. Quick sale, ships next day.`,
  (n: string, c: CardCondition) => `${n} — ${condLabel(c)}, slightly below market for a fast deal.`,
  (n: string, c: CardCondition) => `${n} pulled fresh, double-sleeved. ${condLabel(c)} condition.`,
  (n: string, c: CardCondition) => `${n} — ${condLabel(c)}, fair price, open to reasonable offers.`,
];

const TRADE_TMPL = [
  (n: string) => `${n} up for trade — want SIR or equivalent value. DM with offers.`,
  (n: string) => `${n} — will trade for Double Rare ex NM or better.`,
  (n: string) => `${n} — looking to trade up. Interested in any SIR or UR NM+.`,
  (n: string) => `${n} for trade. Want a fair swap — send your offers.`,
];

const TOS_TMPL = [
  (n: string, c: CardCondition, p: number) => `${n} (${condLabel(c)}) — €${p} or trade for similar value.`,
  (n: string, c: CardCondition, p: number) => `${n} — listed at €${p}, open to equivalent trade offers.`,
  (n: string, c: CardCondition, p: number) => `${n} ${condLabel(c)} — ${p < 20 ? "budget pick" : "premium card"}, sale or swap.`,
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database…\n");

  // ── Auth ──────────────────────────────────────────────────────────────────
  const adminPw    = await bcrypt.hash("admin1234",    12);
  const customerPw = await bcrypt.hash("customer1234", 12);

  await db.user.upsert({
    where: { email: "admin@pokestore.dev" }, update: {},
    create: { email: "admin@pokestore.dev", name: "Admin", password: adminPw, role: "ADMIN" },
  });

  const upsertedUsers = await Promise.all(
    USERS.map(u => db.user.upsert({
      where: { email: u.email }, update: {},
      create: { email: u.email, name: u.name, password: customerPw },
    }))
  );
  const userById = Object.fromEntries(upsertedUsers.map((u, i) => [USERS[i]!.email, u]));
  console.log(`✓ ${upsertedUsers.length + 1} users`);

  // ── Store sets & products ──────────────────────────────────────────────────
  for (const s of ALL_TCG_SETS) {
    if (s.storeSlug) {
      await db.set.upsert({
        where: { slug: s.storeSlug }, update: {},
        create: { name: s.name, series: s.series, slug: s.storeSlug, releaseDate: s.releaseDate, logoUrl: s.logoUrl },
      });
    }
  }
  for (const [slug, products] of Object.entries(PRODUCTS_BY_SET)) {
    const set = await db.set.findUnique({ where: { slug } });
    if (!set) continue;
    for (const p of products)
      await db.product.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, setId: set.id } });
  }
  console.log("✓ store sets & products");

  // ── TcgSets ───────────────────────────────────────────────────────────────
  for (const s of ALL_TCG_SETS) {
    const storeSet = s.storeSlug ? await db.set.findUnique({ where: { slug: s.storeSlug } }) : null;
    await db.tcgSet.upsert({
      where: { id: s.id }, update: {},
      create: {
        id: s.id, name: s.name, series: s.series,
        printedTotal: s.printedTotal, releaseDate: s.releaseDate,
        symbolUrl: s.symbolUrl ?? null, logoUrl: s.logoUrl ?? null,
        ...(storeSet ? { storeSetId: storeSet.id } : {}),
      },
    });
  }
  console.log("✓ TCG sets");

  // ── Fetch cards from pokemontcg.io ────────────────────────────────────────
  console.log("\nFetching cards from pokemontcg.io API…");
  const setGroups = await Promise.all(ALL_TCG_SETS.map(s => fetchSetCards(s.id)));
  setGroups.forEach((cards, i) =>
    console.log(`  ${ALL_TCG_SETS[i]!.id}: ${cards.length} marketplace cards`)
  );

  const pool = interleave(setGroups);
  console.log(`  Total pool: ${pool.length} unique cards\n`);

  if (pool.length < 50) {
    console.error("ERROR: API returned too few cards. Check your network connection.");
    process.exit(1);
  }

  // Upsert all fetched cards
  for (const c of pool)
    await db.pokemonCard.upsert({ where: { id: c.id }, update: {}, create: c });
  console.log(`✓ ${pool.length} cards upserted`);

  // ── Clean slate ───────────────────────────────────────────────────────────
  const seedUserIds = upsertedUsers.map(u => u.id);

  const seedListingIds = (await db.listing.findMany({
    where: { sellerId: { in: seedUserIds } }, select: { id: true },
  })).map(l => l.id);

  const seedOfferIds = (await db.tradeOffer.findMany({
    where: { OR: [{ offererId: { in: seedUserIds } }, { listingId: { in: seedListingIds } }] },
    select: { id: true },
  })).map(o => o.id);

  await db.offerItem.deleteMany({ where: { offerId:   { in: seedOfferIds   } } });
  await db.tradeOffer.deleteMany({ where: { id:        { in: seedOfferIds   } } });
  await db.listing.deleteMany(   { where: { sellerId:  { in: seedUserIds    } } });
  await db.userCard.deleteMany(  { where: { userId:    { in: seedUserIds    } } });
  console.log("✓ clean slate");

  // ── Distribute cards — round-robin, no repeats across users ──────────────
  // Each user gets CARDS_WANTED[archetype] cards from the interleaved pool.
  // Sequential slicing: user 0 takes first N cards, user 1 takes next M, etc.
  const userCardSets: CardRow[][] = [];
  let poolIdx = 0;

  for (const profile of USERS) {
    const want = CARDS_WANTED[profile.archetype];
    const available = pool.length - poolIdx;
    const take = Math.min(want, available);
    const slice = pool.slice(poolIdx, poolIdx + take);
    userCardSets.push(slice);
    poolIdx += take;
  }

  // ── Create inventory & listings ───────────────────────────────────────────
  let totalListings = 0;
  // Track first listing per seller for trade offers later
  const firstListingBySeller: Record<string, { id: string; askingPrice: number | null }> = {};

  for (let i = 0; i < USERS.length; i++) {
    const profile  = USERS[i]!;
    const user     = upsertedUsers[i]!;
    const cards    = userCardSets[i]!;
    const condCycle = COND_CYCLE[profile.archetype] ?? COND_CYCLE.seller!;

    // Create userCards
    const userCards = await Promise.all(
      cards.map((card, pos) =>
        db.userCard.create({
          data: {
            userId:    user.id,
            cardId:    card.id,
            condition: condCycle[pos % condCycle.length]!,
            quantity:  1,
            foil:      false,
          },
        })
      )
    );

    if (profile.archetype === "collector") continue; // collectors don't list

    // Sellers list ~70% of cards, traders ~60%
    const listFraction = profile.archetype === "seller" ? 0.7 : 0.6;
    const toList = Math.ceil(cards.length * listFraction);

    for (let pos = 0; pos < toList; pos++) {
      const card  = cards[pos]!;
      const uc    = userCards[pos]!;
      const cond  = condCycle[pos % condCycle.length]!;
      const p     = cardPrice(card.rarity, cond, pos % 3 === 0 ? 0.05 : 0);

      let listingType: ListingType;
      let askingPrice: number | null;
      let description: string;

      if (profile.archetype === "seller") {
        const isTos = pos % 3 === 2;
        listingType  = isTos ? "TRADE_OR_SALE" : "SALE";
        askingPrice  = p;
        description  = isTos
          ? TOS_TMPL[pos % TOS_TMPL.length]!(card.name, cond, p)
          : SALE_TMPL[pos % SALE_TMPL.length]!(card.name, cond);
      } else {
        const isTrade = pos % 2 === 0;
        listingType  = isTrade ? "TRADE" : "TRADE_OR_SALE";
        askingPrice  = isTrade ? null : p;
        description  = isTrade
          ? TRADE_TMPL[pos % TRADE_TMPL.length]!(card.name)
          : TOS_TMPL[pos % TOS_TMPL.length]!(card.name, cond, p);
      }

      const listing = await db.listing.create({
        data: {
          sellerId: user.id, userCardId: uc.id,
          quantity: 1, listingType, askingPrice, description, status: "ACTIVE",
        },
      });

      if (pos === 0 && !firstListingBySeller[user.id]) {
        firstListingBySeller[user.id] = { id: listing.id, askingPrice: askingPrice };
      }
      totalListings++;
    }
  }
  console.log(`✓ inventory & ${totalListings} listings`);

  // ── Trade offers — each trader makes a cash offer on the next seller's first listing ──
  const sellers  = USERS.map((p, i) => ({ ...p, user: upsertedUsers[i]! })).filter(p => p.archetype === "seller");
  const traders  = USERS.map((p, i) => ({ ...p, user: upsertedUsers[i]! })).filter(p => p.archetype === "trader");

  let offerCount = 0;
  for (let i = 0; i < Math.min(traders.length, sellers.length); i++) {
    const trader  = traders[i]!;
    const seller  = sellers[i % sellers.length]!;
    const listing = firstListingBySeller[seller.user.id];
    if (!listing || listing.askingPrice == null) continue;

    try {
      await db.tradeOffer.create({
        data: {
          listingId:  listing.id,
          offererId:  trader.user.id,
          offerType:  "CASH",
          cashAmount: Math.round(listing.askingPrice * 0.9 * 100) / 100,
          message:    `Would you take €${(listing.askingPrice * 0.9).toFixed(2)}? I can pay right away.`,
        },
      });
      offerCount++;
    } catch { /* skip if constraint hit */ }
  }

  // A few sellers make cash offers on each other's listings
  for (let i = 0; i < Math.min(5, sellers.length - 1); i++) {
    const buyer   = sellers[(i + 1) % sellers.length]!;
    const target  = sellers[i]!;
    const listing = firstListingBySeller[target.user.id];
    if (!listing || listing.askingPrice == null) continue;

    try {
      await db.tradeOffer.create({
        data: {
          listingId:  listing.id,
          offererId:  buyer.user.id,
          offerType:  "CASH",
          cashAmount: listing.askingPrice,
          message:    "Full asking price — let me know if you want to proceed.",
        },
      });
      offerCount++;
    } catch { /* skip */ }
  }
  console.log(`✓ ${offerCount} trade offers`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log(`
━━ Seed complete ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  admin@pokestore.dev        / admin1234   (ADMIN)

  Password for all test accounts: customer1234

  Collectors (hold cards, no listings):
    giovanni, sabrina, red, lusamine, dawn @pokestore.dev

  Sellers (active SALE listings):
    ash, brock, gary, lorelei, surge, blue
    cynthia, guzma, acerola, may @pokestore.dev

  Traders (TRADE / TRADE_OR_SALE):
    misty, erika, lance, blaine, koga
    steven, iris, gladion, nanu @pokestore.dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
