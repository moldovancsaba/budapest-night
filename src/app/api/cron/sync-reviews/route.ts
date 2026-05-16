import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  reviewsSyncEnabled,
  runReviewsSyncBatch,
} from "@/lib/reviews/syncProviderReviews";
import { timingSafeStringEqual } from "@/lib/timingSafeStringEqual";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization")?.trim() ?? "";
  const x = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  return x.length > 0 && timingSafeStringEqual(secret, x);
}

/**
 * Sync provider rating/reviewCount from OpenStreetMap + Wikidata (weekly cron).
 *
 * Env:
 *   REVIEWS_SYNC_ENABLED=true
 *   OSM_CONTACT_EMAIL — recommended for Nominatim policy (contact in User-Agent)
 *   CRON_SECRET — same as curator cron
 */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!reviewsSyncEnabled()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "REVIEWS_SYNC_ENABLED is not true",
    });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "No database" }, { status: 503 });
  }

  const url = new URL(req.url);
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit") || 15)));
  const force = url.searchParams.get("force") === "1";
  const providerId = url.searchParams.get("providerId")?.trim() || undefined;

  try {
    const result = await runReviewsSyncBatch(db, { limit, force, providerId });
    return NextResponse.json({ ok: result.ok, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
