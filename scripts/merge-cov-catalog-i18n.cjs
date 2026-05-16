#!/usr/bin/env node
/**
 * Merge MyMemory cache + agent translation chunks into cov-catalog-i18n.cjs
 */
const fs = require("fs");
const path = require("path");
const { fixHungarianAccents } = require("./lib/fix-hungarian-accents.cjs");
const { LOCALES_BY_ID: CATALOG_LOCALES } = require("./data/catalog-locale-translations.cjs");

const OUT_CJS = path.join(__dirname, "data/cov-catalog-i18n.cjs");
const CACHE_PATH = path.join(__dirname, "data/.cov-catalog-i18n-cache.json");
const CHUNK_DIR = path.join(__dirname, "data/cov-catalog-i18n-chunks");
const REQUIRED = ["hu", "es", "it", "he", "ar"];

const REUSE_CATALOG_ID = {
  "prov-cov-gerbeaud-vaci": "prov-gerbeaud-belvaros",
  "prov-cov-mazel-tov-kiraly": "prov-mazel-tov-erzsebetvaros",
  "prov-cov-360bar-andrassy": "prov-360-bar-terezvaros",
  "prov-cov-instant-kiraly": "prov-instant-fogas-erzsebetvaros",
};

function slugFromId(id, code) {
  const base = String(id).replace(/^prov-cov-/, "").replace(/^prov-/, "");
  return `${base}-${code}`.slice(0, 60);
}

function sanitizeSlug(slug) {
  return String(slug || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function normEntry(raw, id, code) {
  const name = raw.name || "";
  const short = raw.short || raw.shortDescription || "";
  const long = raw.long || raw.longDescription || "";
  let slug = sanitizeSlug(raw.slug || slugFromId(id, code));
  let shortF = short;
  let longF = long;
  let nameF = name;
  if (code === "hu") {
    shortF = fixHungarianAccents(shortF);
    longF = fixHungarianAccents(longF);
    nameF = fixHungarianAccents(nameF);
  }
  return { name: nameF, short: shortF, long: longF, slug };
}

function fromCache(cache) {
  const byId = {};
  for (const [key, val] of Object.entries(cache)) {
    const [id, code] = key.split(":");
    if (!byId[id]) byId[id] = {};
    byId[id][code] = normEntry(val, id, code);
  }
  return byId;
}

function cloneCatalogLocales(catalogLocales, id) {
  const out = {};
  for (const code of REQUIRED) {
    const src = catalogLocales[code];
    if (!src) return null;
    out[code] = normEntry(
      {
        name: src.name,
        short: src.shortDescription,
        long: src.longDescription,
        slug: slugFromId(id, code),
      },
      id,
      code,
    );
  }
  return out;
}

function emitCjs(i18nMap) {
  const lines = [
    "/** Real locales for prov-cov Parties, Restaurants, Cafés (not mirrored English). */",
    "const localeEntry = (name, short, long, slug) => ({ name, short, long, slug });",
    "",
    "const COV_CATALOG_I18N = {",
  ];

  for (const [id, locales] of Object.entries(i18nMap).sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`  '${id}': {`);
    for (const code of REQUIRED) {
      const t = locales[code];
      if (!t) throw new Error(`Missing ${id}.${code}`);
      const esc = (s) => JSON.stringify(s);
      lines.push(`    ${code}: localeEntry(`);
      lines.push(`      ${esc(t.name)},`);
      lines.push(`      ${esc(t.short)},`);
      lines.push(`      ${esc(t.long)},`);
      lines.push(`      ${esc(t.slug)}`);
      lines.push(`    ),`);
    }
    lines.push("  },");
  }

  lines.push("};", "", "module.exports = { COV_CATALOG_I18N };", "");
  fs.writeFileSync(OUT_CJS, lines.join("\n"));
}

function main() {
  const i18nMap = fromCache(JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")));

  for (let i = 0; i < 4; i++) {
    const chunkPath = path.join(CHUNK_DIR, `batch-${i}.json`);
    const chunk = JSON.parse(fs.readFileSync(chunkPath, "utf8"));
    for (const [id, locales] of Object.entries(chunk)) {
      i18nMap[id] = {};
      for (const code of REQUIRED) {
        i18nMap[id][code] = normEntry(locales[code], id, code);
      }
    }
  }

  for (const [covId, catalogId] of Object.entries(REUSE_CATALOG_ID)) {
    const cloned = cloneCatalogLocales(CATALOG_LOCALES[catalogId], covId);
    if (cloned) i18nMap[covId] = cloned;
  }

  const expected = JSON.parse(
    fs.readFileSync("/tmp/cov-catalog-to-translate.json", "utf8"),
  ).map((p) => p.id);

  const missing = expected.filter((id) => {
    const loc = i18nMap[id];
    return !loc || REQUIRED.some((c) => !loc[c]?.short?.trim());
  });

  if (missing.length) {
    console.error("Still missing:", missing.join(", "));
    process.exit(1);
  }

  emitCjs(i18nMap);
  console.log(`Merged ${Object.keys(i18nMap).length} providers -> ${OUT_CJS}`);
}

main();
