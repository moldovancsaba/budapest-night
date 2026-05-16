/**
 * Sync venue ratings from OpenStreetMap into Mongo.
 *
 *   npm run reviews:sync
 *   npm run reviews:sync -- --id prov-szimpla-kert-erzsebetvaros
 *   npm run reviews:sync -- --force --limit 5
 */
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

import { getDb } from "../src/lib/mongodb";
import {
  reviewsSyncEnabled,
  runReviewsSyncBatch,
} from "../src/lib/reviews/syncProviderReviews";

async function main() {
  const args = process.argv.slice(2);
  const idIdx = args.indexOf("--id");
  const providerId = idIdx >= 0 ? args[idIdx + 1] : undefined;
  const force = args.includes("--force");
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : 20;

  if (!reviewsSyncEnabled()) {
    console.error("Set REVIEWS_SYNC_ENABLED=true in .env (optional: OSM_CONTACT_EMAIL)");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("No database (MONGODB_URI)");
    process.exit(1);
  }

  const result = await runReviewsSyncBatch(db, { limit, force, providerId });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
