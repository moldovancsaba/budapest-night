import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { getActivePromotions, featuredVenueIds, featuredEventIds } from "@/lib/promotionsDb";
import { timingSafeStringEqual } from "@/lib/timingSafeStringEqual";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";

export const dynamic = "force-dynamic";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = req.headers.get("authorization")?.trim() ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  return token.length > 0 && timingSafeStringEqual(secret, token);
}

/** Hourly: strip stale Featured badges when no active promotion covers the listing. */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const promos = await getActivePromotions(db);
  const featuredProviders = featuredVenueIds(promos);
  const featuredEvents = featuredEventIds(promos);

  let providersCleared = 0;
  let eventsCleared = 0;

  const providerRows = (await db
    .collection(COL.providers)
    .find({ badges: { $in: ["Featured"] } })
    .project({ id: 1, badges: 1 })
    .toArray()) as unknown as Pick<Provider, "id" | "badges">[];

  for (const p of providerRows) {
    if (featuredProviders.has(p.id)) continue;
    const next = (p.badges ?? []).filter((b) => b !== "Featured");
    if (next.length === (p.badges ?? []).length) continue;
    await db.collection(COL.providers).updateOne({ id: p.id }, { $set: { badges: next } });
    providersCleared++;
  }

  const eventRows = (await db
    .collection(COL.events)
    .find({ badges: { $in: ["Featured"] } })
    .project({ id: 1, badges: 1 })
    .toArray()) as unknown as Pick<NightEvent, "id" | "badges">[];

  for (const e of eventRows) {
    if (featuredEvents.has(e.id)) continue;
    const next = (e.badges ?? []).filter((b) => b !== "Featured");
    if (next.length === (e.badges ?? []).length) continue;
    await db.collection(COL.events).updateOne({ id: e.id }, { $set: { badges: next } });
    eventsCleared++;
  }

  return NextResponse.json({
    ok: true,
    providersCleared,
    eventsCleared,
    activePromotions: promos.length,
  });
}
