#!/usr/bin/env node
/**
 * Audit provider + event locations against postal codes and canonical venue registry.
 * Writes scripts/ingest-payloads/venue-location-fix.json for `npm run ingest:listing -- --force`.
 *
 * Usage:
 *   node scripts/fix-venue-locations.cjs
 *   node scripts/fix-venue-locations.cjs --ingest
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const {
  suggestProviderLocation,
  locationNeedsFix,
  applyLocationToProvider,
  syncEventFromHost,
} = require("./lib/budapest-location.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "ingest-payloads/venue-location-fix.json");
const doIngest = process.argv.includes("--ingest");

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

function cleanProviderDoc(p) {
  const document = { ...p };
  delete document._id;
  delete document.menuTags;
  return document;
}

function cleanEventDoc(e) {
  const document = { ...e };
  delete document._id;
  return document;
}

async function main() {
  const [providers, events] = await Promise.all([
    fetchJson(`${BASE}/api/public/providers`),
    fetchJson(`${BASE}/api/public/events`).catch(() => []),
  ]);

  const providerById = new Map();
  const operations = [];
  const fixed = [];

  for (const p of providers) {
    if (!locationNeedsFix(p)) {
      providerById.set(p.id, p);
      continue;
    }
    const loc = suggestProviderLocation(p);
    if (!loc) {
      providerById.set(p.id, p);
      continue;
    }
    const document = cleanProviderDoc(applyLocationToProvider(p, loc));
    providerById.set(p.id, document);
    operations.push({ resource: "provider", action: "upsert", document });
    fixed.push({
      id: p.id,
      name: p.name,
      from: `${p.neighborhood}, ${p.borough} — ${p.address}`,
      to: `${document.neighborhood}, ${document.borough} — ${document.address}`,
    });
  }

  for (const ev of events) {
    const host = providerById.get(ev.venueIds?.[0]);
    if (!host) continue;
    const synced = syncEventFromHost(ev, host);
    if (synced.borough === ev.borough && synced.neighborhood === ev.neighborhood) continue;
    const document = cleanEventDoc({ ...ev, ...synced });
    operations.push({ resource: "event", action: "upsert", document });
    fixed.push({
      id: ev.id,
      name: ev.title,
      from: `${ev.neighborhood}, ${ev.borough}`,
      to: `${synced.neighborhood}, ${synced.borough}`,
    });
  }

  if (!operations.length) {
    console.log("No location fixes needed.");
    return;
  }

  const payload = {
    sourceUrls: ["https://mvm-dome.hu", "https://www.budapestpark.hu/en/park"],
    notes:
      "Correct borough/neighborhood/address from postal codes and canonical venue registry (e.g. MVM Dome → Stefánia út, Terézváros, not Kelenföld).",
    missingOrUncertain: [
      "Some listings use coarse district buckets; always verify address on the official venue site.",
    ],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
  for (const f of fixed) {
    console.log(` - ${f.id} (${f.name})`);
    console.log(`   ${f.from}`);
    console.log(`   → ${f.to}`);
  }

  if (doIngest) {
    const r = spawnSync("npm", ["run", "ingest:listing", "--", "--force", OUT], {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    process.exit(r.status ?? 1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
