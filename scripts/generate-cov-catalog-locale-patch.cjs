#!/usr/bin/env node
/**
 * Fix prov-cov-* Parties/Restaurants/Cafés with mirrored English locales.
 * Usage: node scripts/generate-cov-catalog-locale-patch.cjs
 */
const fs = require("fs");
const path = require("path");
const { COV_CATALOG_I18N } = require("./data/cov-catalog-i18n.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "ingest-payloads/cov-catalog-locale-patch.json");
const REQUIRED = ["hu", "es", "it", "he", "ar"];
const CATEGORIES = ["Parties", "Restaurants", "Cafés"];

function isMirrored(p) {
  if (!p.id.startsWith("prov-cov-")) return false;
  if (!CATEGORIES.includes(p.category)) return false;
  return REQUIRED.every((code) => {
    const short = p.locales?.[code]?.shortDescription ?? "";
    return short.trim() === (p.shortDescription || "").trim();
  });
}

function buildLocales(p, i18n) {
  const sources =
    (p.longDescription.match(/Sources:\s*([\s\S]*)$/i) || [])[1]?.trim() ||
    p.website ||
    "";
  const sourcesLine = sources.startsWith("http")
    ? `Sources: ${sources}`
    : `Sources: ${p.website || "https://budapest-night.vercel.app"}`;

  const locales = {};
  for (const code of REQUIRED) {
    const t = i18n[code];
    const long =
      typeof t.long === "string" && t.long.includes("Sources:")
        ? t.long
        : `${t.long.trim()}\n\n${sourcesLine}`;
    locales[code] = {
      name: t.name,
      shortDescription: t.short,
      longDescription: long,
      slug: t.slug,
    };
  }
  return locales;
}

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const targets = providers.filter(
    (p) => p.id.startsWith("prov-cov-") && CATEGORIES.includes(p.category) && COV_CATALOG_I18N[p.id],
  );

  const operations = [];
  const missing = [];

  for (const p of targets) {
    const i18n = COV_CATALOG_I18N[p.id];
    if (!i18n) {
      missing.push(p.id);
      continue;
    }
    const document = { ...p, locales: buildLocales(p, i18n) };
    delete document._id;
    delete document.menuTags;

    if (p.id === "prov-cov-operetta-andrassy" && document.locales.it) {
      document.locales.it.slug = "operetta-andrassy-it";
    }

    operations.push({ resource: "provider", action: "upsert", document });
  }

  const mirroredLeft = providers.filter(isMirrored);
  if (missing.length) {
    console.error("Missing i18n for:", missing.join(", "));
    process.exit(1);
  }
  if (!operations.length) {
    console.log("No cov catalog providers to patch.");
    process.exit(0);
  }

  const payload = {
    sourceUrls: [...new Set(operations.map((o) => o.document.website).filter(Boolean))],
    notes: `Real translations for ${operations.length} coverage Parties/Restaurants/Cafés (prov-cov-*).`,
    missingOrUncertain: mirroredLeft.length
      ? [`${mirroredLeft.length} mirrored providers still lack i18n entries`]
      : [],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
  if (mirroredLeft.length) {
    console.warn(`Warning: ${mirroredLeft.length} mirrored providers not in patch:`);
    for (const p of mirroredLeft.slice(0, 10)) console.warn(" -", p.id);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
