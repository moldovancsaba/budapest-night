import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { getCurrentWeekId, getWeekBounds } from "@/lib/programWeekCalendar";
import type { ProgramWeekDoc } from "@/types/programWeek";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json([]);
  const rows = await db
    .collection(COL.programWeeks)
    .find({})
    .sort({ weekId: -1 })
    .limit(24)
    .toArray();
  return NextResponse.json(rows);
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const body = (await req.json()) as Partial<ProgramWeekDoc>;
  const weekId = body.weekId ?? getCurrentWeekId();
  const bounds = getWeekBounds(weekId);

  const doc: ProgramWeekDoc = {
    _id: weekId,
    weekId,
    weekStartsAt: bounds.startsAt,
    weekEndsAt: bounds.endsAt,
    published: body.published ?? true,
    locales: body.locales ?? {
      hu: { headline: "Ez a hét Budapesten", intro: "" },
    },
    featuredEventIds: body.featuredEventIds ?? [],
    featuredProviderIds: body.featuredProviderIds ?? [],
    sponsorName: body.sponsorName,
    sponsorUrl: body.sponsorUrl,
    editorNotes: body.editorNotes,
    updatedAt: new Date().toISOString(),
  };

  await db
    .collection(COL.programWeeks)
    .replaceOne({ weekId }, doc, { upsert: true });

  return NextResponse.json({ ok: true, weekId });
}
