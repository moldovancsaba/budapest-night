import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { getSiteOrigin } from "@/lib/appPaths";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const origin = getSiteOrigin();
  if (!token) return NextResponse.redirect(`${origin}/?newsletter=missing`);

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  await db.collection(COL.newsletterSubscribers).updateOne(
    { unsubscribeToken: token },
    { $set: { status: "unsubscribed" } },
  );

  return NextResponse.redirect(`${origin}/?newsletter=unsubscribed`);
}
