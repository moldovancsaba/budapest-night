#!/usr/bin/env node
/**
 * Build ingest payload for providers missing hu/es/it/he/ar locales.
 * Usage: node scripts/generate-catalog-locale-patch.cjs
 */
const fs = require("fs");
const path = require("path");
const { LOCALES_BY_ID } = require("./data/catalog-locale-translations.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "ingest-payloads/catalog-locale-patch.json");
const REQUIRED = ["hu", "es", "it", "he", "ar"];

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

function needsLocalePatch(p) {
  if (!/Sources:\s*https?:\/\//i.test(p.longDescription || "")) return true;
  for (const code of REQUIRED) {
    const b = p.locales?.[code];
    if (!b?.name?.trim() || !b?.slug?.trim()) return true;
    if (!/Sources:\s*https?:\/\//i.test(b.longDescription || "")) return true;
  }
  return false;
}

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const targets = providers.filter(needsLocalePatch);

  const operations = [];
  const missing = [];

  for (const p of targets) {
    const locales = LOCALES_BY_ID[p.id];
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

  if (!operations.length) {
    console.log("No providers need locale patch.");
    process.exit(0);
  }

  const payload = {
    sourceUrls: [...new Set(operations.map((o) => o.document.website).filter(Boolean))],
    notes: `Locale patch for ${operations.length} providers (Parties, Restaurants, Cafés): hu, es, it, he, ar.`,
    missingOrUncertain: [],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
  for (const o of operations) console.log(" -", o.document.id, `(${o.document.category})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
