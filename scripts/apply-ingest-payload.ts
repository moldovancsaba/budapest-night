/**
 * Apply one ingest JSON payload directly to MongoDB (no HTTP).
 *
 * Prefer for:
 * - Menu-only `provider` `patch` (no full address on patch)
 * - Image-only patches (`patch-unique-venue-meetup-images.json`)
 * - Large batches when POST /api/ingest fails
 *
 * Full upserts with location still work; use `ingest:listing` when you want HTTP dry-run + dedupe.
 *
 *   npm run ingest:db -- scripts/ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch5.json
 *
 * See docs/catalog-curation.md
 */
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { applyIngestOperation } from "../src/lib/ingestOperations";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "budapest-night";

function loadPayload(payloadPath: string) {
  const raw = fs.readFileSync(path.resolve(payloadPath), "utf8");
  const j = JSON.parse(raw) as { operations?: unknown[]; resource?: string; action?: string };
  if (Array.isArray(j.operations) && j.operations.length) return j.operations;
  if (j.resource && j.action) return [j];
  throw new Error("Payload must have operations[] or a single { resource, action, ... }");
}

async function main() {
  const payloadPath = process.argv[2];
  if (!payloadPath) {
    console.error("Usage: npm run ingest:db -- <payload.json>");
    process.exit(1);
  }
  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  const ops = loadPayload(payloadPath);
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const batch = { providerIdsInBatch: new Set<string>(), replaceAllConfirmed: false };

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < ops.length; i++) {
    const res = await applyIngestOperation(db, ops[i], batch);
    if (!res.ok) {
      console.error(`FAIL [${i}]:`, res.error);
      fail++;
    } else {
      ok++;
    }
  }

  console.log(`\n${path.basename(payloadPath)}: ${ok} ok, ${fail} failed (${ops.length} operations)`);
  await client.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
