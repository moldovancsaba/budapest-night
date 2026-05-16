#!/usr/bin/env node
/**
 * Fix Hungarian diacritics in cov-events-i18n.cjs hu blocks, regenerate patch, optional ingest.
 * Usage: node scripts/apply-cov-hu-accents.cjs [--ingest]
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { fixHungarianAccents } = require("./lib/fix-hungarian-accents.cjs");

const i18nPath = path.join(__dirname, "data/cov-events-i18n.cjs");
const { COV_EVENT_I18N } = require(i18nPath);

for (const id of Object.keys(COV_EVENT_I18N)) {
  const hu = COV_EVENT_I18N[id].hu;
  if (!hu) continue;
  hu.name = fixHungarianAccents(hu.name);
  hu.short = fixHungarianAccents(hu.short);
  hu.long = fixHungarianAccents(hu.long);
}

// Rewrite module file (preserve structure via code generation)
const lines = [
  "const localeEntry = (name, short, long, slug) => ({ name, short, long, slug });",
  "",
  "const COV_EVENT_I18N = {",
];

for (const [id, locales] of Object.entries(COV_EVENT_I18N)) {
  lines.push(`  '${id}': {`);
  for (const code of ["hu", "es", "it", "he", "ar"]) {
    const L = locales[code];
    const esc = (s) => JSON.stringify(s);
    lines.push(`    ${code}: localeEntry(`);
    lines.push(`      ${esc(L.name)},`);
    lines.push(`      ${esc(L.short)},`);
    lines.push(`      ${esc(L.long)},`);
    lines.push(`      ${esc(L.slug)}`);
    lines.push(`    ),`);
  }
  lines.push("  },");
}
lines.push("};");
lines.push("");
lines.push("module.exports = { COV_EVENT_I18N };");
lines.push("");

fs.writeFileSync(i18nPath, lines.join("\n"));
console.log("Updated", i18nPath);

const genArgs = [path.join(__dirname, "generate-cov-events-locale-patch.cjs"), "--all-cov"];
const gen = spawnSync("node", genArgs, {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
});
if (gen.status !== 0) process.exit(gen.status);

if (process.argv.includes("--ingest")) {
  const ing = spawnSync(
    "npm",
    ["run", "ingest:listing", "--", "--force", "scripts/ingest-payloads/cov-events-locale-patch.json"],
    { stdio: "inherit", cwd: path.join(__dirname, "..") },
  );
  process.exit(ing.status ?? 0);
}

console.log("Done. Run with --ingest to push to production.");
