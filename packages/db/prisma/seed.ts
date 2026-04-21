import { PrismaClient, ProductType, CardCondition, ListingType, OfferType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── TCG Sets ─────────────────────────────────────────────────────────────────

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

// ─── Cards — all IDs verified against pokemontcg.io ──────────────────────────

const CARDS = [
  // SV1 — Scarlet & Violet base
  { id: "sv1-32",  name: "Arcanine ex",  number: "32",  rarity: "Double Rare",               tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/32.png",  imageLarge: "https://images.pokemontcg.io/sv1/32_hires.png" },
  { id: "sv1-86",  name: "Gardevoir ex", number: "86",  rarity: "Double Rare",               tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/86.png",  imageLarge: "https://images.pokemontcg.io/sv1/86_hires.png" },
  { id: "sv1-81",  name: "Miraidon ex",  number: "81",  rarity: "Double Rare",               tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/81.png",  imageLarge: "https://images.pokemontcg.io/sv1/81_hires.png" },
  { id: "sv1-125", name: "Koraidon ex",  number: "125", rarity: "Double Rare",               tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/125.png", imageLarge: "https://images.pokemontcg.io/sv1/125_hires.png" },
  { id: "sv1-228", name: "Gardevoir ex", number: "228", rarity: "Ultra Rare",                tcgSetId: "sv1", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv1/228.png", imageLarge: "https://images.pokemontcg.io/sv1/228_hires.png" },
  { id: "sv1-244", name: "Miraidon ex",  number: "244", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Andi Kumararatne",
    imageSmall: "https://images.pokemontcg.io/sv1/244.png", imageLarge: "https://images.pokemontcg.io/sv1/244_hires.png" },
  { id: "sv1-245", name: "Gardevoir ex", number: "245", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Naoki Saito",
    imageSmall: "https://images.pokemontcg.io/sv1/245.png", imageLarge: "https://images.pokemontcg.io/sv1/245_hires.png" },
  { id: "sv1-247", name: "Koraidon ex",  number: "247", rarity: "Special Illustration Rare", tcgSetId: "sv1", artist: "Teeziro",
    imageSmall: "https://images.pokemontcg.io/sv1/247.png", imageLarge: "https://images.pokemontcg.io/sv1/247_hires.png" },

  // SV2 — Paldea Evolved
  { id: "sv2-15",  name: "Meowscarada ex", number: "15",  rarity: "Double Rare",               tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/15.png",  imageLarge: "https://images.pokemontcg.io/sv2/15_hires.png" },
  { id: "sv2-37",  name: "Skeledirge ex",  number: "37",  rarity: "Double Rare",               tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/37.png",  imageLarge: "https://images.pokemontcg.io/sv2/37_hires.png" },
  { id: "sv2-61",  name: "Chien-Pao ex",   number: "61",  rarity: "Double Rare",               tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/61.png",  imageLarge: "https://images.pokemontcg.io/sv2/61_hires.png" },
  { id: "sv2-63",  name: "Pikachu ex",     number: "63",  rarity: "Double Rare",               tcgSetId: "sv2", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv2/63.png",  imageLarge: "https://images.pokemontcg.io/sv2/63_hires.png" },
  { id: "sv2-254", name: "Iono",           number: "254", rarity: "Ultra Rare",                tcgSetId: "sv2", artist: "Ryuta Fuse",
    imageSmall: "https://images.pokemontcg.io/sv2/254.png", imageLarge: "https://images.pokemontcg.io/sv2/254_hires.png" },
  { id: "sv2-256", name: "Meowscarada ex", number: "256", rarity: "Special Illustration Rare", tcgSetId: "sv2", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv2/256.png", imageLarge: "https://images.pokemontcg.io/sv2/256_hires.png" },
  { id: "sv2-261", name: "Chien-Pao ex",   number: "261", rarity: "Special Illustration Rare", tcgSetId: "sv2", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv2/261.png", imageLarge: "https://images.pokemontcg.io/sv2/261_hires.png" },

  // SV3 — Obsidian Flames
  { id: "sv3-66",  name: "Tyranitar ex",  number: "66",  rarity: "Double Rare",               tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/66.png",  imageLarge: "https://images.pokemontcg.io/sv3/66_hires.png" },
  { id: "sv3-79",  name: "Miraidon ex",   number: "79",  rarity: "Double Rare",               tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/79.png",  imageLarge: "https://images.pokemontcg.io/sv3/79_hires.png" },
  { id: "sv3-125", name: "Charizard ex",  number: "125", rarity: "Double Rare",               tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/125.png", imageLarge: "https://images.pokemontcg.io/sv3/125_hires.png" },
  { id: "sv3-156", name: "Revavroom ex",  number: "156", rarity: "Double Rare",               tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/156.png", imageLarge: "https://images.pokemontcg.io/sv3/156_hires.png" },
  { id: "sv3-159", name: "Dragonite ex",  number: "159", rarity: "Double Rare",               tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/159.png", imageLarge: "https://images.pokemontcg.io/sv3/159_hires.png" },
  { id: "sv3-164", name: "Pidgeot ex",    number: "164", rarity: "Double Rare",               tcgSetId: "sv3", artist: "5ban Graphics",
    imageSmall: "https://images.pokemontcg.io/sv3/164.png", imageLarge: "https://images.pokemontcg.io/sv3/164_hires.png" },
  { id: "sv3-223", name: "Charizard ex",  number: "223", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/223.png", imageLarge: "https://images.pokemontcg.io/sv3/223_hires.png" },
  { id: "sv3-224", name: "Revavroom ex",  number: "224", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/224.png", imageLarge: "https://images.pokemontcg.io/sv3/224_hires.png" },
  { id: "sv3-225", name: "Pidgeot ex",    number: "225", rarity: "Special Illustration Rare", tcgSetId: "sv3", artist: "Mitsuhiro Arita",
    imageSmall: "https://images.pokemontcg.io/sv3/225.png", imageLarge: "https://images.pokemontcg.io/sv3/225_hires.png" },
];

// ─── Store products ───────────────────────────────────────────────────────────

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
// NM baseline market values (€). Condition multipliers applied at listing time.

const BASE_PRICE: Record<string, number> = {
  "sv1-32": 12,  "sv1-86": 25,  "sv1-81": 20,  "sv1-125": 18,
  "sv1-228": 65, "sv1-244": 55, "sv1-245": 70, "sv1-247": 50,
  "sv2-15": 12,  "sv2-37": 10,  "sv2-61": 15,  "sv2-63": 18,
  "sv2-254": 120,"sv2-256": 35, "sv2-261": 45,
  "sv3-66": 12,  "sv3-79": 20,  "sv3-125": 35, "sv3-156": 8,
  "sv3-159": 14, "sv3-164": 15, "sv3-223": 85, "sv3-224": 30, "sv3-225": 40,
};

const COND_MULT: Record<CardCondition, number> = {
  MINT: 1.15, NEAR_MINT: 1.0, LIGHTLY_PLAYED: 0.80,
  MODERATELY_PLAYED: 0.60, HEAVILY_PLAYED: 0.35, DAMAGED: 0.15,
};

function price(cardId: string, cond: CardCondition, discount = 0): number {
  const base = (BASE_PRICE[cardId] ?? 10) * (COND_MULT[cond] ?? 1.0);
  return Math.max(0.99, Math.round((base * (1 - discount)) * 100) / 100);
}

// ─── User profiles ────────────────────────────────────────────────────────────

type CardSlot = { cardId: string; condition: CardCondition; qty: number };
type ListingDef = {
  cardIdx: number;          // index into the user's cards array
  type: ListingType;
  price?: number;           // omit for TRADE-only
  desc: string;
};
type UserProfile = {
  email: string;
  name: string;
  cards: CardSlot[];
  listings: ListingDef[];
};

const USER_PROFILES: UserProfile[] = [
  // ── Original test users ────────────────────────────────────────────────────
  {
    email: "ash@pokestore.dev", name: "Ash Ketchum",
    cards: [
      { cardId: "sv3-125", condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv1-125", condition: "NEAR_MINT",      qty: 2 },
      { cardId: "sv1-86",  condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv3-223", condition: "MINT",           qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE",         price: price("sv3-125","NEAR_MINT"), desc: "Pack fresh Charizard ex (Double Rare). One of the most iconic OBF cards." },
      { cardIdx: 1, type: "TRADE_OR_SALE",price: price("sv1-125","NEAR_MINT"), desc: "Koraidon ex NM — open to trades for Miraidon ex or any SIR." },
      { cardIdx: 3, type: "SALE",         price: price("sv3-223","MINT"),       desc: "Charizard ex SIR — Mitsuhiro Arita art. Mint, sleeved since pull." },
    ],
  },
  {
    email: "misty@pokestore.dev", name: "Misty",
    cards: [
      { cardId: "sv1-81",  condition: "NEAR_MINT",         qty: 1 },
      { cardId: "sv2-63",  condition: "MODERATELY_PLAYED", qty: 2 },
      { cardId: "sv1-245", condition: "NEAR_MINT",         qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE",          price: price("sv1-81", "NEAR_MINT"),         desc: "Miraidon ex NM from SV base set. Ships with tracking." },
      { cardIdx: 2, type: "TRADE_OR_SALE", price: price("sv1-245","NEAR_MINT"),         desc: "Gardevoir ex SIR (Naoki Saito art). Open to Charizard ex trades." },
      { cardIdx: 1, type: "SALE",          price: price("sv2-63", "MODERATELY_PLAYED"), desc: "Two Pikachu ex (Paldea Evolved), mod. played. Priced to sell fast." },
    ],
  },
  {
    email: "brock@pokestore.dev", name: "Brock",
    cards: [
      { cardId: "sv1-32",  condition: "NEAR_MINT",      qty: 3 },
      { cardId: "sv3-164", condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv1-247", condition: "NEAR_MINT",      qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE",  price: price("sv1-32","NEAR_MINT"),      desc: "Two Arcanine ex NM (SV base). Great for competitive builds." },
      { cardIdx: 1, type: "TRADE",                                           desc: "Pidgeot ex LP — want Gardevoir ex or Chien-Pao ex NM+." },
      { cardIdx: 2, type: "SALE",  price: price("sv1-247","NEAR_MINT"),     desc: "Koraidon ex SIR (Teeziro art). NM, one of the best SIRs in the set." },
    ],
  },
  {
    email: "gary@pokestore.dev", name: "Gary Oak",
    cards: [
      { cardId: "sv3-223", condition: "MINT",      qty: 1 },
      { cardId: "sv3-156", condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv2-256", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [
      { cardIdx: 1, type: "TRADE",         desc: "Revavroom ex NM (OBF). Looking for Charizard ex NM or better." },
      { cardIdx: 0, type: "SALE",  price: price("sv3-223","MINT"),      desc: "Mint Charizard ex SIR (OBF #223). Sleeved from pack." },
      { cardIdx: 2, type: "TRADE_OR_SALE", price: price("sv2-256","NEAR_MINT"), desc: "Meowscarada ex SIR — will trade for Gardevoir ex SIR." },
    ],
  },

  // ── Collectors ─────────────────────────────────────────────────────────────
  {
    email: "giovanni@pokestore.dev", name: "Giovanni",
    cards: [
      { cardId: "sv1-228", condition: "MINT",      qty: 1 },
      { cardId: "sv1-245", condition: "MINT",      qty: 1 },
      { cardId: "sv1-244", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-223", condition: "MINT",      qty: 1 },
      { cardId: "sv2-254", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-247", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-225", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [], // collector, holds everything
  },
  {
    email: "sabrina@pokestore.dev", name: "Sabrina",
    cards: [
      { cardId: "sv1-86",  condition: "MINT",      qty: 1 },
      { cardId: "sv1-245", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-228", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv2-254", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv2-256", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [],
  },
  {
    email: "red@pokestore.dev", name: "Red",
    cards: [
      { cardId: "sv3-223", condition: "MINT", qty: 1 },
      { cardId: "sv1-245", condition: "MINT", qty: 1 },
      { cardId: "sv1-244", condition: "MINT", qty: 1 },
      { cardId: "sv2-254", condition: "MINT", qty: 1 },
      { cardId: "sv1-247", condition: "MINT", qty: 1 },
    ],
    listings: [],
  },
  {
    email: "lusamine@pokestore.dev", name: "Lusamine",
    cards: [
      { cardId: "sv1-228", condition: "MINT",      qty: 1 },
      { cardId: "sv1-244", condition: "MINT",      qty: 1 },
      { cardId: "sv2-254", condition: "MINT",      qty: 1 },
      { cardId: "sv3-223", condition: "MINT",      qty: 1 },
      { cardId: "sv2-256", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [],
  },
  {
    email: "dawn@pokestore.dev", name: "Dawn",
    cards: [
      { cardId: "sv2-63",  condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv2-254", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-245", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-225", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-81",  condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [],
  },

  // ── Sellers ────────────────────────────────────────────────────────────────
  {
    email: "lorelei@pokestore.dev", name: "Lorelei",
    cards: [
      { cardId: "sv2-63",  condition: "NEAR_MINT",         qty: 3 },
      { cardId: "sv2-61",  condition: "NEAR_MINT",         qty: 2 },
      { cardId: "sv1-81",  condition: "LIGHTLY_PLAYED",    qty: 1 },
      { cardId: "sv1-125", condition: "LIGHTLY_PLAYED",    qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv2-63","NEAR_MINT"),      desc: "Pikachu ex NM (Paldea Evolved) — fast shipping, tracked." },
      { cardIdx: 1, type: "SALE", price: price("sv2-61","NEAR_MINT"),      desc: "Chien-Pao ex NM, competitive staple. Open to offers." },
      { cardIdx: 2, type: "SALE", price: price("sv1-81","LIGHTLY_PLAYED"), desc: "Miraidon ex LP, only minor edge wear. Great play condition." },
      { cardIdx: 3, type: "SALE", price: price("sv1-125","LIGHTLY_PLAYED"),desc: "Koraidon ex LP — priced for a quick sale." },
    ],
  },
  {
    email: "surge@pokestore.dev", name: "Lt. Surge",
    cards: [
      { cardId: "sv3-156", condition: "MODERATELY_PLAYED", qty: 3 },
      { cardId: "sv3-66",  condition: "LIGHTLY_PLAYED",    qty: 2 },
      { cardId: "sv1-32",  condition: "LIGHTLY_PLAYED",    qty: 2 },
      { cardId: "sv2-37",  condition: "LIGHTLY_PLAYED",    qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv3-156","MODERATELY_PLAYED"), desc: "Revavroom ex MP — cheap pickup for budget players." },
      { cardIdx: 1, type: "SALE", price: price("sv3-66", "LIGHTLY_PLAYED"),    desc: "Tyranitar ex LP — solid condition, fair price." },
      { cardIdx: 2, type: "SALE", price: price("sv1-32", "LIGHTLY_PLAYED"),    desc: "Arcanine ex LP — great for play, light edge wear only." },
      { cardIdx: 3, type: "SALE", price: price("sv2-37", "LIGHTLY_PLAYED"),    desc: "Skeledirge ex LP — competitive staple at LP price." },
    ],
  },
  {
    email: "blue@pokestore.dev", name: "Blue",
    cards: [
      { cardId: "sv3-125", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-223", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-86",  condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv2-254", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv2-261", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv3-125","NEAR_MINT",0.05), desc: "Charizard ex NM — slight discount for quick sale. Tracked shipping." },
      { cardIdx: 1, type: "SALE", price: price("sv3-223","NEAR_MINT"),      desc: "Charizard ex SIR NM. Arita art. Buyer pays tracked shipping." },
      { cardIdx: 3, type: "SALE", price: price("sv2-254","NEAR_MINT",0.08), desc: "Iono UR — best price you'll find. Sleeved since pull." },
      { cardIdx: 4, type: "SALE", price: price("sv2-261","NEAR_MINT"),      desc: "Chien-Pao ex SIR NM — Mitsuhiro Arita, beautiful art." },
    ],
  },
  {
    email: "cynthia@pokestore.dev", name: "Cynthia",
    cards: [
      { cardId: "sv3-159", condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv3-164", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-225", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-125", condition: "NEAR_MINT", qty: 2 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv3-159","NEAR_MINT"),      desc: "Dragonite ex NM — underrated card, sleeved since pull." },
      { cardIdx: 1, type: "SALE", price: price("sv3-164","NEAR_MINT"),      desc: "Pidgeot ex NM (OBF) — competitive staple, NM condition." },
      { cardIdx: 2, type: "SALE", price: price("sv3-225","NEAR_MINT",0.05), desc: "Pidgeot ex SIR NM — Arita art, slight discount, ships fast." },
      { cardIdx: 3, type: "SALE", price: price("sv1-125","NEAR_MINT"),      desc: "Koraidon ex NM — both copies available, buy 2 for a deal." },
    ],
  },
  {
    email: "guzma@pokestore.dev", name: "Guzma",
    cards: [
      { cardId: "sv1-32",  condition: "NEAR_MINT", qty: 3 },
      { cardId: "sv2-63",  condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv2-61",  condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv3-156", condition: "NEAR_MINT", qty: 2 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv1-32","NEAR_MINT",0.05),  desc: "Arcanine ex NM — bulk listing, buy multiple." },
      { cardIdx: 1, type: "SALE", price: price("sv2-63","NEAR_MINT"),       desc: "Pikachu ex NM — paldea evolved, ships same day." },
      { cardIdx: 2, type: "SALE", price: price("sv2-61","LIGHTLY_PLAYED"),  desc: "Chien-Pao ex LP — slight surface scratches, otherwise clean." },
      { cardIdx: 3, type: "SALE", price: price("sv3-156","NEAR_MINT",0.1),  desc: "Revavroom ex NM — best price available, need to clear stock." },
    ],
  },
  {
    email: "acerola@pokestore.dev", name: "Acerola",
    cards: [
      { cardId: "sv2-15",  condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv2-256", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-86",  condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-164", condition: "NEAR_MINT", qty: 2 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv2-15","NEAR_MINT"),       desc: "Meowscarada ex NM (Paldea Evolved) — two available." },
      { cardIdx: 1, type: "SALE", price: price("sv2-256","NEAR_MINT",0.05), desc: "Meowscarada ex SIR NM — Arita art. Slight discount this week." },
      { cardIdx: 2, type: "SALE", price: price("sv1-86","NEAR_MINT"),       desc: "Gardevoir ex NM (SV base) — competitive classic." },
      { cardIdx: 3, type: "SALE", price: price("sv3-164","NEAR_MINT"),      desc: "Pidgeot ex NM x2 — both available, open to bundle offers." },
    ],
  },
  {
    email: "may@pokestore.dev", name: "May",
    cards: [
      { cardId: "sv2-37",  condition: "NEAR_MINT",      qty: 3 },
      { cardId: "sv2-15",  condition: "LIGHTLY_PLAYED", qty: 2 },
      { cardId: "sv1-32",  condition: "NEAR_MINT",      qty: 2 },
      { cardId: "sv3-156", condition: "LIGHTLY_PLAYED", qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "SALE", price: price("sv2-37","NEAR_MINT"),        desc: "Skeledirge ex NM — 3 available, bundle for discount." },
      { cardIdx: 1, type: "SALE", price: price("sv2-15","LIGHTLY_PLAYED"),   desc: "Meowscarada ex LP — play condition, great for decks." },
      { cardIdx: 2, type: "SALE", price: price("sv1-32","NEAR_MINT",0.05),   desc: "Arcanine ex NM — slightly below market, quick sale." },
      { cardIdx: 3, type: "SALE", price: price("sv3-156","LIGHTLY_PLAYED"),  desc: "Revavroom ex LP — competitive price for LP condition." },
    ],
  },

  // ── Traders ────────────────────────────────────────────────────────────────
  {
    email: "erika@pokestore.dev", name: "Erika",
    cards: [
      { cardId: "sv2-15",  condition: "NEAR_MINT",      qty: 2 },
      { cardId: "sv2-37",  condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv1-86",  condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv1-32",  condition: "NEAR_MINT",      qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "TRADE",         desc: "Meowscarada ex NM — want Gardevoir ex SIR NM or better." },
      { cardIdx: 2, type: "TRADE_OR_SALE", price: price("sv1-86","LIGHTLY_PLAYED"), desc: "Gardevoir ex LP — open to any Double Rare ex trade." },
    ],
  },
  {
    email: "lance@pokestore.dev", name: "Lance",
    cards: [
      { cardId: "sv3-159", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-125", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-66",  condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv3-79",  condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-224", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [
      { cardIdx: 4, type: "TRADE_OR_SALE", price: price("sv3-224","NEAR_MINT"), desc: "Revavroom ex SIR NM — want Charizard ex SIR or Pidgeot ex SIR." },
    ],
  },
  {
    email: "blaine@pokestore.dev", name: "Blaine",
    cards: [
      { cardId: "sv3-125", condition: "NEAR_MINT", qty: 2 },
      { cardId: "sv3-156", condition: "NEAR_MINT", qty: 3 },
      { cardId: "sv3-79",  condition: "LIGHTLY_PLAYED", qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "TRADE_OR_SALE", price: price("sv3-125","NEAR_MINT",0.05), desc: "Charizard ex NM — will take Charizard ex SIR in trade." },
      { cardIdx: 1, type: "TRADE",  desc: "Revavroom ex NM — want any SIR or Iono UR." },
    ],
  },
  {
    email: "koga@pokestore.dev", name: "Koga",
    cards: [
      { cardId: "sv3-156", condition: "LIGHTLY_PLAYED",    qty: 1 },
      { cardId: "sv2-37",  condition: "MODERATELY_PLAYED", qty: 1 },
      { cardId: "sv1-32",  condition: "MODERATELY_PLAYED", qty: 2 },
      { cardId: "sv3-66",  condition: "MODERATELY_PLAYED", qty: 1 },
    ],
    listings: [
      { cardIdx: 2, type: "TRADE_OR_SALE", price: price("sv1-32","MODERATELY_PLAYED"), desc: "Arcanine ex MP — fair MP price, open to any NM ex trade." },
      { cardIdx: 3, type: "TRADE",  desc: "Tyranitar ex MP — want Dragonite ex or Pidgeot ex." },
    ],
  },
  {
    email: "steven@pokestore.dev", name: "Steven Stone",
    cards: [
      { cardId: "sv1-244", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv1-247", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-225", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv3-224", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv2-256", condition: "NEAR_MINT", qty: 1 },
      { cardId: "sv2-261", condition: "NEAR_MINT", qty: 1 },
    ],
    listings: [
      { cardIdx: 3, type: "TRADE_OR_SALE", price: price("sv3-224","NEAR_MINT",0.05), desc: "Revavroom ex SIR NM — open to full art trades." },
    ],
  },
  {
    email: "iris@pokestore.dev", name: "Iris",
    cards: [
      { cardId: "sv3-159", condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv3-79",  condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv3-66",  condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv3-164", condition: "LIGHTLY_PLAYED", qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "TRADE_OR_SALE", price: price("sv3-159","NEAR_MINT"), desc: "Dragonite ex NM — want Charizard ex NM or trade up." },
      { cardIdx: 3, type: "TRADE",  desc: "Pidgeot ex LP — want Dragonite ex NM or Miraidon ex NM." },
    ],
  },
  {
    email: "gladion@pokestore.dev", name: "Gladion",
    cards: [
      { cardId: "sv1-125", condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv1-81",  condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv2-61",  condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv1-247", condition: "LIGHTLY_PLAYED", qty: 1 },
    ],
    listings: [
      { cardIdx: 2, type: "TRADE_OR_SALE", price: price("sv2-61","NEAR_MINT"), desc: "Chien-Pao ex NM — competitive staple, open to equivalent trades." },
      { cardIdx: 3, type: "TRADE",  desc: "Koraidon ex SIR LP — want SIR of equal or higher value." },
    ],
  },
  {
    email: "nanu@pokestore.dev", name: "Nanu",
    cards: [
      { cardId: "sv1-86",  condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv2-256", condition: "NEAR_MINT",      qty: 1 },
      { cardId: "sv1-228", condition: "LIGHTLY_PLAYED", qty: 1 },
      { cardId: "sv3-223", condition: "LIGHTLY_PLAYED", qty: 1 },
    ],
    listings: [
      { cardIdx: 0, type: "TRADE_OR_SALE", price: price("sv1-86","LIGHTLY_PLAYED"),  desc: "Gardevoir ex LP — open to NM ex cards in trade." },
      { cardIdx: 3, type: "TRADE_OR_SALE", price: price("sv3-223","LIGHTLY_PLAYED"), desc: "Charizard ex SIR LP — looking for NM SIR or UR upgrade." },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding database…");

  const pw = {
    admin:    await bcrypt.hash("admin1234",    12),
    customer: await bcrypt.hash("customer1234", 12),
  };

  // Admin user
  await db.user.upsert({
    where:  { email: "admin@pokestore.dev" },
    update: {},
    create: { email: "admin@pokestore.dev", name: "Admin", password: pw.admin, role: "ADMIN" },
  });

  // Upsert all test users
  const upsertedUsers = await Promise.all(
    USER_PROFILES.map((u) =>
      db.user.upsert({
        where:  { email: u.email },
        update: {},
        create: { email: u.email, name: u.name, password: pw.customer },
      })
    )
  );
  console.log(`  ✓ ${upsertedUsers.length} test users`);

  // ── Store sets & products ──────────────────────────────────────────────────
  for (const s of TCG_SETS) {
    await db.set.upsert({
      where:  { slug: s.storeSlug },
      update: {},
      create: { name: s.name, series: s.series, slug: s.storeSlug, releaseDate: s.releaseDate, logoUrl: s.logoUrl },
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

  // ── TCG sets ──────────────────────────────────────────────────────────────
  for (const s of TCG_SETS) {
    const storeSet = await db.set.findUnique({ where: { slug: s.storeSlug } });
    await db.tcgSet.upsert({
      where:  { id: s.id },
      update: {},
      create: {
        id: s.id, name: s.name, series: s.series,
        printedTotal: s.printedTotal, releaseDate: s.releaseDate,
        symbolUrl: s.symbolUrl, logoUrl: s.logoUrl,
        ...(storeSet && { storeSetId: storeSet.id }),
      },
    });
  }

  // ── Pokémon cards ──────────────────────────────────────────────────────────
  for (const c of CARDS) {
    await db.pokemonCard.upsert({ where: { id: c.id }, update: {}, create: c });
  }
  console.log("  ✓ TCG sets & cards");

  // ── Clean slate: delete all marketplace/inventory data for test users ──────
  const seedUserIds = upsertedUsers.map((u) => u.id);

  // All listings that belong to seed users
  const seedListings = await db.listing.findMany({
    where:  { sellerId: { in: seedUserIds } },
    select: { id: true },
  });
  const seedListingIds = seedListings.map((l) => l.id);

  // All offers made by seed users OR on seed users' listings
  const seedOffers = await db.tradeOffer.findMany({
    where: {
      OR: [
        { offererId: { in: seedUserIds } },
        { listingId: { in: seedListingIds } },
      ],
    },
    select: { id: true },
  });
  const seedOfferIds = seedOffers.map((o) => o.id);

  await db.offerItem.deleteMany({ where: { offerId: { in: seedOfferIds } } });
  await db.tradeOffer.deleteMany({ where: { id:     { in: seedOfferIds } } });
  await db.listing.deleteMany(  { where: { sellerId: { in: seedUserIds } } });
  await db.userCard.deleteMany( { where: { userId:   { in: seedUserIds } } });
  console.log("  ✓ clean slate");

  // ── Inventory & listings ───────────────────────────────────────────────────
  let listingCount = 0;

  for (let i = 0; i < USER_PROFILES.length; i++) {
    const profile = USER_PROFILES[i]!;
    const user    = upsertedUsers[i]!;

    // Create userCards
    const userCards = await Promise.all(
      profile.cards.map((c) =>
        db.userCard.create({
          data: { userId: user.id, cardId: c.cardId, condition: c.condition, quantity: c.qty, foil: false },
        })
      )
    );

    // Create listings
    for (const def of profile.listings) {
      const uc = userCards[def.cardIdx];
      if (!uc) continue;
      await db.listing.create({
        data: {
          sellerId:    user.id,
          userCardId:  uc.id,
          quantity:    1,
          listingType: def.type,
          askingPrice: def.price ?? null,
          description: def.desc,
          status:      "ACTIVE",
        },
      });
      listingCount++;
    }
  }
  console.log(`  ✓ inventory & ${listingCount} listings`);

  // ── Trade offers ───────────────────────────────────────────────────────────
  // Re-fetch users and listings by email/seller to set up cross-user offers
  const byEmail = Object.fromEntries(
    upsertedUsers.map((u, i) => [USER_PROFILES[i]!.email, u])
  );

  async function getListing(sellerEmail: string, cardId: string) {
    const seller = byEmail[sellerEmail];
    if (!seller) return null;
    return db.listing.findFirst({
      where: { sellerId: seller.id, userCard: { cardId } },
    });
  }

  async function getUserCard(email: string, cardId: string, condition?: CardCondition) {
    const user = byEmail[email];
    if (!user) return null;
    return db.userCard.findFirst({
      where: { userId: user.id, cardId, ...(condition ? { condition } : {}) },
    });
  }

  const offerDefs: Array<() => Promise<unknown>> = [
    // Misty offers €30 cash on Ash's Charizard ex
    async () => {
      const listing = await getListing("ash@pokestore.dev", "sv3-125");
      if (!listing) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["misty@pokestore.dev"]!.id,
        offerType: "CASH", cashAmount: 30.00,
        message: "Would you take €30? I can pay immediately.",
      }});
    },
    // Gary trades Meowscarada ex SIR for Ash's Koraidon ex
    async () => {
      const listing = await getListing("ash@pokestore.dev", "sv1-125");
      const uc      = await getUserCard("gary@pokestore.dev", "sv2-256");
      if (!listing || !uc) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["gary@pokestore.dev"]!.id,
        offerType: "TRADE", message: "My Meowscarada ex SIR for your Koraidon ex — fair swap.",
        items: { create: [{ userCardId: uc.id, quantity: 1 }] },
      }});
    },
    // Brock cash offer on Misty's Gardevoir ex SIR
    async () => {
      const listing = await getListing("misty@pokestore.dev", "sv1-245");
      if (!listing) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["brock@pokestore.dev"]!.id,
        offerType: "CASH", cashAmount: 40.00,
        message: "Best I can do is €40 — let me know!",
      }});
    },
    // Ash: €5 + Gardevoir ex LP for Gary's Revavroom ex trade listing
    async () => {
      const listing = await getListing("gary@pokestore.dev", "sv3-156");
      const uc      = await getUserCard("ash@pokestore.dev", "sv1-86");
      if (!listing || !uc) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["ash@pokestore.dev"]!.id,
        offerType: "MIXED", cashAmount: 5.00,
        message: "€5 + my Gardevoir ex (LP) for your Revavroom ex.",
        items: { create: [{ userCardId: uc.id, quantity: 1 }] },
      }});
    },
    // Blue cash offer on Gary's Charizard ex SIR
    async () => {
      const listing = await getListing("gary@pokestore.dev", "sv3-223");
      if (!listing) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["blue@pokestore.dev"]!.id,
        offerType: "CASH", cashAmount: 85.00,
        message: "€85 cash — fast transfer, no hassle.",
      }});
    },
    // Giovanni cash offer on Blue's Iono UR
    async () => {
      const listing = await getListing("blue@pokestore.dev", "sv2-254");
      if (!listing) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["giovanni@pokestore.dev"]!.id,
        offerType: "CASH", cashAmount: 100.00,
        message: "€100 for the Iono — I'll do bank transfer or PayPal.",
      }});
    },
    // Lance trades Revavroom ex SIR for Blaine's Charizard ex
    async () => {
      const listing = await getListing("blaine@pokestore.dev", "sv3-125");
      const uc      = await getUserCard("lance@pokestore.dev", "sv3-224");
      if (!listing || !uc) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["lance@pokestore.dev"]!.id,
        offerType: "TRADE", message: "My Revavroom ex SIR for your Charizard ex NM — SIR for ex trade-up.",
        items: { create: [{ userCardId: uc.id, quantity: 1 }] },
      }});
    },
    // Red cash offer on Blaine's Charizard ex
    async () => {
      const listing = await getListing("blaine@pokestore.dev", "sv3-125");
      if (!listing) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["red@pokestore.dev"]!.id,
        offerType: "CASH", cashAmount: price("sv3-125","NEAR_MINT"),
        message: "Full asking price — can pay now.",
      }});
    },
    // Iris trades Dragonite ex NM for Cynthia's Pidgeot ex
    async () => {
      const listing = await getListing("cynthia@pokestore.dev", "sv3-164");
      const uc      = await getUserCard("iris@pokestore.dev", "sv3-159");
      if (!listing || !uc) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["iris@pokestore.dev"]!.id,
        offerType: "TRADE", message: "My Dragonite ex NM for your Pidgeot ex NM — straight swap.",
        items: { create: [{ userCardId: uc.id, quantity: 1 }] },
      }});
    },
    // Nanu: mixed offer on Acerola's Gardevoir ex
    async () => {
      const listing = await getListing("acerola@pokestore.dev", "sv1-86");
      const uc      = await getUserCard("nanu@pokestore.dev", "sv2-256");
      if (!listing || !uc) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["nanu@pokestore.dev"]!.id,
        offerType: "MIXED", cashAmount: 5.00,
        message: "Meowscarada ex SIR + €5 cash for your Gardevoir ex.",
        items: { create: [{ userCardId: uc.id, quantity: 1 }] },
      }});
    },
    // Koga cash on May's Arcanine ex
    async () => {
      const listing = await getListing("may@pokestore.dev", "sv1-32");
      if (!listing) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["koga@pokestore.dev"]!.id,
        offerType: "CASH", cashAmount: price("sv1-32","NEAR_MINT",0.10),
        message: "Slightly below asking — happy to negotiate.",
      }});
    },
    // Gladion trades Koraidon ex SIR LP for Steven's Revavroom ex SIR
    async () => {
      const listing = await getListing("steven@pokestore.dev", "sv3-224");
      const uc      = await getUserCard("gladion@pokestore.dev", "sv1-247","LIGHTLY_PLAYED");
      if (!listing || !uc) return;
      await db.tradeOffer.create({ data: {
        listingId: listing.id, offererId: byEmail["gladion@pokestore.dev"]!.id,
        offerType: "TRADE", message: "Koraidon ex SIR LP for your Revavroom ex SIR — SIR for SIR.",
        items: { create: [{ userCardId: uc.id, quantity: 1 }] },
      }});
    },
  ];

  let offerCount = 0;
  for (const fn of offerDefs) {
    try { await fn(); offerCount++; } catch { /* listing may already be deleted or constraint */ }
  }
  console.log(`  ✓ ${offerCount} trade offers`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n━━ Seed complete ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  admin@pokestore.dev       / admin1234   (ADMIN)");
  console.log("\n  — Original test accounts —");
  console.log("  ash@pokestore.dev         / customer1234  (seller/trader)");
  console.log("  misty@pokestore.dev       / customer1234  (seller/trader)");
  console.log("  brock@pokestore.dev       / customer1234  (seller/trader)");
  console.log("  gary@pokestore.dev        / customer1234  (seller/trader)");
  console.log("\n  — Collectors (few/no listings) —");
  console.log("  giovanni@pokestore.dev    / customer1234");
  console.log("  sabrina@pokestore.dev     / customer1234");
  console.log("  red@pokestore.dev         / customer1234");
  console.log("  lusamine@pokestore.dev    / customer1234");
  console.log("  dawn@pokestore.dev        / customer1234");
  console.log("\n  — Sellers (active listings) —");
  console.log("  lorelei@pokestore.dev     / customer1234");
  console.log("  surge@pokestore.dev       / customer1234");
  console.log("  blue@pokestore.dev        / customer1234");
  console.log("  cynthia@pokestore.dev     / customer1234");
  console.log("  guzma@pokestore.dev       / customer1234");
  console.log("  acerola@pokestore.dev     / customer1234");
  console.log("  may@pokestore.dev         / customer1234");
  console.log("\n  — Traders (TRADE / TRADE_OR_SALE) —");
  console.log("  erika@pokestore.dev       / customer1234");
  console.log("  lance@pokestore.dev       / customer1234");
  console.log("  blaine@pokestore.dev      / customer1234");
  console.log("  koga@pokestore.dev        / customer1234");
  console.log("  steven@pokestore.dev      / customer1234");
  console.log("  iris@pokestore.dev        / customer1234");
  console.log("  gladion@pokestore.dev     / customer1234");
  console.log("  nanu@pokestore.dev        / customer1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
