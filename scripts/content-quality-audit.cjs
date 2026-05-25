#!/usr/bin/env node
/**
 * Orchestrates catalog content audits for the content-quality agent.
 * Run: npm run content:quality:audit
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===\n`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error(`[content-quality] ${label} exited with ${r.status}`);
  }
  return r.status ?? 1;
}

console.log("Pesti Est — content quality audit bundle\n");

const steps = [
  ["Catalog audit (static)", "node", ["-r", "./scripts/load-env.cjs", "scripts/catalog-content-audit.cjs", "--skip-urls"]],
  ["Menu coverage", "npm", ["run", "menu:status"]],
  ["i18n parity", "node", ["scripts/i18n-audit.cjs"]],
  ["Program locale parity", "node", ["-r", "./scripts/load-env.cjs", "scripts/audit-program-locale-parity.cjs"]],
];

let failed = 0;
for (const [label, cmd, args] of steps) {
  failed += run(label, cmd, args) !== 0 ? 1 : 0;
}

const findings = path.join(__dirname, "catalog-audit-findings.md");
if (fs.existsSync(findings)) {
  const text = fs.readFileSync(findings, "utf8");
  const high = (text.match(/^### high /gm) || []).length;
  const medium = (text.match(/^### medium /gm) || []).length;
  const low = (text.match(/^### low /gm) || []).length;
  console.log("\n=== Summary ===\n");
  console.log(`Findings file: scripts/catalog-audit-findings.md`);
  console.log(`Severity sections (approx): high=${high} medium=${medium} low=${low}`);
  console.log("\nNext: open scripts/cursor-content-quality-agent-prompt.txt in a Cursor Agent chat.");
  console.log("Skill: .cursor/skills/content-quality-agent/SKILL.md\n");
}

process.exit(failed > 0 ? 1 : 0);
