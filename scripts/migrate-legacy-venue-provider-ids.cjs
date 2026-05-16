#!/usr/bin/env node
/**
 * Rename venue provider ids whose district suffix does not match catalog borough.
 *
 * Usage:
 *   node -r ./scripts/load-env.cjs scripts/migrate-legacy-venue-provider-ids.cjs
 *   node -r ./scripts/load-env.cjs scripts/migrate-legacy-venue-provider-ids.cjs --write --ingest
 *   node -r ./scripts/load-env.cjs scripts/migrate-legacy-venue-provider-ids.cjs --dry-run --ingest
 */

require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { computeProviderIdRenames, remapVenueIds } = require("./lib/provider-id-district.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");

async function fetchJson(url) {
  const res = await fetch(url);
  const body = await res.json();
  return { status: res.status, body };
}

function stripMongo(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const { _id, menuTags, ...rest } = doc;
  return rest;
}

function needsRemap(ids, renames) {
  return Array.isArray(ids) && ids.some((id) => renames[id]);
}

async function buildPayload() {
  const { body: providersRaw } = await fetchJson(`${BASE}/api/public/providers`);
  const { body: eventsRaw } = await fetchJson(`${BASE}/api/public/events`);
  const { body: meetupsRaw } = await fetchJson(`${BASE}/api/public/meetup-groups`);

  const providers = Array.isArray(providersRaw) ? providersRaw : providersRaw.providers || [];
  const events = Array.isArray(eventsRaw) ? eventsRaw : eventsRaw.events || [];
  const meetups = Array.isArray(meetupsRaw) ? meetupsRaw : meetupsRaw.meetupGroups || [];

  const RENAME = computeProviderIdRenames(providers);
  const pending = Object.entries(RENAME).filter(([oldId]) => providers.some((p) => p.id === oldId));

  if (pending.length === 0) {
    console.log("No provider id / borough mismatches in live catalog.");
    return null;
  }

  console.log("Renames:", pending.map(([a, b]) => `${a} → ${b}`).join("\n  "));

  const operations = [];

  for (const [oldId, newId] of pending) {
    const cur = providers.find((p) => p.id === oldId);
    if (!cur) continue;
    if (providers.some((p) => p.id === newId)) {
      console.warn(`Target id already exists — skip upsert, will patch links: ${newId}`);
    } else {
      operations.push({
        resource: "provider",
        action: "upsert",
        document: { ...stripMongo(cur), id: newId },
      });
    }
  }

  for (const ev of events) {
    if (!needsRemap(ev.venueIds, RENAME)) continue;
    operations.push({
      resource: "event",
      action: "patch",
      id: ev.id,
      patch: { venueIds: remapVenueIds(ev.venueIds, RENAME) },
    });
  }

  for (const mg of meetups) {
    if (!needsRemap(mg.venueIds, RENAME)) continue;
    operations.push({
      resource: "meetupGroup",
      action: "patch",
      id: mg.id,
      patch: { venueIds: remapVenueIds(mg.venueIds, RENAME) },
    });
  }

  for (const [oldId] of pending) {
    operations.push({ resource: "provider", action: "delete", id: oldId });
  }

  return {
    sourceUrls: ["https://www.budapestpark.hu/en/park"],
    notes: `Auto-fix provider id district suffixes (${pending.length} venues).`,
    missingOrUncertain: [],
    operations,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const write = process.argv.includes("--write");
  const ingest = process.argv.includes("--ingest");

  const payload = await buildPayload();
  if (!payload) return;

  const outPath = path.join(__dirname, "ingest-payloads/migrate-legacy-venue-provider-ids.json");
  const upserts = payload.operations.filter((o) => o.resource === "provider" && o.action === "upsert").length;
  const eventPatches = payload.operations.filter((o) => o.resource === "event").length;
  const meetupPatches = payload.operations.filter((o) => o.resource === "meetupGroup").length;
  const deletes = payload.operations.filter((o) => o.action === "delete").length;

  console.log(
    `Operations: ${payload.operations.length} (${upserts} upserts, ${eventPatches} event patches, ${meetupPatches} meetup patches, ${deletes} deletes)`,
  );

  if (write || ingest) {
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Wrote ${outPath}`);
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }

  if (dryRun && ingest) {
    execSync(`npm run ingest:listing -- --dry-run "${outPath}"`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    return;
  }

  if (ingest) {
    execSync(`npm run ingest:listing -- --force "${outPath}"`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
