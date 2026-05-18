import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import type { PromotionDoc } from "@/types/promotion";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json([]);
  const rows = await db
    .collection(COL.promotions)
    .find({})
    .sort({ startsAt: -1 })
    .toArray();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const body = (await req.json()) as Omit<PromotionDoc, "_id">;
  const doc: PromotionDoc = {
    _id: randomUUID(),
    type: body.type,
    targetId: body.targetId,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    label: body.label,
    priority: body.priority ?? 0,
    locales: body.locales,
    internalNotes: body.internalNotes,
    contractRef: body.contractRef,
    verticalSlug: body.verticalSlug,
  };

  await db.collection(COL.promotions).insertOne(doc as Record<string, unknown>);
  return NextResponse.json({ ok: true, id: doc._id });
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.collection(COL.promotions).deleteOne({ _id: id } as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}
