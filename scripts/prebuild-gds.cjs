#!/usr/bin/env node
/**
 * Build @gds/* from vendor/general-design-system (skipped when packages already built).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const vendor = path.join(root, "vendor/general-design-system");
const themeDist = path.join(vendor, "packages/gds-theme/dist/index.js");

if (!fs.existsSync(path.join(vendor, "packages/gds-theme/package.json"))) {
  console.log("[gds] No vendor GDS — skipping build:gds (run npm install first).");
  process.exit(0);
}

if (fs.existsSync(themeDist) && process.env.GDS_FORCE_BUILD !== "1") {
  console.log("[gds] Using existing vendor GDS build (set GDS_FORCE_BUILD=1 to rebuild).");
  process.exit(0);
}

const pkgs = ["gds-theme", "gds-core", "gds-admin"];
for (const pkg of pkgs) {
  const dir = path.join(vendor, "packages", pkg);
  console.log(`[gds] Building @gds/${pkg.replace("gds-", "")}…`);
  execSync("npm run build", { cwd: dir, stdio: "inherit" });
}
