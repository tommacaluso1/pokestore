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

// All IDs, numbers and rarities verified against pokemontcg.io API.
const CARDS = [
  // ── SV1 — Scarlet & Violet base ──────────────────────────────────────────
  { id: "sv1-32",  name: "Arcanine ex",   number: "32",  rarity: "Double Rare",              tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/32.png",    imageLarge: "https://images.pokemontcg.io/sv1/32_hires.png" },
  { id: "sv1-86",  name: "Gardevoir ex",  number: "86",  rarity: "Double Rare",              tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/86.png",    imageLarge: "https://images.pokemontcg.io/sv1/86_hires.png" },
  { id: "sv1-81",  name: "Miraidon ex",   number: "81",  rarity: "Double Rare",              tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/81.png",    imageLarge: "https://images.pokemontcg.io/sv1/81_hires.png" },
  { id: "sv1-125", name: "Koraidon ex",   number: "125", rarity: "Double Rare",              tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/125.png",   imageLarge: "https://images.pokemontcg.io/sv1/125_hires.png" },
  { id: "sv1-228", name: "Gardevoir ex",  number: "228", rarity: "Ultra Rare",               tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/228.png",   imageLarge: "https://images.pokemontcg.io/sv1/228_hires.png" },
  { id: "sv1-244", name: "Miraidon ex",   number: "244", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Andi Kumararatne",
    imageSmall: "https://images.pokemontcg.io/sv1/244.png",   imageLarge: "https://images.pokemontcg.io/sv1/244_hires.png" },
  { id: "sv1-245", name: "Gardevoir ex",  number: "245", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Naoki Saito",
    imageSmall: "https://images.pokemontcg.io/sv1/245.png",   imageLarge: "https://images.pokemontcg.io/sv1/245_hires.png" },
  { id: "sv1-247", name: "Koraidon ex",   number: "247", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Teeziro",
    imageSmall: "https://images.pokemontcg.io/sv1/247.png",   imageLarge: "https://images.pokemontcg.io/sv1/247_hires.png" },

  // ── SV2 — Paldea Evolved ─────────────────────────────────────────────────
  { id: "sv2-63",  name: "Pikachu ex",       number: "63",  rarity: "Double Rare",              tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/63.png",    imageLarge: "https://images.pokemontcg.io/sv2/63_hires.png" },
  { id: "sv2-61",  name: "Chien-Pao ex",     number: "61",  rarity: "Double Rare",              tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/61.png",    imageLarge: "https://images.pokemontcg.io/sv2/61_hires.png" },
  { id: "sv2-15",  name: "Meowscarada ex",   number: "15",  rarity: "Double Rare",              tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/15.png",    imageLarge: "https://images.pokemontcg.io/sv2/15_hires.png" },
  { id: "sv2-37",  name: "Skeledirge ex",    number: "37",  rarity: "Double Rare",              tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/37.png",    imageLarge: "https://images.pokemontcg.io/sv2/37_hires.png" },
  { id: "sv2-254", name: "Iono",             number: "254", rarity: "Ultra Rare",               tcgSetId: "sv2", artist: "Ryuta Fuse",
    imageSmall: "https://images.pokemontcg.io/sv2/254.png",   imageLarge: "https://images.pokemontcg.io/sv2/254_hires.png" },
  { id: "sv2-256", name: "Meowscarada ex",   number: "256", rarity: "Special Illustration Rare", tcgSetId: "sv2", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv2/256.png",   imageLarge: "https://images.pokemontcg.io/sv2/256_hires.png" },
  { id: "sv2-261", name: "Chien-Pao ex",     number: "261", rarity: "Special Illustration Rare", tcgSetId: "sv2", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv2/261.png",   imageLarge: "https://images.pokemontcg.io/sv2/261_hires.png" },

  // ── SV3 — Obsidian Flames ─────────────────────────────────────────────────
  { id: "sv3-125", name: "Charizard ex",  number: "125", rarity: "Double Rare",              tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/125.png",   imageLarge: "https://images.pokemontcg.io/sv3/125_hires.png" },
  { id: "sv3-164", name: "Pidgeot ex",    number: "164", rarity: "Double Rare",              tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/164.png",   imageLarge: "https://images.pokemontcg.io/sv3/164_hires.png" },
  { id: "sv3-156", name: "Revavroom ex",  number: "156", rarity: "Double Rare",              tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/156.png",   imageLarge: "https://images.pokemontcg.io/sv3/156_hires.png" },
  { id: "sv3-66",  name: "Tyranitar ex",  number: "66",  rarity: "Double Rare",              tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/66.png",    imageLarge: "https://images.pokemontcg.io/sv3/66_hires.png" },
  { id: "sv3-159", name: "Dragonite ex",  number: "159", rarity: "Double Rare",              tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/159.png",   imageLarge: "https://images.pokemontcg.io/sv3/159_hires.png" },
  { id: "sv3-79",  name: "Miraidon ex",   number: "79",  rarity: "Double Rare",              tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/79.png",    imageLarge: "https://images.pokemontcg.io/sv3/79_hires.png" },
  { id: "sv3-223", name: "Charizard ex",  number: "223", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/223.png",   imageLarge: "https://images.pokemontcg.io/sv3/223_hires.png" },
  { id: "sv3-225", name: "Pidgeot ex",    number: "225", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/225.png",   imageLarge: "https://images.pokemontcg.io/sv3/225_hires.png" },
  { id: "sv3-224", name: "Revavroom ex",  number: "224", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/224.png",   imageLarge: "https://images.pokemontcg.io/sv3/224_hires.png" },
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

  // ── Clean slate for seed users ────────────────────────────────────────────
  const seedUserIds = [ash.id, misty.id, brock.id, gary.id];
  // Delete in FK order: offerItems → offers → listings → userCards
  const existingOffersEarly = await db.tradeOffer.findMany({ where: { offererId: { in: seedUserIds } }, select: { id: true } });
  await db.offerItem.deleteMany({ where: { offerId: { in: existingOffersEarly.map(o => o.id) } } });
  await db.tradeOffer.deleteMany({ where: { offererId: { in: seedUserIds } } });
  await db.listing.deleteMany({ where: { sellerId: { in: seedUserIds } } });
  await db.userCard.deleteMany({ where: { userId: { in: seedUserIds } } });

  // ── Inventory ─────────────────────────────────────────────────────────────

  // Ash: Charizard ex NM (sv3-125), Koraidon ex NM x2 (sv1-125), Gardevoir ex LP (sv1-86), Charizard ex SIR Mint (sv3-223)
  const ashCards = await Promise.all([
    db.userCard.create({ data: { userId: ash.id, cardId: "sv3-125", condition: "NEAR_MINT",     quantity: 1, foil: false } }),
    db.userCard.create({ data: { userId: ash.id, cardId: "sv1-125", condition: "NEAR_MINT",     quantity: 2, foil: false } }),
    db.userCard.create({ data: { userId: ash.id, cardId: "sv1-86",  condition: "LIGHTLY_PLAYED", quantity: 1, foil: false } }),
    db.userCard.create({ data: { userId: ash.id, cardId: "sv3-223", condition: "MINT",           quantity: 1, foil: false } }),
  ]);

  // Misty: Miraidon ex NM (sv1-81), Pikachu ex MP x2 (sv2-63), Gardevoir ex SIR NM (sv1-245)
  const mistyCards = await Promise.all([
    db.userCard.create({ data: { userId: misty.id, cardId: "sv1-81",  condition: "NEAR_MINT",         quantity: 1, foil: false } }),
    db.userCard.create({ data: { userId: misty.id, cardId: "sv2-63",  condition: "MODERATELY_PLAYED", quantity: 2, foil: false } }),
    db.userCard.create({ data: { userId: misty.id, cardId: "sv1-245", condition: "NEAR_MINT",         quantity: 1, foil: false } }),
  ]);

  // Brock: Arcanine ex NM x3 (sv1-32), Pidgeot ex LP (sv3-164), Koraidon ex SIR NM (sv1-247)
  const brockCards = await Promise.all([
    db.userCard.create({ data: { userId: brock.id, cardId: "sv1-32",  condition: "NEAR_MINT",      quantity: 3, foil: false } }),
    db.userCard.create({ data: { userId: brock.id, cardId: "sv3-164", condition: "LIGHTLY_PLAYED", quantity: 1, foil: false } }),
    db.userCard.create({ data: { userId: brock.id, cardId: "sv1-247", condition: "NEAR_MINT",      quantity: 1, foil: false } }),
  ]);

  // Gary: Charizard ex SIR Mint (sv3-223), Revavroom ex NM x2 (sv3-156), Meowscarada ex SIR NM (sv2-256)
  const garyCards = await Promise.all([
    db.userCard.create({ data: { userId: gary.id, cardId: "sv3-223", condition: "MINT",      quantity: 1, foil: false } }),
    db.userCard.create({ data: { userId: gary.id, cardId: "sv3-156", condition: "NEAR_MINT", quantity: 2, foil: false } }),
    db.userCard.create({ data: { userId: gary.id, cardId: "sv2-256", condition: "NEAR_MINT", quantity: 1, foil: false } }),
  ]);
  console.log("  ✓ inventory");

  // ── Marketplace Listings ──────────────────────────────────────────────────

  // Ash — [0]=sv3-125 NM, [1]=sv1-125 NM x2, [2]=sv1-86 LP, [3]=sv3-223 MINT
  const ashCharizardListing = await db.listing.create({
    data: { sellerId: ash.id, userCardId: ashCards[0].id, quantity: 1,
      listingType: "SALE", askingPrice: 35.00,
      description: "Pack fresh Charizard ex (Double Rare). One of the most iconic OBF cards." },
  });
  const ashKoraidonListing = await db.listing.create({
    data: { sellerId: ash.id, userCardId: ashCards[1].id, quantity: 1,
      listingType: "TRADE_OR_SALE", askingPrice: 18.00,
      description: "Koraidon ex NM, open to trades for Miraidon ex or any SIR." },
  });
  const ashCharizardSirListing = await db.listing.create({
    data: { sellerId: ash.id, userCardId: ashCards[3].id, quantity: 1,
      listingType: "SALE", askingPrice: 89.00,
      description: "Charizard ex SIR — Mitsuhiro Arita art. Mint, sleeved since pull." },
  });

  // Misty — [0]=sv1-81 NM, [1]=sv2-63 MP x2, [2]=sv1-245 NM SIR
  const mistyMiraidonListing = await db.listing.create({
    data: { sellerId: misty.id, userCardId: mistyCards[0].id, quantity: 1,
      listingType: "SALE", askingPrice: 22.00,
      description: "Miraidon ex NM from SV base set. Ships with tracking." },
  });
  const mistyGardevoirSirListing = await db.listing.create({
    data: { sellerId: misty.id, userCardId: mistyCards[2].id, quantity: 1,
      listingType: "TRADE_OR_SALE", askingPrice: 45.00,
      description: "Gardevoir ex SIR (Naoki Saito art, SV1). Open to Charizard ex trades." },
  });
  const mistyPikachuListing = await db.listing.create({
    data: { sellerId: misty.id, userCardId: mistyCards[1].id, quantity: 2,
      listingType: "SALE", askingPrice: 8.00,
      description: "Two Pikachu ex (Paldea Evolved), mod. played. Priced to sell fast." },
  });

  // Brock — [0]=sv1-32 NM x3, [1]=sv3-164 LP, [2]=sv1-247 NM SIR
  const brockArcanineListing = await db.listing.create({
    data: { sellerId: brock.id, userCardId: brockCards[0].id, quantity: 2,
      listingType: "SALE", askingPrice: 12.00,
      description: "Two Arcanine ex NM (SV base). Great card for competitive builds." },
  });
  const brockPidgeotListing = await db.listing.create({
    data: { sellerId: brock.id, userCardId: brockCards[1].id, quantity: 1,
      listingType: "TRADE",
      description: "Pidgeot ex LP (OBF) — want Gardevoir ex or Chien-Pao ex NM+." },
  });
  const brockKoraidonSirListing = await db.listing.create({
    data: { sellerId: brock.id, userCardId: brockCards[2].id, quantity: 1,
      listingType: "SALE", askingPrice: 62.00,
      description: "Koraidon ex SIR (Teeziro art, SV1). NM, one of the best SIRs in the set." },
  });

  // Gary — [0]=sv3-223 MINT, [1]=sv3-156 NM x2, [2]=sv2-256 NM SIR
  const garyRevavroomListing = await db.listing.create({
    data: { sellerId: gary.id, userCardId: garyCards[1].id, quantity: 1,
      listingType: "TRADE",
      description: "Revavroom ex NM (OBF). Looking for Charizard ex NM or better." },
  });
  const garyCharizardSirListing = await db.listing.create({
    data: { sellerId: gary.id, userCardId: garyCards[0].id, quantity: 1,
      listingType: "SALE", askingPrice: 95.00,
      description: "Mint Charizard ex SIR (OBF #223). The one. Sleeved from pack." },
  });
  const garyMeowscaradaSirListing = await db.listing.create({
    data: { sellerId: gary.id, userCardId: garyCards[2].id, quantity: 1,
      listingType: "TRADE_OR_SALE", askingPrice: 38.00,
      description: "Meowscarada ex SIR (Mitsuhiro Arita, Paldea Evolved). Will trade for Gardevoir ex SIR." },
  });
  console.log("  ✓ listings (12)");

  // ── Trade Offers ──────────────────────────────────────────────────────────
  // Misty: cash offer on Ash's Charizard ex
  await db.tradeOffer.create({
    data: { listingId: ashCharizardListing.id, offererId: misty.id,
      offerType: "CASH", cashAmount: 30.00,
      message: "Would you take €30? I can pay immediately." },
  });
  // Gary: offers Meowscarada ex SIR for Ash's Koraidon ex
  await db.tradeOffer.create({
    data: { listingId: ashKoraidonListing.id, offererId: gary.id,
      offerType: "TRADE",
      message: "I'll trade my Meowscarada ex SIR for your Koraidon ex.",
      items: { create: [{ userCardId: garyCards[2].id, quantity: 1 }] } },
  });
  // Ash: cash + Gardevoir ex LP for Gary's Revavroom ex
  await db.tradeOffer.create({
    data: { listingId: garyRevavroomListing.id, offererId: ash.id,
      offerType: "MIXED", cashAmount: 5.00,
      message: "€5 + my Gardevoir ex (LP) for your Revavroom ex.",
      items: { create: [{ userCardId: ashCards[2].id, quantity: 1 }] } },
  });
  // Brock: cash offer on Misty's Gardevoir ex SIR
  await db.tradeOffer.create({
    data: { listingId: mistyGardevoirSirListing.id, offererId: brock.id,
      offerType: "CASH", cashAmount: 40.00,
      message: "Best I can do is €40 — let me know!" },
  });
  // Ash: cash offer on Gary's Charizard ex SIR
  await db.tradeOffer.create({
    data: { listingId: garyCharizardSirListing.id, offererId: ash.id,
      offerType: "CASH", cashAmount: 85.00,
      message: "Would you take €85 for the Charizard SIR?" },
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
