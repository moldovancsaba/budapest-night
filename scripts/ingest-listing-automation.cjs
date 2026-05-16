#!/usr/bin/env node
/**
 * BudapestNight curator ingest automation
 *
 * Curator workflow (you research; this script validates, dedupes, POSTs, reports):
 * 1. Find one Budapest nightlife/culture listing from an official or highly reliable source.
 * 2. Author `scripts/ingest-payloads/<name>.json` with `operations`, `sourceUrls`,
 *    optional `notes`, optional `missingOrUncertain` (string array).
 * 3. Run: `npm run ingest:listing -- [--dry-run] [--force] <payload.json>`
 *
 * Before POST (unless `--force` when duplicates were detected):
 * - Fetches public catalogs for id/name overlap checks.
 * - Validates provider / event / meetupGroup upsert documents; **raster image URLs must be https on imgbb.com** (or empty).
 * - Provider upserts require `locales` for hu, es, it, he, ar (see `src/lib/curator/localeIngestRules.ts`).
 * - Event upserts require locales + HUF/EUR entryFees rules + **unique per-show ImgBB image** (not host `provider.image`); see `src/lib/curator/eventIngestRules.ts` and `scripts/cursor-curator-events-prompt.txt`. Gold examples: `seed-timed-events-moby-sting.json`, `cursor-curated-events-lp-idles-oliver-tree-2026.json`.
 * - Menu items/sections require `locales` for hu, es, it, he, ar on every menu patch/upsert (see `src/lib/curator/menuLocaleIngestRules.ts`).
 * - `provider` + `patch` is validated (menu, eventOfferings, optional provider locales) — not only upserts.
 * - Use `--skip-locale-check` only for legacy payloads (skips provider profile locales on upsert/patch; menu translations still required).
 *
 * Env: `INGEST_API_KEY` (required unless `--dry-run`), optional `INGEST_BASE_URL`
 * (default https://budapest-night.vercel.app). Loads `.env` then `.env.local`.
 *
 * Payload shape:
 *   { "sourceUrls": [], "notes": "", "missingOrUncertain": [],
 *     "operations": [ { "resource": "provider"|"event"|"meetupGroup", "action": "upsert", "document": {} } ]
 *   }
 *   or a single operation `{ "resource", "action", "document", ... }`.
 */

require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { validateProviderLocalesForIngest } = require("./lib/provider-locale-ingest.cjs");
const { validateEventLocalesForIngest } = require("./lib/event-locale-ingest.cjs");
const {
  validateMenuItemLocalesForIngest,
  validateMenuSectionLocalesForIngest,
} = require("./lib/menu-locale-ingest.cjs");
const { validateCanonicalProvider, validateCanonicalEvent } = require("./lib/budapest-location.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();

const CATEGORIES = ["Venues", "Parties", "Restaurants", "Cafés"];
const BOROUGHS = ["Belváros", "Terézváros", "Erzsébetváros", "Ferencváros", "Buda", "Óbuda", "Újbuda"];
const AGE_RANGES = ["All ages", "Family", "18+", "21+", "Late night"];
const DAY_TAGS = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"];
const BADGES = ["Featured", "Popular", "New", "Staff Pick", "Hidden Gem", "Weekend Vibes"];
const MENU_TAGS = [
  "palinka",
  "wine",
  "beer",
  "craft-beer",
  "cocktail",
  "coffee",
  "specialty-coffee",
  "goulash",
  "hungarian",
  "street-food",
  "dessert",
  "vegan",
  "vegetarian",
  "ruin-bar",
  "rooftop",
  "danube-view",
];
const MENU_ITEM_KINDS = ["food", "drink", "other"];
const MENU_CURRENCIES = ["HUF", "EUR"];

const MEETUP_TYPES = ["Art & Gallery", "Live Culture", "Food & Wine Circle", "Nightlife Crew", "Local Creators"];
const MEETUP_AGES = ["All ages", "18+", "21+", "Family", "Late night"];
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
  const skipLocaleCheck = argv.includes("--skip-locale-check");
  const files = argv.filter((a) => !a.startsWith("-"));
  return { dryRun, force, skipLocaleCheck, payloadPath: files[0] || null };
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

function validateProvider(doc, idx, { skipLocaleCheck = false } = {}) {
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
  if (typeof doc.phone !== "string") errors.push(`${p}: phone must be string (empty ok)`);
  if (doc.bookingEnabled !== undefined && typeof doc.bookingEnabled !== "boolean") errors.push(`${p}: bookingEnabled must be boolean`);
  if (!skipLocaleCheck) {
    errors.push(...validateProviderLocalesForIngest(doc.locales, p));
  }
  if (doc.menu !== undefined) errors.push(...validateVenueMenu(doc.menu, `${p}.menu`));
  if (doc.eventOfferings !== undefined) errors.push(...validateEventOfferings(doc.eventOfferings, p));
  if (doc.menuTags !== undefined) errors.push(`${p}: do not send menuTags (computed on ingest)`);
  errors.push(...validateCanonicalProvider(doc, p));
  return errors;
}

function validateVenueMenu(menu, prefix) {
  const errors = [];
  if (!menu || typeof menu !== "object") {
    errors.push(`${prefix}: must be object`);
    return errors;
  }
  if (!Array.isArray(menu.sections)) errors.push(`${prefix}: sections must be array`);
  else {
    menu.sections.forEach((sec, si) => {
      if (!sec || typeof sec !== "object") errors.push(`${prefix}.sections[${si}]: invalid`);
      else {
        if (!sec.id || !sec.title) errors.push(`${prefix}.sections[${si}]: id and title required`);
        errors.push(...validateMenuSectionLocalesForIngest(sec.locales, `${prefix}.sections[${si}]`));
        if (!Array.isArray(sec.items)) errors.push(`${prefix}.sections[${si}].items must be array`);
        else
          sec.items.forEach((item, ii) => {
            errors.push(...validateMenuItem(item, `${prefix}.sections[${si}].items[${ii}]`));
          });
      }
    });
  }
  if (!menu.lastVerifiedAt) errors.push(`${prefix}: lastVerifiedAt required (YYYY-MM-DD)`);
  if (!Array.isArray(menu.sourceUrls)) errors.push(`${prefix}: sourceUrls must be array`);
  if (menu.venueLink !== undefined) {
    errors.push(`${prefix}: do not send venueLink (computed on ingest from provider id)`);
  }
  return errors;
}

function validateEventOfferings(offerings, p) {
  const errors = [];
  if (!Array.isArray(offerings)) {
    errors.push(`${p}: eventOfferings must be array`);
    return errors;
  }
  offerings.forEach((ev, ei) => {
    if (!ev || typeof ev !== "object") errors.push(`${p}.eventOfferings[${ei}]: invalid`);
    else {
      if (!ev.id || !ev.title) errors.push(`${p}.eventOfferings[${ei}]: id and title required`);
      if (!Array.isArray(ev.items)) errors.push(`${p}.eventOfferings[${ei}].items must be array`);
      else ev.items.forEach((item, ii) => errors.push(...validateMenuItem(item, `${p}.eventOfferings[${ei}].items[${ii}]`)));
    }
  });
  return errors;
}

function validateMenuItem(item, prefix) {
  const errors = [];
  if (!item || typeof item !== "object") {
    errors.push(`${prefix}: invalid`);
    return errors;
  }
  if (!item.name) errors.push(`${prefix}: name required`);
  errors.push(...validateMenuItemLocalesForIngest(item.locales, prefix));
  if (item.kind && !MENU_ITEM_KINDS.includes(item.kind)) errors.push(`${prefix}: invalid kind`);
  if (item.tags) {
    if (!Array.isArray(item.tags)) errors.push(`${prefix}: tags must be array`);
    else for (const t of item.tags) if (!MENU_TAGS.includes(t)) errors.push(`${prefix}: invalid tag "${t}"`);
  }
  if (item.price) {
    if (typeof item.price.amount !== "number") errors.push(`${prefix}.price.amount must be number`);
    if (item.price.currency && !MENU_CURRENCIES.includes(item.price.currency)) errors.push(`${prefix}: invalid currency`);
    if (item.price.source && !["published", "estimated"].includes(item.price.source)) errors.push(`${prefix}: invalid price.source`);
  }
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
  if (doc.venueIds !== undefined) {
    if (!Array.isArray(doc.venueIds)) errors.push(`${p}: venueIds must be an array when set`);
    else {
      doc.venueIds.forEach((vid, vi) => {
        if (typeof vid !== "string" || !/^prov-[a-z0-9-]+$/.test(vid)) {
          errors.push(`${p}.venueIds[${vi}]: must match prov-...`);
        }
      });
    }
  }
  if (doc.eventIds !== undefined) {
    if (!Array.isArray(doc.eventIds)) errors.push(`${p}: eventIds must be an array when set`);
    else {
      doc.eventIds.forEach((eid, ei) => {
        if (typeof eid !== "string" || !/^event-[a-z0-9-]+$/.test(eid)) {
          errors.push(`${p}.eventIds[${ei}]: must match event-...`);
        }
      });
    }
  }
  if (doc.venueLinks !== undefined) {
    errors.push(`${p}: do not send venueLinks — computed on ingest from linked providers`);
  }
  if (doc.eventLinks !== undefined) {
    errors.push(`${p}: do not send eventLinks — computed on ingest from linked timed events`);
  }
  return errors;
}

function validateEvent(doc, idx, { skipLocaleCheck = false, providersById } = {}) {
  const errors = [];
  const p = `operations[${idx}] event`;
  if (!doc || typeof doc !== "object") {
    errors.push(`${p}: missing document`);
    return errors;
  }
  mustString(doc, "id", errors);
  mustString(doc, "title", errors);
  mustString(doc, "startsAt", errors);
  mustString(doc, "endsAt", errors);
  if (!Array.isArray(doc.venueIds) || doc.venueIds.length === 0) errors.push(`${p}: venueIds required`);
  else {
    doc.venueIds.forEach((vid, vi) => {
      if (typeof vid !== "string" || !/^prov-[a-z0-9-]+$/.test(vid)) {
        errors.push(`${p}.venueIds[${vi}]: must match prov-... (primary host first)`);
      }
    });
  }
  if (doc.venueLinks !== undefined) {
    errors.push(`${p}: do not send venueLinks — computed on ingest from linked providers`);
  }
  mustString(doc, "borough", errors);
  if (doc.borough && !BOROUGHS.includes(doc.borough)) errors.push(`${p}: invalid borough`);
  mustString(doc, "neighborhood", errors);
  if (!Array.isArray(doc.entryFees)) errors.push(`${p}: entryFees must be array`);
  else {
    const CURRENCIES = ["HUF", "EUR", "FREE"];
    doc.entryFees.forEach((fee, fi) => {
      if (!fee || typeof fee !== "object") {
        errors.push(`${p}.entryFees[${fi}]: invalid`);
        return;
      }
      if (!CURRENCIES.includes(fee.currency)) {
        errors.push(`${p}.entryFees[${fi}].currency: must be HUF, EUR, or FREE`);
      }
      if (fee.amount > 0 && fee.currency === "FREE") {
        errors.push(`${p}.entryFees[${fi}]: paid amount with currency FREE — use HUF or EUR`);
      }
      if (fee.amount === 0 && fee.currency !== "FREE" && fee.currency !== undefined) {
        errors.push(`${p}.entryFees[${fi}]: amount 0 requires currency FREE or omit tier`);
      }
    });
  }
  if (!Array.isArray(doc.ageRanges) || !doc.ageRanges.length) errors.push(`${p}: ageRanges required`);
  if (!Array.isArray(doc.dayTimeTags) || !doc.dayTimeTags.length) errors.push(`${p}: dayTimeTags required`);
  if (typeof doc.image !== "string") errors.push(`${p}: image must be string (empty ok)`);
  else if (doc.image.trim() && !isImgBbHttpsImageUrl(doc.image)) errors.push(`${p}: image must be empty or https ImgBB`);
  if (!skipLocaleCheck) {
    errors.push(...validateEventLocalesForIngest(doc.locales, p));
  }
  errors.push(...validateCanonicalEvent(doc, p, providersById));
  return errors;
}

function validateEventPatch(op, idx, { skipLocaleCheck = false, providersById, providerIdsInPayload, knownProviderIds } = {}) {
  const errors = [];
  const p = `operations[${idx}] event.patch`;
  if (typeof op.id !== "string" || !op.id.trim()) {
    errors.push(`${p}: id required (event-...)`);
  } else if (!/^event-[a-z0-9-]+$/.test(op.id)) {
    errors.push(`${p}: id must match event-...`);
  }
  const patch = op.patch;
  if (!patch || typeof patch !== "object") {
    errors.push(`${p}: patch object required`);
    return errors;
  }
  if (Object.keys(patch).length === 0) errors.push(`${p}: patch must not be empty`);
  if (patch.id !== undefined) errors.push(`${p}: do not include id inside patch (use operation id)`);
  if (patch.venueLinks !== undefined) errors.push(`${p}: do not send venueLinks (computed on ingest)`);
  if (patch.venueIds !== undefined) {
    if (!Array.isArray(patch.venueIds) || patch.venueIds.length === 0) {
      errors.push(`${p}: venueIds must be a non-empty array`);
    } else {
      patch.venueIds.forEach((vid, vi) => {
        if (typeof vid !== "string" || !/^prov-[a-z0-9-]+$/.test(vid)) {
          errors.push(`${p}.venueIds[${vi}]: must match prov-... (primary host first)`);
        }
      });
      errors.push(...validateCanonicalEvent({ venueIds: patch.venueIds, borough: patch.borough }, p, providersById));
      for (const vid of patch.venueIds) {
        if (
          typeof vid === "string" &&
          providerIdsInPayload &&
          knownProviderIds &&
          !providerIdsInPayload.has(vid) &&
          !knownProviderIds.has(vid)
        ) {
          errors.push(`${p}: venueId ${vid} not in catalog — upsert provider before this patch in operations[]`);
        }
      }
    }
  }
  if (patch.locales !== undefined && !skipLocaleCheck) {
    errors.push(...validateEventLocalesForIngest(patch.locales, p));
  }
  return errors;
}

function validateProviderPatch(op, idx, { skipLocaleCheck = false } = {}) {
  const errors = [];
  const p = `operations[${idx}] provider.patch`;
  if (typeof op.id !== "string" || !op.id.trim()) {
    errors.push(`${p}: id required (prov-...)`);
  } else if (!/^prov-[a-z0-9-]+$/.test(op.id)) {
    errors.push(`${p}: id must match prov-...`);
  }
  const patch = op.patch;
  if (!patch || typeof patch !== "object") {
    errors.push(`${p}: patch object required`);
    return errors;
  }
  if (Object.keys(patch).length === 0) errors.push(`${p}: patch must not be empty`);
  if (patch.id !== undefined) errors.push(`${p}: do not include id inside patch (use operation id)`);
  if (patch.menuTags !== undefined) errors.push(`${p}: do not send menuTags (computed on ingest)`);
  if (patch.menu !== undefined) errors.push(...validateVenueMenu(patch.menu, `${p}.menu`));
  if (patch.eventOfferings !== undefined) errors.push(...validateEventOfferings(patch.eventOfferings, p));
  if (patch.locales !== undefined && !skipLocaleCheck) {
    errors.push(...validateProviderLocalesForIngest(patch.locales, p));
  }
  if (patch.image !== undefined) {
    if (typeof patch.image !== "string") errors.push(`${p}: image must be string (empty ok)`);
    else if (patch.image.trim() && !isImgBbHttpsImageUrl(patch.image)) {
      errors.push(`${p}: image must be empty or https ImgBB (i.ibb.co)`);
    }
  }
  if (patch.galleryImages !== undefined && !Array.isArray(patch.galleryImages)) {
    errors.push(`${p}: galleryImages must be array or omitted`);
  } else if (Array.isArray(patch.galleryImages)) {
    patch.galleryImages.forEach((g, gi) => {
      if (typeof g === "string" && g.trim() && !isImgBbHttpsImageUrl(g)) {
        errors.push(`${p}: galleryImages[${gi}] must be https ImgBB URL`);
      }
    });
  }
  if (typeof op.id === "string" && op.id) {
    errors.push(...validateCanonicalProvider({ id: op.id, ...patch }, p));
  }
  return errors;
}

function validateMeetupPatch(op, idx) {
  const errors = [];
  const p = `operations[${idx}] meetupGroup patch`;
  if (typeof op.id !== "string" || !op.id) errors.push(`${p}: id string required`);
  const patch = op.patch;
  if (!patch || typeof patch !== "object") {
    errors.push(`${p}: patch object required`);
    return errors;
  }
  if (Object.keys(patch).length === 0) errors.push(`${p}: patch must not be empty`);
  if (patch.id !== undefined) errors.push(`${p}: do not include id inside patch`);
  if (patch.venueLinks !== undefined || patch.eventLinks !== undefined) {
    errors.push(`${p}: do not send venueLinks/eventLinks (computed on ingest)`);
  }
  if (patch.coverImageUrl !== undefined) {
    if (typeof patch.coverImageUrl !== "string") errors.push(`${p}: coverImageUrl must be string`);
    else if (patch.coverImageUrl.trim() && !isImgBbHttpsImageUrl(patch.coverImageUrl)) {
      errors.push(`${p}: coverImageUrl must be empty or https ImgBB URL`);
    }
  }
  return errors;
}

function validateOperations(operations, opts = {}) {
  const all = [];
  const providerIdsInPayload = new Set();
  const eventIdsInPayload = new Set();
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    if (!op || typeof op !== "object") {
      all.push(`operations[${i}]: not an object`);
      continue;
    }
    if (op.resource === "provider" && op.action === "upsert") {
      all.push(...validateProvider(op.document, i, opts));
      if (op.document?.id) providerIdsInPayload.add(op.document.id);
    } else if (op.resource === "provider" && op.action === "patch") {
      all.push(...validateProviderPatch(op, i, opts));
      if (typeof op.id === "string" && op.id) providerIdsInPayload.add(op.id);
    } else if (op.resource === "meetupGroup" && op.action === "upsert") {
      all.push(...validateMeetup(op.document, i));
    } else if (op.resource === "meetupGroup" && op.action === "patch") {
      all.push(...validateMeetupPatch(op, i));
    } else if (op.resource === "event" && op.action === "patch") {
      all.push(...validateEventPatch(op, i, { ...opts, providerIdsInPayload }));
    } else if (op.resource === "event" && op.action === "upsert") {
      all.push(...validateEvent(op.document, i, opts));
      if (op.document?.id) eventIdsInPayload.add(op.document.id);
      const ids = op.document?.venueIds;
      if (Array.isArray(ids)) {
        for (const vid of ids) {
          if (typeof vid === "string" && !providerIdsInPayload.has(vid) && opts.knownProviderIds && !opts.knownProviderIds.has(vid)) {
            all.push(
              `${`operations[${i}]`} event: venueId ${vid} not in catalog — upsert provider before this event in operations[]`,
            );
          }
        }
      }
    } else if (op.action === "upsert") {
      all.push(`operations[${i}]: unsupported upsert resource ${String(op.resource)}`);
    } else if (op.action === "patch") {
      all.push(
        `operations[${i}]: unsupported patch resource ${String(op.resource)} (supported: provider, event, meetupGroup)`,
      );
    }
  }
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    if (op?.resource !== "meetupGroup" || op?.action !== "upsert") continue;
    const doc = op.document;
    const p = `operations[${i}] meetupGroup`;
    for (const vid of doc?.venueIds ?? []) {
      if (
        typeof vid === "string" &&
        !providerIdsInPayload.has(vid) &&
        opts.knownProviderIds &&
        !opts.knownProviderIds.has(vid)
      ) {
        all.push(`${p}: venueId ${vid} not in catalog — upsert provider before this meetup in operations[]`);
      }
    }
    for (const eid of doc?.eventIds ?? []) {
      if (
        typeof eid === "string" &&
        !eventIdsInPayload.has(eid) &&
        opts.knownEventIds &&
        !opts.knownEventIds.has(eid)
      ) {
        all.push(`${p}: eventId ${eid} not in catalog — upsert timed event before this meetup in operations[]`);
      }
    }
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
  const { dryRun, force, skipLocaleCheck, payloadPath } = parseArgs(argv);
  if (!payloadPath) {
    console.error(
      "Usage: npm run ingest:listing -- [--dry-run] [--force] [--skip-locale-check] <path-to-payload.json>\n" +
        "  --dry-run            validate + dedupe only, no POST\n" +
        "  --force              POST even if public catalog reports possible duplicate id/name overlap\n" +
        "  --skip-locale-check  legacy payloads without locales.hu|es|it|he|ar (avoid for new listings)",
    );
    process.exit(1);
  }

  const { operations, sourceUrls, notes, missingOrUncertain } = loadPayload(payloadPath);
  const body = { operations };
  const endpoint = `${BASE}/api/ingest`;

  console.log("--- BudapestNight ingest automation ---\n");
  console.log("Base:", BASE);
  console.log("Operations:", operations.length);

  const [pr, er, mr] = await Promise.all([
    fetchJson(`${BASE}/api/public/providers`),
    fetchJson(`${BASE}/api/public/events`),
    fetchJson(`${BASE}/api/public/meetup-groups`),
  ]);

  const providers = Array.isArray(pr.body) ? pr.body : [];
  const events = Array.isArray(er.body) ? er.body : [];
  const meetups = Array.isArray(mr.body) ? mr.body : [];
  console.log(
    `Public catalog: providers HTTP ${pr.status} (${providers.length}); events HTTP ${er.status} (${events.length}); meetups HTTP ${mr.status} (${meetups.length})`,
  );

  const knownProviderIds = new Set(providers.map((p) => p.id).filter(Boolean));
  const knownEventIds = new Set(events.map((e) => e.id).filter(Boolean));
  const providersById = new Map(providers.map((p) => [p.id, p]));
  const validationErrors = validateOperations(operations, {
    skipLocaleCheck,
    knownProviderIds,
    knownEventIds,
    providersById,
  });
  if (validationErrors.length) {
    console.error("\nValidation failed:\n", validationErrors.map((e) => `  - ${e}`).join("\n"));
    process.exit(1);
  }
  console.log("Document validation: OK");

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
