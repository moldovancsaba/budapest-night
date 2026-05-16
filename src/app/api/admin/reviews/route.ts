import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { reaggregateProviderReviews } from "@/lib/reviews/aggregateProviderReviews";
import type { VenueReview } from "@/types/venueReview";

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const url = new URL(req.url);
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 50)));
  const providerId = url.searchParams.get("providerId")?.trim();

  const filter = providerId ? { providerId } : {};
  const rows = (await db
    .collection(COL.venueReviews)
    .find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray()) as unknown as VenueReview[];

  return NextResponse.json(rows);
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const row = (await db.collection(COL.venueReviews).findOne({ id })) as unknown as VenueReview | null;
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.collection(COL.venueReviews).deleteOne({ id });
  const summary = await reaggregateProviderReviews(db, row.providerId);
  return NextResponse.json({ ok: true, providerId: row.providerId, summary });
}
