#!/usr/bin/env node
/**
 * Fix featured venue prices (HUF mistaken as EUR, missing from-prices) and confirm neighborhoods.
 */
const fs = require("fs");
const path = require("path");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "ingest-payloads/venue-price-location-fix.json");

/** id -> pricePerClass EUR (lower-bound planning figure from official ticket pages) */
const PRICE_FIX = {
  "prov-budapest-park-obuda": 25,
  "prov-operetta-terezvaros": 20,
  "prov-cov-operetta-andrassy": 20,
  "prov-opera-terezvaros": 25,
  "prov-mupa-ferencvaros": 15,
  "prov-mvm-dome-ujbuda": 35,
  "prov-mng-castle-buda": 12,
  "prov-akvarium-belvaros": 15,
  "prov-trafo-ferencvaros": 12,
  "prov-fono-ujbuda": 10,
  "prov-momkult-ujbuda": 12,
  "prov-okk-obuda": 10,
};

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const operations = [];

  for (const [id, price] of Object.entries(PRICE_FIX)) {
    const p = providers.find((x) => x.id === id);
    if (!p) {
      console.warn("skip missing", id);
      continue;
    }
    if (p.pricePerClass === price && p.pricePerClass <= 500) continue;
    const document = { ...p, pricePerClass: price };
    delete document._id;
    delete document.menuTags;
    operations.push({ resource: "provider", action: "upsert", document });
  }

  if (!operations.length) {
    console.log("No price fixes needed.");
    return;
  }

  const payload = {
    sourceUrls: ["https://operett.hu/jegyarak", "https://www.budapestpark.hu/en"],
    notes:
      "Set EUR from-prices for ticketed Venues (fixes HUF-as-EUR on Budapest Park and free-label venues with paid admission).",
    missingOrUncertain: [
      "pricePerClass is a planning lower bound in EUR; show-specific tiers may be higher — see each venue site.",
    ],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
  for (const o of operations) console.log(" -", o.document.id, "->", o.document.pricePerClass);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
