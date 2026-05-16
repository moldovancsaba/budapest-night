/**
 * Seed MongoDB with borough/neighborhood reference rows, site defaults, and brain defaults.
 * Run from repo root: npm run db:seed
 *
 * Does **not** insert demo providers or meet-up groups — add real listings via /admin or `npm run ingest:listing`.
 */
import { config as loadEnv } from "dotenv";
import path from "node:path";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });
import { MongoClient } from "mongodb";
import { NEIGHBORHOODS, BOROUGHS } from "../src/data/locations";
import { DEFAULT_SITE, DEFAULT_BRAIN } from "../src/types/site";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB ?? "classscout";

/** Shared ClassScout production DB — never wipe from Budapest Night (or other forks). */
const PROTECTED_DBS = new Set(["classscoutcluster", "classscout"]);

async function main() {
  if (PROTECTED_DBS.has(dbName) && process.env.ALLOW_SEED_PROTECTED_DB !== "true") {
    console.error(
      `Refusing to seed protected database "${dbName}".\n` +
        `ClassScout data must stay intact. Set MONGODB_DB to a dedicated name (e.g. budapest-night) in .env.local,\n` +
        `or pass ALLOW_SEED_PROTECTED_DB=true only when you intentionally reset ClassScout.`,
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  await db.collection("providers").deleteMany({});
  await db.collection("meetupGroups").deleteMany({});

  const locs = BOROUGHS.map((borough) => ({ borough, neighborhoods: NEIGHBORHOODS[borough] }));
  await db.collection("locations").deleteMany({});
  await db.collection("locations").insertMany(locs);

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

  console.log("Seed complete: cleared providers and meetup groups; seeded borough locations + site + brain defaults.");
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
