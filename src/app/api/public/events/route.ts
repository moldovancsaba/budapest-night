import { NextRequest, NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { parseAppLocaleParam, resolveEventsForLocale } from "@/lib/eventLocale";
import { isUpcoming } from "@/lib/eventDisplay";
import type { NightEvent } from "@/types/event";

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

  const rows = (await db.collection(COL.events).find({}).toArray()) as unknown as (NightEvent & {
    _id?: unknown;
  })[];
  let events = resolveEventsForLocale(rows.map(stripId), locale);
  if (upcomingOnly) events = events.filter((e) => isUpcoming(e) && e.status === "scheduled");
  if (borough) events = events.filter((e) => e.borough === borough);
  events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  return NextResponse.json(events);
}
