import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { archiveFinishedEvents } from "@/lib/eventsArchive";
import { timingSafeStringEqual } from "@/lib/timingSafeStringEqual";

export const dynamic = "force-dynamic";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV === "development";
  const auth = req.headers.get("authorization")?.trim() ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  return token.length > 0 && timingSafeStringEqual(secret, token);
}

/** Hourly: move past scheduled events to `archived`. */
export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const { archived } = await archiveFinishedEvents(db);
  return NextResponse.json({ ok: true, archived });
}
