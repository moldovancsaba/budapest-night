import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import type { Provider } from "@/types/provider";
import { validateProviderImages } from "@/lib/imgbbUrl";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const rows = await db.collection(COL.providers).find({}).toArray();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = (await req.json()) as Provider & { _id?: unknown };
  const { _id, ...doc } = body;
  if (!doc.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const imgErr = validateProviderImages(doc);
  if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });
  await db.collection(COL.providers).replaceOne({ id: doc.id }, doc, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const body = (await req.json()) as Partial<Provider> & { id: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const { id, ...patch } = body;
  const cur = (await db.collection(COL.providers).findOne({ id })) as unknown as Provider | null;
  const merged: Partial<Provider> = { ...(cur ?? {}), ...patch };
  const imgErr = validateProviderImages(merged);
  if (imgErr) return NextResponse.json({ error: imgErr }, { status: 400 });
  await db.collection(COL.providers).updateOne({ id }, { $set: patch });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query required" }, { status: 400 });
  await db.collection(COL.providers).deleteOne({ id });
  return NextResponse.json({ ok: true });
}
