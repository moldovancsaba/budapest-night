import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import type { Provider } from "@/types/provider";

function stripId<T extends object>(doc: T): T {
  const o = { ...doc } as Record<string, unknown>;
  delete o._id;
  return o as T;
}

export async function GET() {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured (MONGODB_URI)" }, { status: 503 });
  }
  const rows = (await db.collection(COL.providers).find({}).toArray()) as unknown as (Provider & { _id?: unknown })[];
  return NextResponse.json(rows.map(stripId));
}
