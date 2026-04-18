import { PrismaClient, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 12);
  const customerPassword = await bcrypt.hash("customer1234", 12);

  await db.user.upsert({
    where: { email: "admin@pokestore.dev" },
    update: {},
    create: {
      email: "admin@pokestore.dev",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await db.user.upsert({
    where: { email: "ash@pokestore.dev" },
    update: {},
    create: {
      email: "ash@pokestore.dev",
      name: "Ash Ketchum",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  // ── Sets ───────────────────────────────────────────────────────────────────
  const sets = [
    {
      name: "Scarlet & Violet",
      series: "Scarlet & Violet",
      slug: "scarlet-violet",
      releaseDate: new Date("2023-03-31"),
      logoUrl: "https://images.pokemontcg.io/sv1/logo.png",
    },
    {
      name: "Paldea Evolved",
      series: "Scarlet & Violet",
      slug: "paldea-evolved",
      releaseDate: new Date("2023-06-09"),
      logoUrl: "https://images.pokemontcg.io/sv2/logo.png",
    },
    {
      name: "Obsidian Flames",
      series: "Scarlet & Violet",
      slug: "obsidian-flames",
      releaseDate: new Date("2023-08-11"),
      logoUrl: "https://images.pokemontcg.io/sv3/logo.png",
    },
  ];

  for (const setData of sets) {
    await db.set.upsert({
      where: { slug: setData.slug },
      update: {},
      create: setData,
    });
  }

  // ── Products ───────────────────────────────────────────────────────────────
  type ProductSeed = {
    name: string;
    slug: string;
    type: ProductType;
    price: number;
    stock: number;
    description: string;
  };

  const productsBySet: Record<string, ProductSeed[]> = {
    "scarlet-violet": [
      {
        name: "Scarlet & Violet Booster Pack",
        slug: "sv-booster-pack",
        type: "PACK",
        price: 4.99,
        stock: 150,
        description: "10 cards per pack. Includes at least 1 rare card.",
      },
      {
        name: "Scarlet & Violet Booster Box",
        slug: "sv-booster-box",
        type: "BOX",
        price: 109.99,
        stock: 20,
        description: "36 booster packs. Best value for serious collectors.",
      },
      {
        name: "Scarlet & Violet Elite Trainer Box",
        slug: "sv-etb",
        type: "ETB",
        price: 54.99,
        stock: 30,
        description: "9 booster packs, sleeves, dice, and full accessories.",
      },
    ],
    "paldea-evolved": [
      {
        name: "Paldea Evolved Booster Pack",
        slug: "pe-booster-pack",
        type: "PACK",
        price: 4.99,
        stock: 200,
        description: "10 cards per pack featuring new Paldean Pokémon.",
      },
      {
        name: "Paldea Evolved Booster Box",
        slug: "pe-booster-box",
        type: "BOX",
        price: 114.99,
        stock: 15,
        description: "36 booster packs. Highest pull rates in the SV series.",
      },
      {
        name: "Paldea Evolved Elite Trainer Box",
        slug: "pe-etb",
        type: "ETB",
        price: 54.99,
        stock: 25,
        description: "9 booster packs plus premium accessories.",
      },
    ],
    "obsidian-flames": [
      {
        name: "Obsidian Flames Booster Pack",
        slug: "of-booster-pack",
        type: "PACK",
        price: 4.99,
        stock: 180,
        description: "10 cards per pack. Features Charizard ex and Tera-type Pokémon.",
      },
      {
        name: "Obsidian Flames Booster Box",
        slug: "of-booster-box",
        type: "BOX",
        price: 119.99,
        stock: 12,
        description: "36 packs. Most sought-after set of the SV era.",
      },
      {
        name: "Obsidian Flames Elite Trainer Box",
        slug: "of-etb",
        type: "ETB",
        price: 59.99,
        stock: 20,
        description: "9 booster packs with exclusive Charizard-themed accessories.",
      },
    ],
  };

  for (const [setSlug, products] of Object.entries(productsBySet)) {
    const set = await db.set.findUnique({ where: { slug: setSlug } });
    if (!set) continue;

    for (const p of products) {
      await db.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: { ...p, setId: set.id },
      });
    }
  }

  console.log("Seed complete.");
  console.log("  admin@pokestore.dev  / admin1234");
  console.log("  ash@pokestore.dev    / customer1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
