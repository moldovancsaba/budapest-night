#!/usr/bin/env node
/**
 * Fix providers still using bulk-coverage fallback images (one ingest per provider).
 * Usage: node scripts/fix-all-fallback-images.cjs [--dry-run] [--limit N]
 */
require("./load-env.cjs");
const { spawnSync } = require("child_process");
const path = require("path");

const FALLBACKS = [
  "https://i.ibb.co/mCjYgtvh/47e4d928732e.jpg",
  "https://i.ibb.co/hFKZjWry/4b08db7d8c99.jpg",
  "https://i.ibb.co/mrB4fXkd/65096eb5bdbf.jpg",
];

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

  const base = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
  const providers = await (await fetch(`${base}/api/public/providers`)).json();
  const todo = providers.filter((p) => FALLBACKS.includes(p.image)).map((p) => p.id);

  console.log("Providers with fallback images:", todo.length);
  let fixed = 0;
  let failed = 0;

  for (const id of todo.slice(0, limit)) {
    console.log("\n---", id, "---");
    if (dryRun) continue;
    const r = spawnSync("node", [path.join(__dirname, "fix-provider-one.cjs"), id], {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
      env: process.env,
    });
    if (r.status === 0) fixed++;
    else {
      failed++;
      console.error("FAILED:", id);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!dryRun) {
    const after = await (await fetch(`${base}/api/public/providers`)).json();
    const left = after.filter((p) => FALLBACKS.includes(p.image)).length;
    console.log("\nDone. Fixed:", fixed, "Failed:", failed, "Remaining fallbacks:", left);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
