#!/usr/bin/env node
/**
 * Ensures GDS packages exist at vendor/general-design-system before npm install.
 * Local: symlinks ../general-design-system when present.
 * CI/Vercel: shallow-clones sovereignsquad/general-design-system.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const vendor = path.join(root, "vendor/general-design-system");
const marker = path.join(vendor, "packages/gds-theme/package.json");
const sibling = path.join(root, "../general-design-system");
const siblingMarker = path.join(sibling, "packages/gds-theme/package.json");

const GDS_REPO = "https://github.com/sovereignsquad/general-design-system.git";
/** Pin aligned with gds-adoption.json (2.4.3). Override with GDS_VENDOR_REF on Vercel if needed. */
const GDS_REF = process.env.GDS_VENDOR_REF || "787a8ce";

function symlinkSibling() {
  fs.mkdirSync(path.dirname(vendor), { recursive: true });
  if (fs.existsSync(vendor)) {
    const stat = fs.lstatSync(vendor);
    if (stat.isSymbolicLink() || stat.isDirectory()) return;
    throw new Error(`vendor/general-design-system exists but is not a symlink or directory`);
  }
  fs.symlinkSync(sibling, vendor, "dir");
  console.log("[gds] Linked vendor/general-design-system → ../general-design-system");
}

function cloneRepo() {
  fs.mkdirSync(path.dirname(vendor), { recursive: true });
  console.log(`[gds] Fetching ${GDS_REPO} @ ${GDS_REF} into vendor/general-design-system…`);
  fs.mkdirSync(vendor, { recursive: true });
  execSync("git init", { cwd: vendor, stdio: "inherit" });
  execSync(`git remote add origin ${GDS_REPO}`, { cwd: vendor, stdio: "inherit" });
  execSync(`git fetch --depth 1 origin ${GDS_REF}`, { cwd: vendor, stdio: "inherit" });
  execSync("git checkout FETCH_HEAD", { cwd: vendor, stdio: "inherit" });
}

if (fs.existsSync(marker)) {
  process.exit(0);
}

if (fs.existsSync(siblingMarker)) {
  symlinkSibling();
  process.exit(0);
}

cloneRepo();

if (!fs.existsSync(marker)) {
  console.error("[gds] vendor/general-design-system is missing packages/gds-theme after setup.");
  process.exit(1);
}
