#!/usr/bin/env node
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");

const KEY = (process.env.INGEST_API_KEY || "").trim();
const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const ASSETS = path.join(__dirname, "imgbb-asset-sources/providers");

const slugs = [
  "budapest-park",
  "mng",
  "akvarium",
  "fono",
  "trafo",
  "opera",
  "momkult",
  "barba-negra",
  "okk",
  "mupa",
];

async function upload(slug) {
  const fp = path.join(ASSETS, `${slug}.jpg`);
  if (!fs.existsSync(fp)) throw new Error(`Missing ${fp}`);
  const buf = fs.readFileSync(fp);
  const form = new FormData();
  form.append("file", new Blob([buf]), `${slug}.jpg`);
  const res = await fetch(`${BASE}/api/ingest/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json.url) throw new Error(`${slug}: ${JSON.stringify(json)}`);
  return json.url;
}

async function main() {
  if (!KEY) {
    console.error("Missing INGEST_API_KEY");
    process.exit(1);
  }
  const out = {};
  for (const slug of slugs) {
    process.stderr.write(`Uploading ${slug}...`);
    out[slug] = await upload(slug);
    process.stderr.write(` ${out[slug]}\n`);
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
