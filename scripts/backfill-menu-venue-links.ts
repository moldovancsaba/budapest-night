/**
 * Recompute menu.venueLink for all providers with published menu sections.
 * Run: npm run db:backfill-menu-venue-links
 */
import { getDb, COL } from "../src/lib/mongodb";
import { resolveProviderLocation } from "../src/lib/budapestLocation";
import { enrichProviderMenuVenueLink } from "../src/lib/menu/menuVenueLink";
import type { Provider } from "../src/types/provider";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("No database — set MONGODB_URI");
    process.exit(1);
  }

  const rows = (await db.collection(COL.providers).find({}).toArray()) as unknown as Provider[];
  let updated = 0;

  for (const raw of rows) {
    if (!(raw.menu?.sections?.length ?? 0)) continue;
    const located = { ...raw, ...resolveProviderLocation(raw) };
    const stored = enrichProviderMenuVenueLink(located);
    await db.collection(COL.providers).updateOne(
      { id: raw.id },
      { $set: { menu: stored.menu, menuTags: stored.menuTags } },
    );
    updated++;
  }

  console.log(`Done. menu venueLink updated=${updated} of ${rows.length} providers`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
