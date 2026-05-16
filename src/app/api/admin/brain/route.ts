import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { DEFAULT_BRAIN, type BrainSettingsDoc } from "@/types/site";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ _id: "main", ...DEFAULT_BRAIN });
  const doc = (await db.collection(COL.brain).findOne({ _id: "main" } as never)) as unknown as BrainSettingsDoc | null;
  return NextResponse.json(doc ?? { _id: "main", ...DEFAULT_BRAIN });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const patch = (await req.json()) as Partial<Omit<BrainSettingsDoc, "_id">>;
  await db.collection(COL.brain).updateOne(
    { _id: "main" as never },
    { $set: { ...patch, _id: "main" } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
