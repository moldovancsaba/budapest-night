#!/usr/bin/env node
/**
 * Add canonical `locales.en.slug` for every provider and fix misleading district slugs.
 * Run: node scripts/fix-venue-slugs.cjs [--ingest]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");

const DISTRICT = ["obuda", "ujbuda", "belvaros", "terezvaros", "erzsebetvaros", "ferencvaros"];
const BOROUGH_FOR = {
  obuda: "Óbuda",
  ujbuda: "Újbuda",
  belvaros: "Belváros",
  terezvaros: "Terézváros",
  erzsebetvaros: "Erzsébetváros",
  ferencvaros: "Ferencváros",
};

function slugifyName(name) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugFromId(id) {
  let s = id.replace(/^prov-/, "");
  for (const t of DISTRICT) {
    if (s.endsWith(`-${t}`)) s = s.slice(0, -(t.length + 1));
  }
  return s;
}

function sanitizeSlug(slug, borough) {
  let s = slug.toLowerCase();
  for (const [token, b] of Object.entries(BOROUGH_FOR)) {
    if (borough === b) continue;
    s = s.replace(new RegExp(`-${token}(?=-|$)`, "g"), "");
    s = s.replace(new RegExp(`^${token}-`, "g"), "");
  }
  return s.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function canonicalSlug(p) {
  const candidates = [];
  for (const v of Object.values(p.locales || {})) {
    if (v?.slug?.trim()) candidates.push(v.slug.trim());
  }
  const scored = [...new Set(candidates)]
    .map((raw) => {
      const base = raw.replace(/^(.+)-(hu|es|it|he|ar)$/, "$1");
      const sanitized = sanitizeSlug(base, p.borough);
      let score = 100;
      for (const [token, b] of Object.entries(BOROUGH_FOR)) {
        if (sanitized.includes(token) && p.borough !== b) score -= 100;
      }
      if (!/-hu$|-es$|-it$|-he$|-ar$/.test(raw)) score += 10;
      return { sanitized, score };
    })
    .sort((a, b) => b.score - a.score);
  if (scored[0]?.sanitized) return scored[0].sanitized;
  const fromId = slugFromId(p.id);
  if (fromId) return sanitizeSlug(fromId, p.borough);
  return slugifyName(p.name);
}

function localeSlugPatch(p, loc, canonical) {
  const cur = p.locales?.[loc]?.slug?.trim();
  if (!cur) return null;
  const base = cur.replace(/^(.+)-(hu|es|it|he|ar)$/, (_, b, suffix) => `${b}-${suffix}`) || cur;
  const m = cur.match(/^(.+)-(hu|es|it|he|ar)$/);
  const next = loc === "en" ? canonical : m ? `${sanitizeSlug(m[1], p.borough)}-${m[2]}` : sanitizeSlug(cur, p.borough);
  if (next === cur) return null;
  return next;
}

async function main() {
  const base = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
  const res = await fetch(`${base}/api/public/providers`);
  const providers = await res.json();
  const operations = [];

  for (const p of providers) {
    const canonical = canonicalSlug(p);
    const locales = { ...(p.locales || {}) };
    let changed = false;

    const en = locales.en || {};
    if (en.slug !== canonical) {
      locales.en = { ...en, slug: canonical };
      changed = true;
    }

    for (const loc of ["hu", "es", "it", "he", "ar"]) {
      const next = localeSlugPatch(p, loc, canonical);
      if (!next) continue;
      locales[loc] = { ...(locales[loc] || {}), slug: next };
      changed = true;
    }

    if (!changed) continue;
    operations.push({
      resource: "provider",
      action: "patch",
      id: p.id,
      patch: { locales },
    });
  }

  const out = path.join(__dirname, "ingest-payloads/fix-venue-slugs.json");
  fs.writeFileSync(
    out,
    `${JSON.stringify(
      {
        sourceUrls: ["https://budapest-night.vercel.app/api/public/providers"],
        notes: `Canonical en slugs and district-safe locale slugs for ${operations.length} providers.`,
        operations,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Wrote ${operations.length} patches → ${out}`);

  if (process.argv.includes("--ingest")) {
    const { execSync } = require("child_process");
    const BATCH = 50;
    for (let i = 0; i < operations.length; i += BATCH) {
      const chunk = operations.slice(i, i + BATCH);
      const chunkPath = path.join(__dirname, `ingest-payloads/fix-venue-slugs-${i}.json`);
      fs.writeFileSync(
        chunkPath,
        `${JSON.stringify(
          {
            sourceUrls: ["https://budapest-night.vercel.app/api/public/providers"],
            notes: `Venue slug batch ${i / BATCH + 1}`,
            operations: chunk,
          },
          null,
          2,
        )}\n`,
      );
      console.log(`Ingest batch ${i / BATCH + 1} (${chunk.length})…`);
      execSync(`npm run ingest:listing -- --force "${chunkPath}"`, {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
