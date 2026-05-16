/**
 * Apply scripts/ingest-payloads/seed-timed-events-moby-sting.json directly to MongoDB.
 * Use when production /api/ingest does not yet support event/* ops.
 *
 * Run: npx tsx -r ./scripts/load-env.cjs scripts/seed-timed-events.ts
 */
import { config as loadEnv } from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { MongoClient } from "mongodb";
import { applyIngestOperation } from "../src/lib/ingestOperations";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "budapest-night";
if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const payloadPath = path.join(
  process.cwd(),
  "scripts/ingest-payloads/seed-timed-events-moby-sting.json",
);

async function main() {
  const raw = fs.readFileSync(payloadPath, "utf8");
  const j = JSON.parse(raw) as { operations?: unknown[] };
  const ops = Array.isArray(j.operations) ? j.operations : [j];

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < ops.length; i++) {
    const res = await applyIngestOperation(db, ops[i]);
    if (!res.ok) {
      console.error(`FAIL op[${i}]:`, res.error);
      fail++;
    } else {
      console.log(`OK op[${i}]:`, res.id ?? "(no id)");
      ok++;
    }
  }

  const events = await db.collection("events").countDocuments();
  console.log(`\nDone: ${ok} ok, ${fail} failed. events collection count=${events}`);
  await client.close();
  if (fail > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
