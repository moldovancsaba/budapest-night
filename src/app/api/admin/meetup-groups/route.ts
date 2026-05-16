import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import type { MeetupGroup } from "@/types/meetup";
import { validateMeetupCover } from "@/lib/imgbbUrl";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  return NextResponse.json(await db.collection(COL.meetupGroups).find({}).toArray());
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = (await req.json()) as MeetupGroup & { _id?: unknown };
  const { _id, ...doc } = body as MeetupGroup & { _id?: unknown };
  if (!doc.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const imgErr = validateMeetupCover(doc);
  if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });
  await db.collection(COL.meetupGroups).replaceOne({ id: doc.id }, doc, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = (await req.json()) as Partial<MeetupGroup> & { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { id, ...patch } = body;
  const cur = (await db.collection(COL.meetupGroups).findOne({ id })) as unknown as MeetupGroup | null;
  const merged: Partial<MeetupGroup> = { ...(cur ?? {}), ...patch };
  const imgErr = validateMeetupCover(merged);
  if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });
  await db.collection(COL.meetupGroups).updateOne({ id }, { $set: patch });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  await db.collection(COL.meetupGroups).deleteOne({ id });
  return NextResponse.json({ ok: true });
}
