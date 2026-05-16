/**
 * Recompute venueLinks + district fields for all timed events from live providers.
 * Run: npm run db:backfill-event-venue-links
 */
import { getDb, COL } from "../src/lib/mongodb";
import { resolveProviderLocation } from "../src/lib/budapestLocation";
import { prepareNightEventWithVenues } from "../src/lib/eventVenueLink";
import type { NightEvent } from "../src/types/event";
import type { Provider } from "../src/types/provider";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("No database — set MONGODB_URI");
    process.exit(1);
  }

  const rows = (await db.collection(COL.events).find({}).toArray()) as unknown as NightEvent[];
  let updated = 0;
  let skipped = 0;

  for (const ev of rows) {
    const hosts: Provider[] = [];
    let err: string | null = null;
    for (const id of ev.venueIds) {
      const raw = (await db.collection(COL.providers).findOne({ id })) as unknown as Provider | null;
      if (!raw) {
        err = `unknown venueId ${id}`;
        break;
      }
      hosts.push({ ...raw, ...resolveProviderLocation(raw) });
    }
    if (err || hosts.length !== ev.venueIds.length) {
      console.warn(`Skip ${ev.id}: ${err ?? "missing hosts"}`);
      skipped++;
      continue;
    }
    const stored = prepareNightEventWithVenues(ev, hosts);
    await db.collection(COL.events).replaceOne({ id: ev.id }, stored);
    updated++;
  }

  console.log(`Done. updated=${updated} skipped=${skipped} total=${rows.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
