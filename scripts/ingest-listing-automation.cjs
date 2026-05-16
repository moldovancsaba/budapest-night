#!/usr/bin/env node
/**
 * BudapestNight curator ingest automation
 *
 * Curator workflow (you research; this script validates, dedupes, POSTs, reports):
 * 1. Find one Budapest family/kids listing from an official or highly reliable source.
 * 2. Author `scripts/ingest-payloads/<name>.json` with `operations`, `sourceUrls`,
 *    optional `notes`, optional `missingOrUncertain` (string array).
 * 3. Run: `npm run ingest:listing -- [--dry-run] [--force] <payload.json>`
 *
 * Before POST (unless `--force` when duplicates were detected):
 * - Fetches public catalogs for id/name overlap checks.
 * - Validates provider / meetupGroup upsert documents; **raster image URLs must be https on imgbb.com** (or empty).
 *
 * Env: `INGEST_API_KEY` (required unless `--dry-run`), optional `INGEST_BASE_URL`
 * (default https://classscout.vercel.app). Loads `.env` then `.env.local`.
 *
 * Payload shape:
 *   { "sourceUrls": [], "notes": "", "missingOrUncertain": [],
 *     "operations": [ { "resource": "provider"|"meetupGroup", "action": "upsert", "document": {} } ]
 *   }
 *   or a single operation `{ "resource", "action", "document", ... }`.
 */

require("./load-env.cjs");
const fs = require("fs");
const path = require("path");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();

const CATEGORIES = ["Classes", "Camps", "Birthday Parties", "Drop-In Activities"];
const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const AGE_RANGES = ["0–2", "3–5", "6–8", "9–12", "Teens"];
const DAY_TAGS = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "After-school"];
const BADGES = ["Featured", "Popular", "New", "Staff Pick", "Great for Toddlers", "Weekend Friendly"];

const MEETUP_TYPES = ["Parent Meetup", "Mom Group", "Playdate Group", "New Parents", "Neighborhood Families"];
const MEETUP_AGES = ["0–2", "0–3", "0–5", "0–6", "2–5", "2–8", "3–5", "All ages"];
const MEETUP_CADENCE = ["Weekly", "Monthly", "Weekend", "Pop-up"];
const MEETUP_ICONS = ["stroller", "skyline", "heart", "coffee", "playground", "community"];
const MEETUP_PALETTES = ["teal", "orange", "beige", "charcoal"];

function isImgBbHttpsImageUrl(url) {
  const u = String(url || "").trim();
  if (!/^https:\/\//i.test(u)) return false;
  try {
    const h = new URL(u).hostname.toLowerCase();
    return h === "i.ibb.co" || h === "ibb.co" || h === "image.ibb.co" || h.endsWith(".ibb.co");
  } catch {
    return false;
  }
}

function normName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const files = argv.filter((a) => !a.startsWith("-"));
  return { dryRun, force, payloadPath: files[0] || null };
}

function loadPayload(payloadPath) {
  const raw = fs.readFileSync(path.resolve(payloadPath), "utf8");
  const j = JSON.parse(raw);
  const meta = {
    sourceUrls: Array.isArray(j.sourceUrls) ? j.sourceUrls : [],
    notes: typeof j.notes === "string" ? j.notes : "",
    missingOrUncertain: Array.isArray(j.missingOrUncertain) ? j.missingOrUncertain.map(String) : [],
  };
  if (Array.isArray(j.operations) && j.operations.length) {
    return { operations: j.operations, ...meta };
  }
  if (j.resource && j.action) {
    return { operations: [j], ...meta };
  }
  throw new Error("Payload needs { operations: [...] } or a single { resource, action, ... } operation");
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await r.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: r.ok, status: r.status, body };
}

function collectUpserts(operations) {
  const upserts = [];
  for (const op of operations) {
    if (!op || typeof op !== "object") continue;
    if (op.action !== "upsert") continue;
    if (op.resource === "provider" && op.document?.id) {
      upserts.push({ kind: "provider", id: op.document.id, name: op.document.name });
    }
    if (op.resource === "meetupGroup" && op.document?.id) {
      upserts.push({ kind: "meetupGroup", id: op.document.id, name: op.document.name });
    }
  }
  return upserts;
}

function checkDuplicates(upserts, providers, meetups) {
  const warnings = [];
  const pById = new Map(providers.filter((x) => x && x.id).map((p) => [p.id, p]));
  const mById = new Map(meetups.filter((x) => x && x.id).map((m) => [m.id, m]));
  const pNames = new Set(providers.map((p) => normName(p.name)).filter(Boolean));
  const mNames = new Set(meetups.map((m) => normName(m.name)).filter(Boolean));

  for (const u of upserts) {
    if (u.kind === "provider") {
      if (pById.has(u.id)) warnings.push(`Provider id already exists: ${u.id}`);
      if (u.name && pNames.has(normName(u.name))) warnings.push(`Possible duplicate provider name: ${u.name}`);
    }
    if (u.kind === "meetupGroup") {
      if (mById.has(u.id)) warnings.push(`Meetup id already exists: ${u.id}`);
      if (u.name && mNames.has(normName(u.name))) warnings.push(`Possible duplicate meetup name: ${u.name}`);
    }
  }
  return warnings;
}

function mustString(doc, field, errors) {
  if (typeof doc[field] !== "string" || !doc[field].trim()) errors.push(`provider.document.${field} must be a non-empty string`);
}

function mustNum(doc, field, errors) {
  if (typeof doc[field] !== "number" || Number.isNaN(doc[field])) errors.push(`provider.document.${field} must be a number`);
}

function mustStrArray(doc, field, errors) {
  if (!Array.isArray(doc[field]) || doc[field].some((x) => typeof x !== "string" || !x.trim())) {
    errors.push(`provider.document.${field} must be a non-empty string array`);
  }
}

function validateProvider(doc, idx) {
  const errors = [];
  const p = `operations[${idx}] provider`;
  if (!doc || typeof doc !== "object") {
    errors.push(`${p}: missing document`);
    return errors;
  }
  mustString(doc, "id", errors);
  mustString(doc, "name", errors);
  mustString(doc, "category", errors);
  if (doc.category && !CATEGORIES.includes(doc.category)) errors.push(`${p}: invalid category "${doc.category}"`);
  mustString(doc, "borough", errors);
  if (doc.borough && !BOROUGHS.includes(doc.borough)) errors.push(`${p}: invalid borough "${doc.borough}"`);
  mustString(doc, "neighborhood", errors);
  mustString(doc, "address", errors);
  mustStrArray(doc, "activityTypes", errors);
  if (!Array.isArray(doc.ageRanges) || doc.ageRanges.length === 0) errors.push(`${p}: ageRanges required`);
  else
    for (const a of doc.ageRanges) {
      if (!AGE_RANGES.includes(a)) errors.push(`${p}: invalid ageRange "${a}"`);
    }
  if (!Array.isArray(doc.dayTimeTags) || doc.dayTimeTags.length === 0) errors.push(`${p}: dayTimeTags required`);
  else
    for (const t of doc.dayTimeTags) {
      if (!DAY_TAGS.includes(t)) errors.push(`${p}: invalid dayTimeTag "${t}"`);
    }
  mustNum(doc, "pricePerClass", errors);
  mustString(doc, "shortDescription", errors);
  mustString(doc, "longDescription", errors);
  mustNum(doc, "rating", errors);
  mustNum(doc, "reviewCount", errors);
  if (!Array.isArray(doc.badges)) errors.push(`${p}: badges must be an array`);
  else for (const b of doc.badges) if (!BADGES.includes(b)) errors.push(`${p}: invalid badge "${b}"`);
  if (typeof doc.image !== "string") errors.push(`${p}: image must be string (empty ok)`);
  else if (doc.image.trim() && !isImgBbHttpsImageUrl(doc.image)) errors.push(`${p}: image must be empty or https ImgBB (i.ibb.co)`);
  if (doc.galleryImages !== undefined && !Array.isArray(doc.galleryImages)) errors.push(`${p}: galleryImages must be array or omitted`);
  else if (Array.isArray(doc.galleryImages)) {
    doc.galleryImages.forEach((g, i) => {
      if (typeof g === "string" && g.trim() && !isImgBbHttpsImageUrl(g)) {
        errors.push(`${p}: galleryImages[${i}] must be https ImgBB URL`);
      }
    });
  }
  if (typeof doc.email !== "string") errors.push(`${p}: email must be string (empty ok)`);
  mustString(doc, "website", errors);
  mustString(doc, "phone", errors);
  if (doc.bookingEnabled !== undefined && typeof doc.bookingEnabled !== "boolean") errors.push(`${p}: bookingEnabled must be boolean`);
  return errors;
}

function validateMeetup(doc, idx) {
  const errors = [];
  const p = `operations[${idx}] meetupGroup`;
  if (!doc || typeof doc !== "object") {
    errors.push(`${p}: missing document`);
    return errors;
  }
  mustString(doc, "id", errors);
  mustString(doc, "name", errors);
  mustString(doc, "borough", errors);
  if (doc.borough && !BOROUGHS.includes(doc.borough)) errors.push(`${p}: invalid borough`);
  mustString(doc, "neighborhood", errors);
  mustString(doc, "groupType", errors);
  if (doc.groupType && !MEETUP_TYPES.includes(doc.groupType)) errors.push(`${p}: invalid groupType`);
  mustString(doc, "ageRange", errors);
  if (doc.ageRange && !MEETUP_AGES.includes(doc.ageRange)) errors.push(`${p}: invalid ageRange`);
  mustString(doc, "cadence", errors);
  if (doc.cadence && !MEETUP_CADENCE.includes(doc.cadence)) errors.push(`${p}: invalid cadence`);
  if (typeof doc.instagram !== "string") errors.push(`${p}: instagram must be string (empty ok)`);
  mustString(doc, "website", errors);
  mustString(doc, "description", errors);
  mustString(doc, "initials", errors);
  mustString(doc, "icon", errors);
  if (doc.icon && !MEETUP_ICONS.includes(doc.icon)) errors.push(`${p}: invalid icon`);
  mustString(doc, "palette", errors);
  if (doc.palette && !MEETUP_PALETTES.includes(doc.palette)) errors.push(`${p}: invalid palette`);
  if (doc.coverImageUrl !== undefined && typeof doc.coverImageUrl !== "string") errors.push(`${p}: coverImageUrl must be string or omitted`);
  else if (doc.coverImageUrl && doc.coverImageUrl.trim() && !isImgBbHttpsImageUrl(doc.coverImageUrl)) {
    errors.push(`${p}: coverImageUrl must be empty or https ImgBB URL`);
  }
  return errors;
}

function validateOperations(operations) {
  const all = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    if (!op || typeof op !== "object") {
      all.push(`operations[${i}]: not an object`);
      continue;
    }
    if (op.resource === "provider" && op.action === "upsert") all.push(...validateProvider(op.document, i));
    else if (op.resource === "meetupGroup" && op.action === "upsert") all.push(...validateMeetup(op.document, i));
    else if (op.action === "upsert") all.push(`operations[${i}]: unsupported upsert resource ${String(op.resource)}`);
  }
  return all;
}

function printIngestReport({
  endpoint,
  body,
  sourceUrls,
  notes,
  missingOrUncertain,
  dupWarnings,
  upserts,
  httpStatus,
  responseBody,
  dryRun,
}) {
  console.log("\n========== INGEST REPORT ==========");
  console.log("\n1) What was added or updated (requested)");
  if (upserts.length === 0) console.log("   (no provider/meetup upsert operations in payload)");
  else upserts.forEach((u) => console.log(`   - ${u.kind} upsert: id=${u.id} name=${JSON.stringify(u.name || "")}`));

  console.log("\n2) Endpoint used");
  console.log(`   POST ${endpoint}`);

  console.log("\n3) Final JSON payload (POST body)");
  console.log(JSON.stringify(body, null, 2));

  console.log("\n4) Source URLs used");
  if (sourceUrls.length === 0) console.log("   (none in payload — add sourceUrls[] for auditability)");
  else sourceUrls.forEach((u) => console.log(`   - ${u}`));

  console.log("\n5) Curator notes");
  console.log(notes ? `   ${notes}` : "   (none)");

  console.log("\n6) Missing or uncertain fields (curator-declared + pre-flight)");
  const lines = [...missingOrUncertain];
  if (dupWarnings.length) dupWarnings.forEach((w) => lines.push(`DUPLICATE CHECK: ${w}`));
  if (dryRun) lines.push("POST was skipped (--dry-run).");
  if (lines.length === 0) console.log("   (none listed)");
  else lines.forEach((x) => console.log(`   - ${x}`));

  console.log("\n7) API response status and body");
  if (dryRun) console.log("   (not sent — dry run)");
  else {
    console.log(`   HTTP ${httpStatus}`);
    console.log(typeof responseBody === "string" ? `   ${responseBody}` : `   ${JSON.stringify(responseBody, null, 2)}`);
  }
  console.log("====================================\n");
}

async function main() {
  const argv = process.argv.slice(2);
  const { dryRun, force, payloadPath } = parseArgs(argv);
  if (!payloadPath) {
    console.error(
      "Usage: npm run ingest:listing -- [--dry-run] [--force] <path-to-payload.json>\n" +
        "  --dry-run   validate + dedupe only, no POST\n" +
        "  --force     POST even if public catalog reports possible duplicate id/name overlap",
    );
    process.exit(1);
  }

  const { operations, sourceUrls, notes, missingOrUncertain } = loadPayload(payloadPath);
  const body = { operations };
  const endpoint = `${BASE}/api/ingest`;

  console.log("--- BudapestNight ingest automation ---\n");
  console.log("Base:", BASE);
  console.log("Operations:", operations.length);

  const validationErrors = validateOperations(operations);
  if (validationErrors.length) {
    console.error("\nValidation failed:\n", validationErrors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log("Document validation: OK");

  const [pr, mr] = await Promise.all([fetchJson(`${BASE}/api/public/providers`), fetchJson(`${BASE}/api/public/meetup-groups`)]);

  const providers = Array.isArray(pr.body) ? pr.body : [];
  const meetups = Array.isArray(mr.body) ? mr.body : [];
  console.log(`Public catalog: providers HTTP ${pr.status} (${providers.length} rows); meetups HTTP ${mr.status} (${meetups.length} rows)`);

  const upserts = collectUpserts(operations);
  const dupWarnings = checkDuplicates(upserts, providers, meetups);
  if (dupWarnings.length && !force) {
    console.error("\nDuplicate / overlap against public catalog (aborting). Re-run with --force to POST anyway:\n");
    dupWarnings.forEach((w) => console.error(`  - ${w}`));
    printIngestReport({
      endpoint,
      body,
      sourceUrls,
      notes,
      missingOrUncertain,
      dupWarnings,
      upserts,
      httpStatus: 0,
      responseBody: { aborted: true, reason: "duplicate_catalog_overlap" },
      dryRun: true,
    });
    process.exit(1);
  }
  if (dupWarnings.length && force) {
    console.warn("\n--force: posting despite duplicate warnings:");
    dupWarnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (dryRun) {
    printIngestReport({
      endpoint,
      body,
      sourceUrls,
      notes,
      missingOrUncertain,
      dupWarnings,
      upserts,
      httpStatus: 0,
      responseBody: {},
      dryRun: true,
    });
    process.exit(0);
  }

  if (!KEY) {
    console.error("Missing INGEST_API_KEY (set in .env or .env.local).");
    process.exit(1);
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const resText = await res.text();
  let resJson;
  try {
    resJson = JSON.parse(resText);
  } catch {
    resJson = resText;
  }

  printIngestReport({
    endpoint,
    body,
    sourceUrls,
    notes,
    missingOrUncertain,
    dupWarnings,
    upserts,
    httpStatus: res.status,
    responseBody: resJson,
    dryRun: false,
  });

  if (!res.ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
