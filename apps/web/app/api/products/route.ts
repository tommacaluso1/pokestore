import { NextRequest, NextResponse } from "next/server";
import { ProductType } from "@repo/db";
import { getProducts } from "@/lib/queries/products";

const VALID_TYPES = new Set<string>(["PACK", "BOX", "ETB", "BUNDLE"]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const setId   = searchParams.get("setId")   ?? undefined;
  const rawType = searchParams.get("type")    ?? undefined;
  const inStock = searchParams.get("inStock") === "true" ? true : undefined;
  const limit   = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  if (rawType && !VALID_TYPES.has(rawType)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${[...VALID_TYPES].join(", ")}` },
      { status: 400 }
    );
  }

  const products = await getProducts({
    setId,
    type: rawType as ProductType | undefined,
    inStock,
    limit,
  });

  return NextResponse.json(products);
}
