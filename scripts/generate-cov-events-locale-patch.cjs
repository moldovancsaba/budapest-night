#!/usr/bin/env node
/**
 * Fix prov-cov-* Events where locales mirror English (buildProviderLocales).
 * Usage: node scripts/generate-cov-events-locale-patch.cjs
 */
const fs = require("fs");
const path = require("path");
const { COV_EVENT_I18N } = require("./data/cov-events-i18n.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "ingest-payloads/cov-events-locale-patch.json");
const REQUIRED = ["hu", "es", "it", "he", "ar"];

function slugFromId(id, code) {
  const base = String(id).replace(/^prov-cov-/, "").replace(/^prov-/, "");
  return `${base}-${code}`.slice(0, 60);
}

function isMirrored(p) {
  if (!p.id.startsWith("prov-cov-")) return false;
  for (const code of REQUIRED) {
    const b = p.locales?.[code];
    const short = b?.shortDescription ?? b?.short;
    if (!short?.trim()) return true;
    if (short === p.shortDescription) return true;
  }
  const huShort = p.locales?.hu?.shortDescription ?? p.locales?.hu?.short ?? "";
  if (/Tortenelmi|Orszaghaz|szazad|Latogatokozpont|tortenelmi|kozeleben/i.test(huShort)) return true;
  return false;
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
      slug: t.slug || slugFromId(p.id, code),
    };
  }
  return locales;
}

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const forceAll = process.argv.includes("--all-cov");
  const targets = providers.filter(
    (p) =>
      p.category === "Events" &&
      p.id.startsWith("prov-cov-") &&
      COV_EVENT_I18N[p.id] &&
      (forceAll || isMirrored(p)),
  );

  const operations = [];
  const missing = [];

  for (const p of targets) {
    const i18n = COV_EVENT_I18N[p.id];
    if (!i18n) {
      missing.push(p.id);
      continue;
    }
    const document = { ...p, locales: buildLocales(p, i18n) };
    delete document._id;
    operations.push({ resource: "provider", action: "upsert", document });
  }

  if (missing.length) {
    console.error("Missing i18n for:", missing.join(", "));
    process.exit(1);
  }
  if (!operations.length) {
    console.log("No mirrored cov Events to fix.");
    process.exit(0);
  }

  const payload = {
    sourceUrls: [...new Set(operations.map((o) => o.document.website).filter(Boolean))],
    notes: `Real translations for ${operations.length} coverage Events (prov-cov-*) replacing English-mirrored locales.`,
    missingOrUncertain: [],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
  for (const o of operations) console.log(" -", o.document.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
