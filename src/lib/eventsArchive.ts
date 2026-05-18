import type { Db } from "mongodb";
import { COL } from "@/lib/mongodb";
import type { NightEvent } from "@/types/event";

/** True when the event has ended (uses `endsAt` ISO timestamp). */
export function isEventFinished(
  event: Pick<NightEvent, "endsAt" | "timezone">,
  now = Date.now(),
): boolean {
  return new Date(event.endsAt).getTime() < now;
}

export function isPubliclyListedEvent(
  event: Pick<NightEvent, "endsAt" | "status">,
  now = Date.now(),
): boolean {
  if (event.status === "archived") return false;
  if (event.status !== "scheduled") return false;
  return !isEventFinished(event, now);
}

/**
 * Move finished scheduled events to `archived` in Mongo.
 * Safe to call on every public catalog read and from cron.
 */
export async function archiveFinishedEvents(
  db: Db,
  now = new Date(),
): Promise<{ archived: number }> {
  const cutoff = now.toISOString();
  const r = await db.collection(COL.events).updateMany(
    {
      status: "scheduled",
      endsAt: { $lt: cutoff },
    },
    {
      $set: {
        status: "archived",
        archivedAt: cutoff,
      },
    },
  );
  return { archived: r.modifiedCount };
}
