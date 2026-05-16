#!/usr/bin/env node
/**
 * Build ingest payload to add hu/es/it/he/ar locales for all Events providers in production.
 * Usage: node scripts/generate-events-locale-patch.cjs
 */
const fs = require("fs");
const path = require("path");
const { LOCALES_BY_ID } = require("./data/events-locale-translations.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "ingest-payloads/events-locale-patch.json");

const A38_PATH = path.join(__dirname, "ingest-payloads/budapest-a38.json");

function stripLocaleActivityTypes(locales) {
  const out = {};
  for (const [code, block] of Object.entries(locales || {})) {
    const { activityTypes: _drop, ...rest } = block;
    out[code] = rest;
  }
  return out;
}

function ensureEnglishSources(doc) {
  const long = doc.longDescription || "";
  if (/Sources:\s*https?:\/\//i.test(long)) return long;
  const src = doc.website?.trim() || "https://budapest-night.vercel.app";
  return `${long.trim()}\n\nSources: ${src}`;
}

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const events = providers.filter((p) => p.category === "Events");

  const a38Payload = JSON.parse(fs.readFileSync(A38_PATH, "utf8"));
  const a38Locales = stripLocaleActivityTypes(
    a38Payload.operations[0].document.locales,
  );

  const operations = [];
  const missing = [];

  for (const p of events) {
    let locales;
    if (p.id === "prov-a38-ferencvaros") {
      locales = a38Locales;
    } else {
      locales = LOCALES_BY_ID[p.id];
    }
    if (!locales) {
      missing.push(p.id);
      continue;
    }

    const document = {
      ...p,
      longDescription: ensureEnglishSources(p),
      locales: stripLocaleActivityTypes(locales),
    };
    delete document._id;
    operations.push({ resource: "provider", action: "upsert", document });
  }

  if (missing.length) {
    console.error("Missing translations for:", missing.join(", "));
    process.exit(1);
  }

  const payload = {
    sourceUrls: [
      "https://a38.hu/en/",
      "https://operett.hu/en",
      "https://www.rudasfurdo.hu/en",
      "https://www.budapestpark.hu/en/park",
      "https://en.mng.hu/",
      "https://akvariumklub.hu/",
      "https://fono.hu/",
      "https://trafo.hu/",
      "https://www.opera.hu/",
      "https://momkult.hu/",
      "https://www.barbanegra.hu/",
      "https://kulturkozpont.hu/",
      "https://www.mupa.hu/en",
    ],
    notes: "Locale patch for all Events providers: hu, es, it, he, ar + English Sources line on A38.",
    missingOrUncertain: [],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
