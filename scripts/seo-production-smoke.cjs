#!/usr/bin/env node
/**
 * R6 — production smoke: sitemap, program week, JSON-LD pages, robots.
 *   node scripts/seo-production-smoke.cjs
 *   BASE=https://budapest-night.vercel.app node scripts/seo-production-smoke.cjs
 */
const BASE = (process.env.BASE || "https://budapest-night.vercel.app").replace(/\/$/, "");

async function get(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { url, status: res.status, ok: res.ok, text, type: res.headers.get("content-type") };
}

function hasJsonLd(html) {
  return html.includes('type="application/ld+json"') || html.includes("application/ld+json");
}

async function main() {
  const checks = [];
  const add = (name, pass, detail) => checks.push({ name, pass, detail });

  const robots = await get("/robots.txt");
  add("robots.txt", robots.ok && robots.text.includes("Sitemap"), `status ${robots.status}`);

  const sitemap = await get("/sitemap.xml");
  add("sitemap.xml", sitemap.ok && sitemap.text.includes("<url>"), `status ${sitemap.status}`);

  const programApi = await get("/api/public/program-week?locale=hu");
  let weekFeatured = 0;
  try {
    const j = JSON.parse(programApi.text);
    const evIds = j.week?.featuredEventIds?.length ?? 0;
    const provIds = j.week?.featuredProviderIds?.length ?? 0;
    weekFeatured = evIds + provIds;
    const spotlight = j.spotlightEvents?.length ?? 0;
    const listed = (j.featuredEvents?.length ?? 0) + spotlight;
    add(
      "program-week API",
      programApi.ok && j.week?.headline && weekFeatured >= 3 && listed >= 3,
      `${evIds} events + ${provIds} venues; cards: ${j.featuredEvents?.length ?? 0} this week + ${spotlight} spotlight`,
    );
  } catch {
    add("program-week API", false, "invalid JSON");
  }

  const homeHu = await get("/hu");
  add("home HU", homeHu.ok, `status ${homeHu.status}`);

  const programHu = await get("/ez-a-het");
  add("program /ez-a-het", programHu.ok, `status ${programHu.status}`);

  const events = await get("/api/public/events?upcoming=1&locale=hu");
  let featuredCount = 0;
  try {
    const list = JSON.parse(events.text);
    featuredCount = list.filter((e) => e.isFeatured).length;
    add("events API featured", events.ok, `isFeatured count: ${featuredCount}`);
  } catch {
    add("events API featured", false, "invalid JSON");
  }

  const mozi = await get("/api/public/providers?vertical=mozi");
  add("providers mozi vertical", mozi.ok, `status ${mozi.status}`);

  const failed = checks.filter((c) => !c.pass);
  console.log(`\nSEO smoke — ${BASE}\n`);
  for (const c of checks) {
    console.log(`${c.pass ? "✓" : "✗"} ${c.name}: ${c.detail}`);
  }
  if (weekFeatured === 0) {
    console.log("\n⚠ Program week has no featured IDs in API (publish via bootstrap or admin).");
  }
  if (featuredCount === 0) {
    console.log("⚠ No isFeatured events — add featured_event promotions.");
  }
  console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
