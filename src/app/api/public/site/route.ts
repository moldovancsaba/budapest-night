import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { mergeSiteDocument } from "@/lib/siteMerge";
import type { SiteDoc } from "@/types/site";

export async function GET() {
  const db = await getDb();
  if (!db) {
    return NextResponse.json(mergeSiteDocument(null));
  }
  const doc = (await db.collection(COL.site).findOne({ _id: "main" } as never)) as unknown as Partial<SiteDoc> | null;
  return NextResponse.json(mergeSiteDocument(doc));
}
