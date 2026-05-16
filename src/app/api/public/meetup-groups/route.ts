import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import { toPublicMeetupGroup } from "@/lib/publicMeetup";
import type { MeetupGroup } from "@/types/meetup";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

function stripId<T extends object>(doc: T): T {
  const o = { ...doc } as Record<string, unknown>;
  delete o._id;
  return o as T;
}

export async function GET() {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured (MONGODB_URI)" }, { status: 503 });
  }

  const [groupRows, providerRows, eventRows] = await Promise.all([
    db.collection(COL.meetupGroups).find({}).toArray(),
    db.collection(COL.providers).find({}).toArray(),
    db.collection(COL.events).find({}).toArray(),
  ]);

  const groups = (groupRows as unknown as (MeetupGroup & { _id?: unknown })[]).map(stripId);
  const providersById = new Map(
    (providerRows as unknown as Provider[]).map((p) => [p.id, { ...p, ...resolveProviderLocation(p) }]),
  );
  const eventsById = new Map((eventRows as unknown as NightEvent[]).map((e) => [e.id, e]));

  return NextResponse.json(groups.map((g) => toPublicMeetupGroup(g, providersById, eventsById)));
}
