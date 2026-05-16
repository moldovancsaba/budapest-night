/**
 * Recompute provider.menuTags from menu + eventOfferings; clear tags when no menu items.
 * Run: npx tsx scripts/recompute-menu-tags.ts
 */
import { config as loadEnv } from "dotenv";
import { MongoClient } from "mongodb";
import { applyMenuToProvider } from "../src/lib/menu/applyMenuToProvider";
import { providerHasPublishedMenuItems } from "../src/lib/menu/effectiveMenuTags";
import type { Provider } from "../src/types/provider";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI required");
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "budapest-night");
  const col = db.collection<Provider>("providers");
  const providers = await col.find({}).toArray();

  let updated = 0;
  let cleared = 0;
  for (const p of providers) {
    const next = applyMenuToProvider(p);
    const hasMenu = providerHasPublishedMenuItems(next);
    const tags = hasMenu ? (next.menuTags ?? []) : [];
    const prev = JSON.stringify(p.menuTags ?? []);
    const now = JSON.stringify(tags);
    if (prev !== now) {
      await col.updateOne(
        { id: p.id },
        hasMenu ? { $set: { menuTags: tags } } : { $unset: { menuTags: "" } },
      );
      if (hasMenu) updated++;
      else cleared++;
    }
  }

  const withMenu = await col.countDocuments({ "menu.sections.0.items.0": { $exists: true } });
  console.log(`Done. recomputed tags: ${updated} with menu, cleared orphan tags: ${cleared}`);
  console.log(`Providers with menu items: ${withMenu}`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
