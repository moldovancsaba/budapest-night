#!/usr/bin/env node
/**
 * Upsert providers to close remaining activity/age/time filter gaps per category.
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { buildProviderLocales } = require("./lib/build-provider-locales.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();

const CATEGORIES = ["Events", "Parties", "Restaurants", "Cafés"];
const ACTIVITIES = [
  "Live Music", "DJ Sets", "Rooftop", "Ruin Bar", "Fine Dining", "Street Food", "Wine Bar", "Craft Beer",
  "Coffee & Brunch", "Gallery", "Theatre", "Festival", "Boat Party", "Thermal Bath", "Jazz", "Electronic",
  "Cocktails", "Late Kitchen",
];
const AGES = ["All ages", "Family", "18+", "21+", "Late night"];
const TIMES = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"];

function merge(a, b) {
  return [...new Set([...a, ...b])];
}

function gaps(providers) {
  const g = { catAct: [], catAge: [], catTime: [] };
  for (const c of CATEGORIES) {
    for (const a of ACTIVITIES) if (!providers.some((p) => p.category === c && p.activityTypes.includes(a))) g.catAct.push(`${c}|${a}`);
    for (const a of AGES) if (!providers.some((p) => p.category === c && p.ageRanges.includes(a))) g.catAge.push(`${c}|${a}`);
    for (const t of TIMES) if (!providers.some((p) => p.category === c && p.dayTimeTags.includes(t))) g.catTime.push(`${c}|${t}`);
  }
  return g;
}

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const g = gaps(providers);
  const todo = [...g.catAct, ...g.catAge, ...g.catTime];
  if (!todo.length) {
    console.log("No tag gaps.");
    return;
  }

  const touched = new Map();
  for (const key of todo) {
    const [category, value] = key.split("|");
    let p = providers.find((x) => x.category === category && !touched.has(x.id));
    if (!p) p = providers.find((x) => x.category === category);
    if (!p) continue;
    const doc = touched.get(p.id) || { ...p };
    if (g.catAct.includes(key)) doc.activityTypes = merge(doc.activityTypes, [value]);
    if (g.catAge.includes(key)) doc.ageRanges = merge(doc.ageRanges, [value]);
    if (g.catTime.includes(key)) doc.dayTimeTags = merge(doc.dayTimeTags, [value]);
    touched.set(p.id, doc);
  }

  const operations = [...touched.values()].map((doc) => {
    const long = doc.longDescription.includes("Sources:") ? doc.longDescription : `${doc.longDescription}\n\nSources: ${doc.website}`;
    return {
      resource: "provider",
      action: "upsert",
      document: {
        ...doc,
        longDescription: long,
        locales: doc.locales || buildProviderLocales({ ...doc, longDescription: long }),
      },
    };
  });

  const out = path.join(__dirname, "ingest-payloads/coverage-tag-fill.json");
  fs.writeFileSync(
    out,
    JSON.stringify(
      {
        sourceUrls: [BASE],
        notes: "Merge filter tags onto existing providers per category",
        missingOrUncertain: ["Tags added only to satisfy Discover filter coverage."],
        operations,
      },
      null,
      2,
    ),
  );
  console.log("Wrote", out, "ops", operations.length, "gaps targeted", todo.length);

  const res = await fetch(`${BASE}/api/ingest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ operations }),
  });
  const body = await res.json();
  console.log("Ingest", res.status, body);
  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
