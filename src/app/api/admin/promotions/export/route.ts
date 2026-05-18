import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import type { PromotionDoc } from "@/types/promotion";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
  const rows = (await db
    .collection(COL.promotions)
    .find({ endsAt: { $gte: cutoff } })
    .sort({ startsAt: -1 })
    .toArray()) as unknown as PromotionDoc[];

  const header = "id,type,targetId,label,startsAt,endsAt,priority,verticalSlug,contractRef";
  const lines = rows.map((r) =>
    [
      r._id,
      r.type,
      r.targetId,
      r.label,
      r.startsAt,
      r.endsAt,
      String(r.priority),
      r.verticalSlug ?? "",
      r.contractRef ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );

  const body = [header, ...lines].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pestiest-promotions.csv"`,
    },
  });
}
