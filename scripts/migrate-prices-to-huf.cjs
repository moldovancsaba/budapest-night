#!/usr/bin/env node
/**
 * Convert provider pricePerClass from legacy EUR to canonical HUF.
 * Usage: node scripts/migrate-prices-to-huf.cjs [--dry-run] [--ingest]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const HUF_PER_EUR = Number(process.env.HUF_PER_EUR || 350);
const OUT = path.join(__dirname, "ingest-payloads/migrate-prices-to-huf.json");

function toHuf(amount, priceCurrency) {
  if (!amount) return 0;
  if (priceCurrency === "HUF") return Math.round(amount);
  if (priceCurrency === "EUR") return Math.round(amount * HUF_PER_EUR);
  if (amount > 500) return Math.round(amount);
  return Math.round(amount * HUF_PER_EUR);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const operations = [];

  for (const p of providers) {
    const huf = toHuf(p.pricePerClass, p.priceCurrency);
    if (huf === p.pricePerClass && p.priceCurrency === "HUF") continue;
    const document = { ...p, pricePerClass: huf, priceCurrency: "HUF" };
    delete document._id;
    delete document.menuTags;
    operations.push({ resource: "provider", action: "upsert", document });
  }

  if (!operations.length) {
    console.log("All providers already use HUF amounts.");
    return;
  }

  const payload = {
    sourceUrls: [],
    notes: `Migrate ${operations.length} providers to HUF (1 EUR = ${HUF_PER_EUR} HUF).`,
    missingOrUncertain: [],
    operations,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} operations to ${OUT}`);
  for (const o of operations.slice(0, 10)) {
    const d = o.document;
    console.log(`  ${d.id}: ${d.pricePerClass} Ft`);
  }
  if (operations.length > 10) console.log(`  ... +${operations.length - 10} more`);

  if (dryRun) return;

  if (process.argv.includes("--ingest")) {
    const { execSync } = require("child_process");
    const BATCH = 50;
    for (let i = 0; i < operations.length; i += BATCH) {
      const chunk = operations.slice(i, i + BATCH);
      const chunkPath = path.join(__dirname, `ingest-payloads/migrate-prices-to-huf-${i}.json`);
      fs.writeFileSync(
        chunkPath,
        `${JSON.stringify({ ...payload, operations: chunk, notes: `${payload.notes} (batch ${i / BATCH + 1})` }, null, 2)}\n`,
      );
      console.log(`Ingesting batch ${i / BATCH + 1} (${chunk.length} ops)...`);
      execSync(`npm run ingest:listing -- --force "${chunkPath}"`, {
        stdio: "inherit",
        cwd: path.join(__dirname, ".."),
      });
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
