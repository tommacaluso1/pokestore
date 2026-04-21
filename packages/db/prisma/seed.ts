import { PrismaClient, ProductType, CardCondition } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── Static card data ─────────────────────────────────────────────────────────
// Subset of real cards from pokemontcg.io. Run fetchAndStoreSet() from
// cardIngestion service to ingest the full set data from the API.

const TCG_SETS = [
  { id: "sv1", name: "Scarlet & Violet", series: "Scarlet & Violet", printedTotal: 198,
    releaseDate: new Date("2023-03-31"),
    symbolUrl: "https://images.pokemontcg.io/sv1/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv1/logo.png",
    storeSlug: "scarlet-violet" },
  { id: "sv2", name: "Paldea Evolved",   series: "Scarlet & Violet", printedTotal: 279,
    releaseDate: new Date("2023-06-09"),
    symbolUrl: "https://images.pokemontcg.io/sv2/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv2/logo.png",
    storeSlug: "paldea-evolved" },
  { id: "sv3", name: "Obsidian Flames",  series: "Scarlet & Violet", printedTotal: 197,
    releaseDate: new Date("2023-08-11"),
    symbolUrl: "https://images.pokemontcg.io/sv3/symbol.png",
    logoUrl:   "https://images.pokemontcg.io/sv3/logo.png",
    storeSlug: "obsidian-flames" },
];

const CARDS = [
  // ── SV1 ──
  { id: "sv1-36",  name: "Arcanine ex",  number: "36",  rarity: "Double Rare",             tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/36.png",    imageLarge: "https://images.pokemontcg.io/sv1/36_hires.png" },
  { id: "sv1-184", name: "Koraidon ex",  number: "184", rarity: "Double Rare",             tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/184.png",   imageLarge: "https://images.pokemontcg.io/sv1/184_hires.png" },
  { id: "sv1-185", name: "Miraidon ex",  number: "185", rarity: "Double Rare",             tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/185.png",   imageLarge: "https://images.pokemontcg.io/sv1/185_hires.png" },
  { id: "sv1-193", name: "Koraidon ex",  number: "193", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Teeziro",
    imageSmall: "https://images.pokemontcg.io/sv1/193.png",   imageLarge: "https://images.pokemontcg.io/sv1/193_hires.png" },
  // ── SV2 ──
  { id: "sv2-91",  name: "Gardevoir ex", number: "91",  rarity: "Double Rare",             tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/91.png",    imageLarge: "https://images.pokemontcg.io/sv2/91_hires.png" },
  { id: "sv2-197", name: "Iron Valiant ex", number: "197", rarity: "Double Rare",          tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/197.png",   imageLarge: "https://images.pokemontcg.io/sv2/197_hires.png" },
  { id: "sv2-245", name: "Gardevoir ex", number: "245", rarity: "Special Illustration Rare", tcgSetId: "sv2", artist: "Naoki Saito",
    imageSmall: "https://images.pokemontcg.io/sv2/245.png",   imageLarge: "https://images.pokemontcg.io/sv2/245_hires.png" },
  { id: "sv2-250", name: "Iron Valiant ex", number: "250", rarity: "Special Illustration Rare", tcgSetId: "sv2", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv2/250.png",   imageLarge: "https://images.pokemontcg.io/sv2/250_hires.png" },
  // ── SV3 ──
  { id: "sv3-36",  name: "Charizard ex", number: "36",  rarity: "Double Rare",             tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/36.png",    imageLarge: "https://images.pokemontcg.io/sv3/36_hires.png" },
  { id: "sv3-125", name: "Pidgeot ex",   number: "125", rarity: "Double Rare",             tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/125.png",   imageLarge: "https://images.pokemontcg.io/sv3/125_hires.png" },
  { id: "sv3-182", name: "Revavroom ex", number: "182", rarity: "Double Rare",             tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/182.png",   imageLarge: "https://images.pokemontcg.io/sv3/182_hires.png" },
  { id: "sv3-223", name: "Charizard ex", number: "223", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/223.png",   imageLarge: "https://images.pokemontcg.io/sv3/223_hires.png" },
];

type ProductSeed = {
  name: string; slug: string; type: ProductType;
  price: number; stock: number; description: string;
};

const PRODUCTS_BY_SET: Record<string, ProductSeed[]> = {
  "scarlet-violet": [
    { name: "Scarlet & Violet Booster Pack",       slug: "sv-booster-pack", type: "PACK", price: 4.99,   stock: 150, description: "10 cards per pack. Includes at least 1 rare card." },
    { name: "Scarlet & Violet Booster Box",         slug: "sv-booster-box",  type: "BOX",  price: 109.99, stock: 20,  description: "36 booster packs. Best value for serious collectors." },
    { name: "Scarlet & Violet Elite Trainer Box",   slug: "sv-etb",          type: "ETB",  price: 54.99,  stock: 30,  description: "9 booster packs, sleeves, dice, and full accessories." },
  ],
  "paldea-evolved": [
    { name: "Paldea Evolved Booster Pack",          slug: "pe-booster-pack", type: "PACK", price: 4.99,   stock: 200, description: "10 cards per pack featuring new Paldean Pokémon." },
    { name: "Paldea Evolved Booster Box",           slug: "pe-booster-box",  type: "BOX",  price: 114.99, stock: 15,  description: "36 booster packs. Highest pull rates in the SV series." },
    { name: "Paldea Evolved Elite Trainer Box",     slug: "pe-etb",          type: "ETB",  price: 54.99,  stock: 25,  description: "9 booster packs plus premium accessories." },
  ],
  "obsidian-flames": [
    { name: "Obsidian Flames Booster Pack",         slug: "of-booster-pack", type: "PACK", price: 4.99,   stock: 180, description: "10 cards per pack. Features Charizard ex and Tera-type Pokémon." },
    { name: "Obsidian Flames Booster Box",          slug: "of-booster-box",  type: "BOX",  price: 119.99, stock: 12,  description: "36 packs. Most sought-after set of the SV era." },
    { name: "Obsidian Flames Elite Trainer Box",    slug: "of-etb",          type: "ETB",  price: 59.99,  stock: 20,  description: "9 booster packs with exclusive Charizard-themed accessories." },
  ],
};

async function main() {
  console.log("Seeding database…");

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPw    = await bcrypt.hash("admin1234",    12);
  const customerPw = await bcrypt.hash("customer1234", 12);

  const users = await Promise.all([
    db.user.upsert({ where: { email: "admin@pokestore.dev" },   update: {}, create: { email: "admin@pokestore.dev",   name: "Admin",        password: adminPw,    role: "ADMIN" } }),
    db.user.upsert({ where: { email: "ash@pokestore.dev" },     update: {}, create: { email: "ash@pokestore.dev",     name: "Ash Ketchum",  password: customerPw } }),
    db.user.upsert({ where: { email: "misty@pokestore.dev" },   update: {}, create: { email: "misty@pokestore.dev",   name: "Misty",        password: customerPw } }),
    db.user.upsert({ where: { email: "brock@pokestore.dev" },   update: {}, create: { email: "brock@pokestore.dev",   name: "Brock",        password: customerPw } }),
    db.user.upsert({ where: { email: "gary@pokestore.dev" },    update: {}, create: { email: "gary@pokestore.dev",    name: "Gary Oak",     password: customerPw } }),
  ]);
  const [, ash, misty, brock, gary] = users;
  console.log("  ✓ users");

  // ── Store Sets & Products ─────────────────────────────────────────────────
  for (const setData of TCG_SETS) {
    await db.set.upsert({
      where: { slug: setData.storeSlug },
      update: {},
      create: {
        name: setData.name, series: setData.series, slug: setData.storeSlug,
        releaseDate: setData.releaseDate, logoUrl: setData.logoUrl,
      },
    });
  }
  for (const [slug, products] of Object.entries(PRODUCTS_BY_SET)) {
    const set = await db.set.findUnique({ where: { slug } });
    if (!set) continue;
    for (const p of products) {
      await db.product.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, setId: set.id } });
    }
  }
  console.log("  ✓ store sets & products");

  // ── TcgSets ───────────────────────────────────────────────────────────────
  for (const s of TCG_SETS) {
    const storeSet = await db.set.findUnique({ where: { slug: s.storeSlug } });
    await db.tcgSet.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id, name: s.name, series: s.series,
        printedTotal: s.printedTotal, releaseDate: s.releaseDate,
        symbolUrl: s.symbolUrl, logoUrl: s.logoUrl,
        ...(storeSet && { storeSetId: storeSet.id }),
      },
    });
  }
  console.log("  ✓ TCG sets");

  // ── PokemonCards ──────────────────────────────────────────────────────────
  for (const c of CARDS) {
    await db.pokemonCard.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }
  console.log("  ✓ Pokémon cards");

  // ── Inventory ─────────────────────────────────────────────────────────────
  // Ash: Charizard ex (NM), Koraidon ex (NM x2), Gardevoir ex (LP)
  const ashCards = await Promise.all([
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: ash.id, cardId: "sv3-36",  condition: "NEAR_MINT",     foil: false } },
      update: {}, create: { userId: ash.id, cardId: "sv3-36",  condition: "NEAR_MINT",     quantity: 1, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: ash.id, cardId: "sv1-184", condition: "NEAR_MINT",     foil: false } },
      update: {}, create: { userId: ash.id, cardId: "sv1-184", condition: "NEAR_MINT",     quantity: 2, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: ash.id, cardId: "sv2-91",  condition: "LIGHTLY_PLAYED", foil: false } },
      update: {}, create: { userId: ash.id, cardId: "sv2-91",  condition: "LIGHTLY_PLAYED", quantity: 1, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: ash.id, cardId: "sv3-223", condition: "MINT",           foil: false } },
      update: {}, create: { userId: ash.id, cardId: "sv3-223", condition: "MINT",           quantity: 1, foil: false },
    }),
  ]);

  // Misty: Miraidon ex (NM), Iron Valiant ex (MP x2), Gardevoir ex SIR (NM)
  const mistyCards = await Promise.all([
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: misty.id, cardId: "sv1-185", condition: "NEAR_MINT",         foil: false } },
      update: {}, create: { userId: misty.id, cardId: "sv1-185", condition: "NEAR_MINT",         quantity: 1, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: misty.id, cardId: "sv2-197", condition: "MODERATELY_PLAYED", foil: false } },
      update: {}, create: { userId: misty.id, cardId: "sv2-197", condition: "MODERATELY_PLAYED", quantity: 2, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: misty.id, cardId: "sv2-245", condition: "NEAR_MINT",         foil: false } },
      update: {}, create: { userId: misty.id, cardId: "sv2-245", condition: "NEAR_MINT",         quantity: 1, foil: false },
    }),
  ]);

  // Brock: Arcanine ex (NM x3), Pidgeot ex (LP), Koraidon SIR (NM)
  const brockCards = await Promise.all([
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: brock.id, cardId: "sv1-36",  condition: "NEAR_MINT",      foil: false } },
      update: {}, create: { userId: brock.id, cardId: "sv1-36",  condition: "NEAR_MINT",      quantity: 3, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: brock.id, cardId: "sv3-125", condition: "LIGHTLY_PLAYED", foil: false } },
      update: {}, create: { userId: brock.id, cardId: "sv3-125", condition: "LIGHTLY_PLAYED", quantity: 1, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: brock.id, cardId: "sv1-193", condition: "NEAR_MINT",      foil: false } },
      update: {}, create: { userId: brock.id, cardId: "sv1-193", condition: "NEAR_MINT",      quantity: 1, foil: false },
    }),
  ]);

  // Gary: Charizard ex SIR (Mint), Revavroom ex (NM), Iron Valiant SIR (NM)
  const garyCards = await Promise.all([
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: gary.id, cardId: "sv3-223", condition: "MINT",      foil: false } },
      update: {}, create: { userId: gary.id, cardId: "sv3-223", condition: "MINT",      quantity: 1, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: gary.id, cardId: "sv3-182", condition: "NEAR_MINT", foil: false } },
      update: {}, create: { userId: gary.id, cardId: "sv3-182", condition: "NEAR_MINT", quantity: 2, foil: false },
    }),
    db.userCard.upsert({
      where: { userId_cardId_condition_foil: { userId: gary.id, cardId: "sv2-250", condition: "NEAR_MINT", foil: false } },
      update: {}, create: { userId: gary.id, cardId: "sv2-250", condition: "NEAR_MINT", quantity: 1, foil: false },
    }),
  ]);
  console.log("  ✓ inventory");

  // ── Marketplace Listings ──────────────────────────────────────────────────
  // Clear existing listings from seed users before recreating (idempotent)
  const seedUserIds = [ash.id, misty.id, brock.id, gary.id];
  const existingOffers = await db.tradeOffer.findMany({ where: { offererId: { in: seedUserIds } }, select: { id: true } });
  await db.offerItem.deleteMany({ where: { offerId: { in: existingOffers.map(o => o.id) } } });
  await db.tradeOffer.deleteMany({ where: { offererId: { in: seedUserIds } } });
  await db.listing.deleteMany({ where: { sellerId: { in: seedUserIds } } });

  // Ash listings
  const ashCharizardListing = await db.listing.create({
    data: {
      sellerId: ash.id, userCardId: ashCards[0].id,
      quantity: 1, listingType: "SALE", askingPrice: 35.00,
      description: "Pack fresh Charizard ex. One of the most iconic cards in OBF.",
    },
  });
  const ashKoraidonListing = await db.listing.create({
    data: {
      sellerId: ash.id, userCardId: ashCards[1].id,
      quantity: 1, listingType: "TRADE_OR_SALE", askingPrice: 18.00,
      description: "Looking to trade for Miraidon ex or any SIR. Will also sell.",
    },
  });
  const ashCharizardSirListing = await db.listing.create({
    data: {
      sellerId: ash.id, userCardId: ashCards[3].id, // sv3-223 MINT
      quantity: 1, listingType: "SALE", askingPrice: 89.00,
      description: "Mint Charizard ex SIR — Mitsuhiro Arita art. Been in a sleeve since I pulled it.",
    },
  });

  // Misty listings
  const mistyMiraidonListing = await db.listing.create({
    data: {
      sellerId: misty.id, userCardId: mistyCards[0].id, // sv1-185 NM
      quantity: 1, listingType: "SALE", askingPrice: 22.00,
      description: "Miraidon ex NM. Happy to ship with tracking.",
    },
  });
  const mistyGardevoirSirListing = await db.listing.create({
    data: {
      sellerId: misty.id, userCardId: mistyCards[2].id, // sv2-245 NM SIR
      quantity: 1, listingType: "TRADE_OR_SALE", askingPrice: 45.00,
      description: "Gardevoir ex SIR (Naoki Saito art). Open to trading for Charizard ex cards.",
    },
  });
  const mistyIronValiantListing = await db.listing.create({
    data: {
      sellerId: misty.id, userCardId: mistyCards[1].id, // sv2-197 MP x2
      quantity: 2, listingType: "SALE", askingPrice: 7.50,
      description: "Two copies of Iron Valiant ex, moderately played. Priced to sell.",
    },
  });

  // Brock listings
  const brockArcanineListing = await db.listing.create({
    data: {
      sellerId: brock.id, userCardId: brockCards[0].id, // sv1-36 NM x3
      quantity: 2, listingType: "SALE", askingPrice: 12.00,
      description: "Selling 2 copies of Arcanine ex NM. Bought an extra ETB.",
    },
  });
  const brockPidgeotListing = await db.listing.create({
    data: {
      sellerId: brock.id, userCardId: brockCards[1].id, // sv3-125 LP
      quantity: 1, listingType: "TRADE",
      description: "Pidgeot ex LP — looking for Gardevoir ex or Iron Valiant ex in NM+.",
    },
  });
  const brockKoraidonSirListing = await db.listing.create({
    data: {
      sellerId: brock.id, userCardId: brockCards[2].id, // sv1-193 NM SIR
      quantity: 1, listingType: "SALE", askingPrice: 62.00,
      description: "Koraidon ex SIR, near mint. Teeziro artwork. One of the best SIRs in the set.",
    },
  });

  // Gary listings
  const garyRevavroomListing = await db.listing.create({
    data: {
      sellerId: gary.id, userCardId: garyCards[1].id, // sv3-182 NM x2
      quantity: 1, listingType: "TRADE",
      description: "Revavroom ex NM. Want Charizard ex (OBF) NM or better.",
    },
  });
  const garyCharizardSirListing = await db.listing.create({
    data: {
      sellerId: gary.id, userCardId: garyCards[0].id, // sv3-223 MINT
      quantity: 1, listingType: "SALE", askingPrice: 95.00,
      description: "Mint condition Charizard ex SIR. This is the one everyone wants.",
    },
  });
  const garyIronValiantSirListing = await db.listing.create({
    data: {
      sellerId: gary.id, userCardId: garyCards[2].id, // sv2-250 NM SIR
      quantity: 1, listingType: "TRADE_OR_SALE", askingPrice: 38.00,
      description: "Iron Valiant ex SIR (Mitsuhiro Arita). Will trade for Gardevoir ex SIR.",
    },
  });
  console.log("  ✓ listings (12)");

  // ── Trade Offers ──────────────────────────────────────────────────────────
  // Misty makes a cash offer on Ash's Charizard ex
  await db.tradeOffer.create({
    data: {
      listingId: ashCharizardListing.id, offererId: misty.id,
      offerType: "CASH", cashAmount: 30.00,
      message:   "Would you take €30? I can pay immediately.",
    },
  });
  // Gary makes a trade offer on Ash's Koraidon ex (offers his Iron Valiant SIR)
  await db.tradeOffer.create({
    data: {
      listingId: ashKoraidonListing.id, offererId: gary.id,
      offerType: "TRADE",
      message:   "I'll trade my Iron Valiant ex SIR for your Koraidon ex.",
      items: { create: [{ userCardId: garyCards[2].id, quantity: 1 }] },
    },
  });
  // Ash offers cash + Gardevoir ex LP for Gary's Revavroom ex
  await db.tradeOffer.create({
    data: {
      listingId: garyRevavroomListing.id, offererId: ash.id,
      offerType: "MIXED", cashAmount: 5.00,
      message:   "Offering €5 + my Gardevoir ex (LP) for your Revavroom ex.",
      items: { create: [{ userCardId: ashCards[2].id, quantity: 1 }] },
    },
  });
  // Brock makes a cash offer on Misty's Gardevoir SIR
  await db.tradeOffer.create({
    data: {
      listingId: mistyGardevoirSirListing.id, offererId: brock.id,
      offerType: "CASH", cashAmount: 40.00,
      message:   "Best I can do is €40 — let me know!",
    },
  });
  // Ash makes a cash offer on Gary's Iron Valiant SIR
  await db.tradeOffer.create({
    data: {
      listingId: garyIronValiantSirListing.id, offererId: ash.id,
      offerType: "CASH", cashAmount: 35.00,
      message:   "Would you take €35 for the Iron Valiant SIR?",
    },
  });
  console.log("  ✓ trade offers (5)");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\nSeed complete.");
  console.log("  admin@pokestore.dev   / admin1234");
  console.log("  ash@pokestore.dev     / customer1234");
  console.log("  misty@pokestore.dev   / customer1234");
  console.log("  brock@pokestore.dev   / customer1234");
  console.log("  gary@pokestore.dev    / customer1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
