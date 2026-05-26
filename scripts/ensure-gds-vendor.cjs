#!/usr/bin/env node
/**
 * Ensures GDS packages exist at vendor/general-design-system before npm install.
 * Local: symlinks ../general-design-system when present.
 * CI/Vercel: downloads a pinned GitHub tarball (no git ref quirks).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const vendor = path.join(root, "vendor/general-design-system");
const vendorParent = path.join(root, "vendor");
const marker = path.join(vendor, "packages/gds-theme/package.json");
const sibling = path.join(root, "../general-design-system");
const siblingMarker = path.join(sibling, "packages/gds-theme/package.json");

/** Pin aligned with gds-adoption.json (2.6.1 @doneisbetter scope). Override with GDS_VENDOR_REF on Vercel if needed. */
const GDS_REF = process.env.GDS_VENDOR_REF || "53c52b8adbd66ec394491c322393b65c50b2349b";
const GDS_ARCHIVE = `https://codeload.github.com/sovereignsquad/general-design-system/tar.gz/${GDS_REF}`;

function symlinkSibling() {
  fs.mkdirSync(vendorParent, { recursive: true });
  if (fs.existsSync(vendor)) {
    const stat = fs.lstatSync(vendor);
    if (stat.isSymbolicLink() || stat.isDirectory()) return;
    throw new Error(`vendor/general-design-system exists but is not a symlink or directory`);
  }
  fs.symlinkSync(sibling, vendor, "dir");
  console.log("[gds] Linked vendor/general-design-system → ../general-design-system");
}

function downloadArchive() {
  fs.mkdirSync(vendorParent, { recursive: true });
  if (fs.existsSync(vendor)) {
    fs.rmSync(vendor, { recursive: true, force: true });
  }

  const tarFile = path.join(vendorParent, "gds-vendor.tar.gz");
  console.log(`[gds] Downloading GDS @ ${GDS_REF.slice(0, 7)}…`);
  execSync(`curl -fsSL "${GDS_ARCHIVE}" -o "${tarFile}"`, { stdio: "inherit" });

  execSync(`tar -xzf "${tarFile}" -C "${vendorParent}"`, { stdio: "inherit" });
  fs.unlinkSync(tarFile);

  const extracted = fs
    .readdirSync(vendorParent)
    .find((name) => name.startsWith("general-design-system-"));
  if (!extracted) {
    throw new Error("[gds] Archive extracted but general-design-system-* folder not found");
  }

  fs.renameSync(path.join(vendorParent, extracted), vendor);
  console.log(`[gds] Installed vendor/general-design-system (${extracted})`);
}

if (fs.existsSync(marker)) {
  process.exit(0);
}

if (fs.existsSync(siblingMarker)) {
  symlinkSibling();
  process.exit(0);
}

downloadArchive();

if (!fs.existsSync(marker)) {
  console.error("[gds] vendor/general-design-system is missing packages/gds-theme after setup.");
  process.exit(1);
}
