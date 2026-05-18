import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { getSiteOrigin } from "@/lib/appPaths";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/?newsletter=missing", req.url));
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "No database" }, { status: 503 });
  }

  const r = await db.collection(COL.newsletterSubscribers).updateOne(
    { confirmToken: token, status: "pending" },
    {
      $set: { status: "confirmed", confirmedAt: new Date().toISOString() },
      $unset: { confirmToken: "" },
    },
  );

  const origin = getSiteOrigin();
  if (r.matchedCount === 0) {
    return NextResponse.redirect(`${origin}/?newsletter=invalid`);
  }
  return NextResponse.redirect(`${origin}/?newsletter=confirmed`);
}
