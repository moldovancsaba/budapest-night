#!/usr/bin/env node
/**
 * Print menu coverage for Restaurants / Cafés / Parties.
 * Usage: node scripts/menu-batch-status.cjs
 */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");

const MENU_CATEGORIES = ["Restaurants", "Cafés", "Parties"];
const dbName = process.env.MONGODB_DB || "budapest-night";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db(dbName).collection("providers");

  const all = await col
    .find({ category: { $in: MENU_CATEGORIES } }, { projection: { id: 1, name: 1, category: 1, menu: 1 } })
    .sort({ category: 1, name: 1 })
    .toArray();

  const withMenu = all.filter((p) => (p.menu?.sections?.length ?? 0) > 0);
  const missing = all.filter((p) => !(p.menu?.sections?.length ?? 0));

  console.log(`Database: ${dbName}`);
  console.log(`Eat/drink providers: ${all.length}`);
  console.log(`With menu.sections: ${withMenu.length}`);
  console.log(`missing_menu: ${missing.length}`);
  console.log("");
  console.log("Sample missing (first 15):");
  for (const p of missing.slice(0, 15)) {
    console.log(`  ${p.id}  (${p.category})  ${p.name}`);
  }
  if (missing.length > 15) console.log(`  … and ${missing.length - 15} more`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
