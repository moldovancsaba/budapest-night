#!/usr/bin/env node
/**
 * Content audit: providers with dead websites, domain mismatches, duplicate images, stale URLs.
 *
 *   node scripts/content-audit-providers.cjs [--json] [--limit N]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT = path.join(__dirname, "content-audit-report.json");
const CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 12000;

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function extractSourceHosts(longDescription) {
  const hosts = new Set();
  const block = String(longDescription || "").split("Sources:")[1] || "";
  for (const m of block.matchAll(/https?:\/\/[^\s)]+/gi) || []) {
    const h = hostOf(m[0]);
    if (h) hosts.add(h);
  }
  return [...hosts];
}

async function checkUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return { ok: false, status: 0, error: "invalid" };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "BudapestNightAudit/1.0" },
    });
    clearTimeout(t);
    if (res.status === 405 || res.status === 403) {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), FETCH_TIMEOUT_MS);
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl2.signal,
        headers: { "User-Agent": "BudapestNightAudit/1.0" },
      });
      clearTimeout(t2);
    }
    return { ok: res.ok, status: res.status, finalUrl: res.url };
  } catch (e) {
    return { ok: false, status: 0, error: String(e.message || e) };
  }
}

async function mapPool(items, fn, limit) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function main() {
  const asJson = process.argv.includes("--json");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;

  const res = await fetch(`${BASE}/api/public/providers`);
  const providers = await res.json();
  const list = limit > 0 ? providers.slice(0, limit) : providers;

  const imageToIds = new Map();
  for (const p of providers) {
    if (!p.image) continue;
    const ids = imageToIds.get(p.image) || [];
    ids.push(p.id);
    imageToIds.set(p.image, ids);
  }

  const checks = await mapPool(
    list,
    async (p) => {
      const website = (p.website || "").trim();
      const websiteHost = hostOf(website);
      const imageHost = hostOf(p.imageSource || "");
      const sourceHosts = extractSourceHosts(p.longDescription);
      const websiteCheck = website ? await checkUrl(website) : { ok: false, status: 0, error: "empty" };

      const issues = [];
      if (!websiteCheck.ok) issues.push({ code: "website_unreachable", detail: websiteCheck });
      if (websiteHost && imageHost && websiteHost !== imageHost && !imageHost.includes("ibb.co")) {
        issues.push({ code: "image_source_domain_mismatch", websiteHost, imageHost });
      }
      if (sourceHosts.length && websiteHost && !sourceHosts.every((h) => h === websiteHost || h.endsWith(`.${websiteHost}`))) {
        issues.push({ code: "sources_host_mismatch", websiteHost, sourceHosts });
      }
      if (/kioskbudapest\.com/i.test(website) || /kioskbudapest\.com/i.test(p.longDescription || "")) {
        issues.push({ code: "stale_kiosk_domain" });
      }
      const dup = imageToIds.get(p.image);
      if (dup && dup.length > 1) issues.push({ code: "duplicate_image", sharedWith: dup.filter((id) => id !== p.id) });
      if (/Mediterranean/i.test(p.shortDescription || "") && /hungarian|goulash|paprikás/i.test(p.name + p.longDescription)) {
        issues.push({ code: "possible_wrong_cuisine_copy" });
      }

      return { id: p.id, name: p.name, website, issues };
    },
    CONCURRENCY,
  );

  const flagged = checks.filter((r) => r.issues.length > 0);
  const summary = {
    generatedAt: new Date().toISOString(),
    providerCount: providers.length,
    checked: list.length,
    flaggedCount: flagged.length,
    byCode: {},
    flagged,
  };
  for (const row of flagged) {
    for (const iss of row.issues) {
      summary.byCode[iss.code] = (summary.byCode[iss.code] || 0) + 1;
    }
  }

  fs.writeFileSync(OUT, `${JSON.stringify(summary, null, 2)}\n`);
  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`Audit: ${flagged.length}/${list.length} providers flagged (${providers.length} total)`);
  console.log("By issue:", summary.byCode);
  console.log("Report:", OUT);
  for (const row of flagged.slice(0, 25)) {
    console.log(`- ${row.id} (${row.name}): ${row.issues.map((i) => i.code).join(", ")}`);
  }
  if (flagged.length > 25) console.log(`… and ${flagged.length - 25} more in ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
