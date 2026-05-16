/**
 * Overwrite Mongo `site` + `brainSettings` copy from DEFAULT_* (does not touch listings).
 * Run: npm run db:patch-copy
 */
import { config as loadEnv } from "dotenv";
import path from "node:path";
import { MongoClient } from "mongodb";
import { DEFAULT_SITE, DEFAULT_BRAIN } from "../src/types/site";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB ?? "budapest-night";
  if (!uri) throw new Error("Missing MONGODB_URI");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await db.collection("site").updateOne(
    { _id: "main" },
    { $set: { _id: "main", ...DEFAULT_SITE } },
    { upsert: true },
  );
  await db.collection("brainSettings").updateOne(
    { _id: "main" },
    { $set: { _id: "main", ...DEFAULT_BRAIN } },
    { upsert: true },
  );
  console.log("Patched site + brain copy from DEFAULT_SITE / DEFAULT_BRAIN");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
