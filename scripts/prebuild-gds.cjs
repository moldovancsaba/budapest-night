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
const vendorModules = path.join(vendor, "node_modules/tsup");

if (!fs.existsSync(path.join(vendor, "packages/gds-theme/package.json"))) {
  console.log("[gds] No vendor GDS — skipping build:gds (run npm install first).");
  process.exit(0);
}

if (fs.existsSync(themeDist) && process.env.GDS_FORCE_BUILD !== "1") {
  console.log("[gds] Using existing vendor GDS build (set GDS_FORCE_BUILD=1 to rebuild).");
  process.exit(0);
}

if (!fs.existsSync(vendorModules)) {
  console.log("[gds] Installing GDS monorepo devDependencies (tsup, etc.)…");
  execSync("npm install --include=dev", {
    cwd: vendor,
    stdio: "inherit",
    env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" },
  });
}

console.log("[gds] Building @gds/theme, @gds/core, @gds/admin…");
execSync(
  "npm run build --workspace=@gds/theme --workspace=@gds/core --workspace=@gds/admin",
  { cwd: vendor, stdio: "inherit" },
);
