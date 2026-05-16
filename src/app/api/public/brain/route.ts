import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { DEFAULT_BRAIN } from "@/types/site";

export async function GET() {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ starters: DEFAULT_BRAIN.starters });
  }
  const doc = await db.collection(COL.brain).findOne({ _id: "main" } as never);
  const starters = Array.isArray(doc?.starters) ? (doc!.starters as string[]) : DEFAULT_BRAIN.starters;
  return NextResponse.json({ starters });
}
