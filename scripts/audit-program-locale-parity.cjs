#!/usr/bin/env node
/**
 * R8 — Program / featured locale parity audit.
 * Target: ≥90% of featured provider + event IDs have full locales.* blocks.
 *
 *   node -r ./scripts/load-env.cjs scripts/audit-program-locale-parity.cjs
 *   node -r ./scripts/load-env.cjs scripts/audit-program-locale-parity.cjs --json
 */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");

const REQUIRED_LOCALES = ["hu", "es", "it", "he", "ar"];
const TARGET_PCT = 90;

function hasFullLocales(doc, kind) {
  const locales = doc?.locales;
  if (!locales || typeof locales !== "object") return false;
  for (const code of REQUIRED_LOCALES) {
    const block = locales[code];
    if (!block || typeof block !== "object") return false;
    if (kind === "provider") {
      if (!block.name || !block.shortDescription || !block.longDescription || !block.slug) {
        return false;
      }
    } else {
      if (!block.title || !block.shortDescription || !block.longDescription || !block.slug) {
        return false;
      }
    }
  }
  return true;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI required");
    process.exit(1);
  }
  const jsonOut = process.argv.includes("--json");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "budapest-night");

  const programWeek =
    (await db.collection("programWeeks").findOne({ published: true }, { sort: { weekId: -1 } })) ??
    (await db.collection("programWeeks").find({}).sort({ weekId: -1 }).limit(1).toArray())[0];

  const now = new Date().toISOString();
  const promos = await db
    .collection("promotions")
    .find({ startsAt: { $lte: now }, endsAt: { $gte: now } })
    .toArray();

  const providerIds = new Set(programWeek?.featuredProviderIds ?? []);
  const eventIds = new Set(programWeek?.featuredEventIds ?? []);
  for (const p of promos) {
    if (p.type === "featured_venue") providerIds.add(p.targetId);
    if (p.type === "featured_event") eventIds.add(p.targetId);
  }

  const providers = providerIds.size
    ? await db.collection("providers").find({ id: { $in: [...providerIds] } }).toArray()
    : [];
  const events = eventIds.size
    ? await db.collection("events").find({ id: { $in: [...eventIds] } }).toArray()
    : [];

  const providerOk = providers.filter((p) => hasFullLocales(p, "provider")).length;
  const eventOk = events.filter((e) => hasFullLocales(e, "event")).length;
  const total = providers.length + events.length;
  const ok = providerOk + eventOk;
  const pct = total ? Math.round((ok / total) * 1000) / 10 : 100;
  const pass = pct >= TARGET_PCT;

  const missingProviders = providers
    .filter((p) => !hasFullLocales(p, "provider"))
    .map((p) => p.id);
  const missingEvents = events
    .filter((e) => !hasFullLocales(e, "event"))
    .map((e) => e.id);

  const report = {
    targetPct: TARGET_PCT,
    pass,
    pct,
    featuredProviderCount: providers.length,
    featuredEventCount: events.length,
    providersWithLocales: providerOk,
    eventsWithLocales: eventOk,
    missingProviders,
    missingEvents,
    programWeekId: programWeek?._id ?? null,
  };

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Program locale parity: ${pct}% (${ok}/${total}) — ${pass ? "PASS" : "FAIL"} (target ≥${TARGET_PCT}%)`);
    if (missingProviders.length) {
      console.log(`Providers missing locales: ${missingProviders.join(", ")}`);
    }
    if (missingEvents.length) {
      console.log(`Events missing locales: ${missingEvents.join(", ")}`);
    }
  }

  await client.close();
  process.exit(pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
