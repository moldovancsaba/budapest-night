#!/usr/bin/env node
/**
 * Ingest coverage batch JSON files and report remaining gaps.
 * Usage: node scripts/run-coverage-ingest.cjs scripts/ingest-payloads/coverage-wave-01.json [...]
 */
require("./load-env.cjs");
const { spawnSync } = require("child_process");
const path = require("path");

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/run-coverage-ingest.cjs <payload.json> ...");
  process.exit(1);
}

for (const f of files) {
  const abs = path.resolve(f);
  console.log("\n=== Ingest", abs, "===");
  const r = spawnSync("npm", ["run", "ingest:listing", "--", "--force", abs], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status);
}

console.log("\n=== Gap check ===");
const g = spawnSync("node", [path.join(__dirname, "compute-coverage-gaps.cjs")], {
  stdio: "inherit",
  cwd: path.join(__dirname, ".."),
  env: process.env,
});
process.exit(g.status ?? 0);
