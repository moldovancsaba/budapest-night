import { NextRequest, NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { parseAppLocaleParam, resolveEventsForLocale } from "@/lib/eventLocale";
import { isUpcoming } from "@/lib/eventDisplay";
import { toPublicNightEvent } from "@/lib/publicEvent";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

function stripId<T extends object>(doc: T): T {
  const o = { ...doc } as Record<string, unknown>;
  delete o._id;
  return o as T;
}

export async function GET(req: NextRequest) {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured (MONGODB_URI)" }, { status: 503 });
  }
  const locale = parseAppLocaleParam(req.nextUrl.searchParams.get("locale"));
  const upcomingOnly = req.nextUrl.searchParams.get("upcoming") !== "0";
  const borough = req.nextUrl.searchParams.get("borough");

  const [rows, providerRows] = await Promise.all([
    db.collection(COL.events).find({}).toArray(),
    db.collection(COL.providers).find({}).toArray(),
  ]);
  const eventsRaw = (rows as unknown as (NightEvent & { _id?: unknown })[]).map(stripId);
  const providersById = new Map(
    (providerRows as unknown as Provider[]).map((p) => [
      p.id,
      { ...p, ...resolveProviderLocation(p) },
    ]),
  );

  let events = resolveEventsForLocale(eventsRaw, locale);
  if (upcomingOnly) events = events.filter((e) => isUpcoming(e) && e.status === "scheduled");
  if (borough) events = events.filter((e) => e.borough === borough);
  events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return NextResponse.json(events.map((e) => toPublicNightEvent(e, providersById)));
}
