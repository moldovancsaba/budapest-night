#!/usr/bin/env node
/**
 * Build @doneisbetter/gds-* from vendor/general-design-system (skipped when packages already built).
 * Prunes vendor node_modules after build so Next.js resolves a single @mantine/core.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const vendor = path.join(root, "vendor/general-design-system");
const themeDist = path.join(vendor, "packages/gds-theme/dist/index.js");
const vendorModules = path.join(vendor, "node_modules/tsup");

function pruneVendorInstalls() {
  const targets = [
    path.join(vendor, "node_modules"),
    path.join(vendor, "packages/gds-theme/node_modules"),
    path.join(vendor, "packages/gds-core/node_modules"),
    path.join(vendor, "packages/gds-admin/node_modules"),
  ];
  for (const target of targets) {
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
  console.log("[gds] Pruned vendor GDS node_modules (single @mantine/core for the app).");
}

if (!fs.existsSync(path.join(vendor, "packages/gds-theme/package.json"))) {
  console.log("[gds] No vendor GDS — skipping build:gds (run npm install first).");
  process.exit(0);
}

if (fs.existsSync(themeDist) && process.env.GDS_FORCE_BUILD !== "1") {
  console.log("[gds] Using existing vendor GDS build (set GDS_FORCE_BUILD=1 to rebuild).");
  pruneVendorInstalls();
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

console.log("[gds] Building @doneisbetter/gds-theme, gds-core, gds-admin…");
execSync(
  "npm run build --workspace=@doneisbetter/gds-theme --workspace=@doneisbetter/gds-core --workspace=@doneisbetter/gds-admin",
  { cwd: vendor, stdio: "inherit" },
);

pruneVendorInstalls();
