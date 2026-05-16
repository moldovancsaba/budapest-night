#!/usr/bin/env node
/**
 * Push a single env var from .env.local to the linked Vercel project (all targets).
 * Usage: node -r ./scripts/load-env.cjs scripts/sync-vercel-secret.cjs ADMIN_SESSION_SECRET
 */
require("./load-env.cjs");

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const name = process.argv[2]?.trim();
if (!name) {
  console.error("Usage: node -r ./scripts/load-env.cjs scripts/sync-vercel-secret.cjs <ENV_VAR_NAME>");
  process.exit(1);
}

const cwd = path.resolve(__dirname, "..");
const PREVIEW_TIMEOUT_MS = 90_000;

function stripQuotes(v) {
  const s = String(v).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function vercel(args, timeoutMs = 120_000) {
  const r = spawnSync("vercel", args, {
    cwd,
    stdio: ["ignore", "inherit", "inherit"],
    encoding: "utf8",
    timeout: timeoutMs,
    env: { ...process.env, CI: "1" },
  });
  if (r.error?.code === "ETIMEDOUT") return { ok: false, timeout: true };
  if (r.status !== 0) return { ok: false, timeout: false };
  return { ok: true };
}

const v = stripQuotes(process.env[name] ?? "");
if (!v) {
  console.error(`Empty or missing: ${name} (set in .env.local first)`);
  process.exit(1);
}

console.log("sync:", name, "(sensitive on production/preview; all targets)");

let r = vercel(["env", "add", name, "production", "--value", v, "--yes", "--sensitive", "--force"]);
if (!r.ok) {
  console.error("FAILED production:", name);
  process.exit(1);
}

r = vercel(
  ["env", "add", name, "preview", "", "--value", v, "--yes", "--sensitive", "--force"],
  PREVIEW_TIMEOUT_MS,
);
if (!r.ok) {
  console.warn("WARN: Preview not updated", r.timeout ? "(timeout)" : "(error)");
}

r = vercel(["env", "add", name, "development", "--value", v, "--yes", "--force"]);
if (!r.ok) {
  console.error("FAILED development:", name);
  process.exit(1);
}

console.log("Done.", name, "→ production, preview, development");
