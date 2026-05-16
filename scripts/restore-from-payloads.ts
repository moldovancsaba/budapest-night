/**
 * Re-apply all scripts/ingest-payloads/*.json to MongoDB (direct write, no HTTP).
 * Use after accidental db:seed wipe. Does not clear collections first.
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

const dir = path.join(process.cwd(), "scripts/ingest-payloads");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json") && !f.startsWith("cursor-curated-"))
  .sort();

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  let ok = 0;
  let fail = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const j = JSON.parse(raw) as { operations?: unknown[] };
    const ops = Array.isArray(j.operations) ? j.operations : [j];
    for (const op of ops) {
      const res = await applyIngestOperation(db, op);
      if (!res.ok) {
        console.error(`FAIL ${file}:`, res.error);
        fail++;
      } else ok++;
    }
    console.log(`OK ${file}`);
  }

  const providers = await db.collection("providers").countDocuments();
  const meetups = await db.collection("meetupGroups").countDocuments();
  console.log(`\nDone: ${ok} ops ok, ${fail} failed. providers=${providers} meetupGroups=${meetups}`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
