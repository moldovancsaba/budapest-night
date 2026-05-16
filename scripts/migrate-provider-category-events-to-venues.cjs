#!/usr/bin/env node
/**
 * One-time migration: provider.category "Events" → "Venues" (physical places, not timed happenings).
 * Run: node -r ./scripts/load-env.cjs scripts/migrate-provider-category-events-to-venues.cjs
 */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI required");
    process.exit(1);
  }
  const dbName = process.env.MONGODB_DB ?? "budapest-night";
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const r = await db.collection("providers").updateMany({ category: "Events" }, { $set: { category: "Venues" } });
  console.log(`Updated ${r.modifiedCount} providers Events → Venues`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
