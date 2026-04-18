import { db } from "@repo/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sets = await db.set.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(sets);
}
