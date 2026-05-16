#!/usr/bin/env node
/**
 * Build scripts/data/cov-catalog-i18n.cjs for mirrored prov-cov Parties/Restaurants/Cafés.
 * Uses MyMemory MT + reuse from catalog-locale-translations.cjs where applicable.
 *
 * Usage: node scripts/generate-cov-catalog-i18n.cjs [--resume]
 */
const fs = require("fs");
const path = require("path");
const { translateText } = require("./lib/translate-mymemory.cjs");
const { fixHungarianAccents } = require("./lib/fix-hungarian-accents.cjs");
const { LOCALES_BY_ID: CATALOG_LOCALES } = require("./data/catalog-locale-translations.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const CACHE_PATH = path.join(__dirname, "data/.cov-catalog-i18n-cache.json");
const OUT_CJS = path.join(__dirname, "data/cov-catalog-i18n.cjs");
const REQUIRED = ["hu", "es", "it", "he", "ar"];

/** Reuse hand-written catalog locales; slugs are regenerated per cov id. */
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

function stripSources(long) {
  return String(long || "")
    .replace(/\s*Sources:\s*[\s\S]*$/i, "")
    .trim();
}

function extractSources(long, fallback) {
  const m = String(long || "").match(/Sources:\s*([\s\S]*)$/i);
  if (m) {
    const line = m[1].trim();
    return line.startsWith("http") ? `Sources: ${line}` : `Sources: ${line}`;
  }
  const w = (fallback || "").trim();
  return w ? `Sources: ${w}` : "Sources: https://budapest-night.vercel.app";
}

function isMirrored(p) {
  if (!p.id.startsWith("prov-cov-")) return false;
  if (p.category === "Events") return false;
  return REQUIRED.every((code) => {
    const short = p.locales?.[code]?.shortDescription ?? "";
    return short.trim() === (p.shortDescription || "").trim();
  });
}

function cloneCatalogLocales(catalogLocales, id) {
  const out = {};
  for (const code of REQUIRED) {
    const src = catalogLocales[code];
    if (!src) return null;
    out[code] = {
      name: src.name,
      short: src.shortDescription,
      long: src.longDescription,
      slug: slugFromId(id, code),
    };
  }
  return out;
}

async function translateProvider(p, cache) {
  const sourcesLine = extractSources(p.longDescription, p.website);
  const longBody = stripSources(p.longDescription);
  const locales = {};

  for (const code of REQUIRED) {
    const cacheKey = `${p.id}:${code}`;
    if (cache[cacheKey]) {
      locales[code] = cache[cacheKey];
      continue;
    }

    const name =
      code === "he" || code === "ar"
        ? await translateText(p.name, "en", code)
        : p.name;

    const short = await translateText(p.shortDescription, "en", code);
    const longBodyT = await translateText(longBody, "en", code);
    const long = `${longBodyT}\n\n${sourcesLine}`;

    let shortFinal = short;
    let longFinal = long;
    let nameFinal = name;
    if (code === "hu") {
      shortFinal = fixHungarianAccents(shortFinal);
      longFinal = fixHungarianAccents(longFinal);
      nameFinal = fixHungarianAccents(nameFinal);
    }

    locales[code] = {
      name: nameFinal,
      short: shortFinal,
      long: longFinal,
      slug: slugFromId(p.id, code),
    };
    cache[cacheKey] = locales[code];
    fs.writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
    process.stdout.write(`  ${code} `);
  }
  return locales;
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
      const esc = (s) =>
        JSON.stringify(s)
          .replace(/\u2028/g, "\\u2028")
          .replace(/\u2029/g, "\\u2029");
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

async function main() {
  const resume = process.argv.includes("--resume");
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const targets = providers.filter(isMirrored);
  console.log(`Translating ${targets.length} mirrored cov providers…`);

  let cache = {};
  if (resume && fs.existsSync(CACHE_PATH)) {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  }

  const i18nMap = {};
  let i = 0;
  for (const p of targets) {
    i++;
    process.stdout.write(`[${i}/${targets.length}] ${p.id} `);

    const reuseId = REUSE_CATALOG_ID[p.id];
    if (reuseId && CATALOG_LOCALES[reuseId]) {
      const cloned = cloneCatalogLocales(CATALOG_LOCALES[reuseId], p.id);
      if (cloned) {
        for (const code of REQUIRED) {
          if (code === "hu") {
            cloned[code].short = fixHungarianAccents(cloned[code].short);
            cloned[code].long = fixHungarianAccents(cloned[code].long);
            cloned[code].name = fixHungarianAccents(cloned[code].name);
          }
        }
        i18nMap[p.id] = cloned;
        console.log("(catalog reuse)");
        continue;
      }
    }

    const allCached = REQUIRED.every((code) => cache[`${p.id}:${code}`]);
    if (allCached) {
      i18nMap[p.id] = {};
      for (const code of REQUIRED) i18nMap[p.id][code] = cache[`${p.id}:${code}`];
      console.log("(cache)");
      continue;
    }

    try {
      i18nMap[p.id] = await translateProvider(p, cache);
      console.log("");
    } catch (e) {
      console.error(`\nFailed ${p.id}:`, e.message);
      process.exitCode = 1;
      break;
    }
  }

  if (Object.keys(i18nMap).length) {
    emitCjs(i18nMap);
    console.log(`\nWrote ${Object.keys(i18nMap).length} entries to ${OUT_CJS}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
