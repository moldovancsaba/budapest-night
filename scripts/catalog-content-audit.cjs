#!/usr/bin/env node
/**
 * Full catalog content audit — collects every known error class from production fixes.
 *
 *   node scripts/catalog-content-audit.cjs              # static + live URL checks
 *   node scripts/catalog-content-audit.cjs --skip-urls  # static only (fast)
 *   node scripts/catalog-content-audit.cjs --json       # stdout JSON only
 *
 * Writes:
 *   scripts/catalog-audit-report.json
 *   scripts/catalog-audit-findings.md
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const {
  LEGACY_PROVIDER_ID_ALIASES,
  validateCanonicalProvider,
  validateCanonicalEvent,
  locationNeedsFix,
  suggestProviderLocation,
  auditProviderLocationFields,
  buildAddressPeerIndex,
  normalizeAddressKey,
} = require("./lib/budapest-location.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const OUT_JSON = path.join(__dirname, "catalog-audit-report.json");
const OUT_MD = path.join(__dirname, "catalog-audit-findings.md");
const CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 12000;

/** Past production incidents — keep in sync with src/lib/curator/imageIngestRules.ts */
const BANNED_IMGBB_HASHES = [
  "cde3b78d5c56",
  "cb56a463140e",
  "cf91ad578e08",
  "5e673e7e0093",
  "038fd3264859",
];

/** Domains known dead or replaced — scan website + Sources: text */
const STALE_DOMAIN_PATTERNS = [
  { pattern: /kioskbudapest\.com/i, replacement: "kiosk-budapest.hu", label: "Kiosk rebrand" },
];

/** imageSource on another host is OK when venue site uses these CDNs */
const ALLOWED_IMAGE_SOURCE_HOSTS = new Set([
  "cdn.prod.website-files.com",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
]);

const MENU_CATEGORIES = new Set(["Restaurants", "Cafés", "Parties"]);

/**
 * @type {Record<string, { severity: string, category: string, title: string, description: string, remediation: string }>}
 */
const FINDING_CATALOG = {
  website_unreachable: {
    severity: "high",
    category: "contact",
    title: "Website does not load",
    description: "Homepage returns 4xx/5xx, DNS failure, or timeout (HEAD/GET).",
    remediation: "Find current domain on Maps/Instagram; patch website, email, Sources:, and menu URLs.",
  },
  website_empty: {
    severity: "high",
    category: "contact",
    title: "Missing website",
    description: "Provider has no website URL.",
    remediation: "Add official https URL from venue contact page.",
  },
  email_domain_mismatch: {
    severity: "medium",
    category: "contact",
    title: "Email domain ≠ website",
    description: "Contact email hostname does not match website hostname.",
    remediation: "Use info@ on the same domain as website (e.g. info@kiosk-budapest.hu).",
  },
  sources_host_mismatch: {
    severity: "medium",
    category: "copy",
    title: "Sources: URLs on wrong host",
    description: "longDescription Sources: lists a hostname different from website (excluding ticket subdomains).",
    remediation: "Align all Sources: URLs with the live website domain.",
  },
  sources_missing: {
    severity: "low",
    category: "copy",
    title: "Missing Sources: block",
    description: "longDescription has no Sources: https://... audit line.",
    remediation: "Append Sources: with official URLs used for the listing.",
  },
  stale_domain_in_copy: {
    severity: "high",
    category: "contact",
    title: "Stale / dead domain in text",
    description: "Known retired domain still in website or description (e.g. kioskbudapest.com).",
    remediation: "Replace with current official domain everywhere.",
  },
  legacy_provider_id: {
    severity: "critical",
    category: "identity",
    title: "Retired provider id",
    description: "Row still uses a migrated-away prov-* id.",
    remediation: "Rename via migrate-legacy-venue-provider-ids.cjs or patch to canonical id.",
  },
  canonical_location_mismatch: {
    severity: "high",
    category: "location",
    title: "Wrong borough / neighborhood / address",
    description: "Does not match CANONICAL_BY_ID or street-based inference (e.g. Budapest Park in Óbuda).",
    remediation: "Patch borough, neighborhood, address from official source; run location fix scripts.",
  },
  postal_borough_mismatch: {
    severity: "high",
    category: "location",
    title: "Postal code ≠ borough",
    description: "Budapest postal code or street landmark implies a different app borough than the row.",
    remediation: "Fix per scripts/cursor-curator-location-rules.txt; register postal in budapest-location-registry.json; run npm run audit:locations.",
  },
  postal_not_registered: {
    severity: "critical",
    category: "location",
    title: "Postal code not in registry",
    description: "Address postal is missing from src/data/budapest-location-registry.json.",
    remediation: "Add postalToAppBorough row with kerulet + appBorough before ingest.",
  },
  neighborhood_not_in_borough: {
    severity: "high",
    category: "location",
    title: "Neighborhood not in borough",
    description: "Neighborhood label is not listed under that borough in locations reference data.",
    remediation: "Pick a neighborhood from src/data/locations.ts for the correct borough.",
  },
  landmark_neighborhood_mismatch: {
    severity: "critical",
    category: "location",
    title: "Wrong area label for address",
    description: "e.g. Csörsz utca 18 (MOM / 1124 XII. ker.) labeled as Infopark (1117 office park, different area).",
    remediation: "Use Buda, MOM Park; fix copy that says Infopark.",
  },
  duplicate_address_inconsistent: {
    severity: "high",
    category: "location",
    title: "Same address, different districts",
    description: "Multiple providers share one street address but use conflicting borough/neighborhood.",
    remediation: "Align all rows at that address to one canonical borough/neighborhood.",
  },
  forbidden_district_copy: {
    severity: "high",
    category: "location",
    title: "Wrong district in description",
    description: "Copy mentions Óbuda Island / Újbuda for a Ferencváros or Terézváros venue.",
    remediation: "Rewrite descriptions; sync events hosted at that venue.",
  },
  canonical_website_mismatch: {
    severity: "medium",
    category: "contact",
    title: "Wrong official website for venue",
    description: "MVM Dome or Budapest Park website is not the canonical .hu domain.",
    remediation: "Set venue website to mvm-dome.hu / budapestpark.hu; put promoters on events only.",
  },
  image_empty: {
    severity: "high",
    category: "image",
    title: "Missing image",
    description: "Empty image / coverImageUrl.",
    remediation: "Upload venue-appropriate photo via ingest/upload; unique ImgBB URL.",
  },
  image_not_imgbb: {
    severity: "high",
    category: "image",
    title: "Image not on ImgBB",
    description: "URL is not https i.ibb.co / *.ibb.co.",
    remediation: "Download official asset, upload, store returned ImgBB URL.",
  },
  banned_imgbb_hash: {
    severity: "critical",
    category: "image",
    title: "Banned ImgBB hash",
    description: "Reuses a known-bad filename from bulk mistakes (concert art, park generic, etc.).",
    remediation: "Replace with venue-specific upload; never reuse cde3b78d5c56, cb56a463140e, …",
  },
  duplicate_provider_image: {
    severity: "high",
    category: "image",
    title: "Duplicate provider image",
    description: "Same ImgBB URL on multiple providers.",
    remediation: "One unique upload per provider row.",
  },
  duplicate_meetup_cover: {
    severity: "high",
    category: "image",
    title: "Duplicate culture circle cover",
    description: "Same coverImageUrl on multiple meetup groups.",
    remediation: "Distinct district/theme photo per grp-*.",
  },
  duplicate_event_image: {
    severity: "high",
    category: "image",
    title: "Duplicate event poster",
    description: "Same image on multiple timed events.",
    remediation: "Per-show poster from ticket page; unique ImgBB per event.",
  },
  image_shared_across_catalog: {
    severity: "critical",
    category: "image",
    title: "Same image on provider + event or meetup",
    description: "Concert poster on venue row, or one URL reused across listing types.",
    remediation: "Venue = interior/exterior; event = show art; meetup = district scene — all unique URLs.",
  },
  event_image_same_as_venue: {
    severity: "high",
    category: "image",
    title: "Event poster = venue card image",
    description: "Timed event image URL equals host provider image.",
    remediation: "Scrape per-show art from ticket URL for event.image only.",
  },
  meetup_cover_same_as_event: {
    severity: "high",
    category: "image",
    title: "Meetup cover = event poster",
    description: "Culture circle cover matches a timed event image.",
    remediation: "Upload dedicated coverImageUrl per meetup group.",
  },
  meetup_cover_same_as_venue: {
    severity: "medium",
    category: "image",
    title: "Meetup cover = venue image",
    description: "Culture circle cover matches a provider listing image.",
    remediation: "Use district/community scene, not a restaurant card photo.",
  },
  image_source_off_venue_site: {
    severity: "low",
    category: "image",
    description: "imageSource host differs from website (may be OK for Webflow/Wikimedia).",
    title: "imageSource off-domain",
    remediation: "Prefer hero from venue site; Webflow CDN and Commons are acceptable.",
  },
  unrelated_image_source: {
    severity: "high",
    category: "image",
    title: "imageSource from unrelated site",
    description: "imageSource hostname is not website, Webflow CDN, Wikimedia, or ImgBB.",
    remediation: "Re-scrape from official venue site; avoid random blogs/stock.",
  },
  possible_wrong_cuisine_copy: {
    severity: "medium",
    category: "copy",
    title: "Cuisine copy mismatch",
    description: "Mediterranean label on clearly Hungarian venue copy.",
    remediation: "Match cuisine to official positioning (e.g. modern Hungarian bistro).",
  },
  missing_menu: {
    severity: "medium",
    category: "menu",
    title: "No menu sections",
    description: "Restaurant/Café/Party venue without menu.sections for Eat & Drink.",
    remediation: "Patch menu from official /eteleink, /italaink, or menu board images.",
  },
  menu_tags_without_body: {
    severity: "low",
    category: "menu",
    title: "menuTags without items",
    description: "Computed menuTags present but no menu sections (orphan tags).",
    remediation: "Add full menu patch or clear stale tags via re-ingest.",
  },
  event_legacy_venue_id: {
    severity: "critical",
    category: "identity",
    title: "Event links retired venue id",
    description: "venueIds references prov-* alias that was migrated.",
    remediation: "Update venueIds to canonical id in same payload as provider rename.",
  },
  event_host_location_mismatch: {
    severity: "high",
    category: "location",
    title: "Event district ≠ host venue",
    description: "Event borough/neighborhood does not match canonical host location.",
    remediation: "Set event borough/neighborhood from primary host; fix host provider first.",
  },
  event_host_catalog_location_wrong: {
    severity: "high",
    category: "location",
    title: "Host venue still has wrong district in catalog",
    description: "Live host provider fails canonical location rules.",
    remediation: "Patch host provider before ingesting or patching events.",
  },
  suspicious_free_tickets: {
    severity: "medium",
    category: "events",
    title: "Paid show marked FREE",
    description: "Event has booking URL or paid-sounding title but entryFees use FREE with amount 0.",
    remediation: "Use HUF/EUR tiers from ticket page or empty entryFees + missingOrUncertain.",
  },
};

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function imgbbHash(url) {
  if (!url || typeof url !== "string") return "";
  const m = url.match(/\/([^/]+)\.(jpg|jpeg|png|webp|gif)/i);
  return m ? m[1] : "";
}

function isImgBb(url) {
  return /^https:\/\/([^/]+\.)?ibb\.co\//i.test(url || "");
}

function extractSourceHosts(longDescription) {
  const hosts = new Set();
  const block = String(longDescription || "").split("Sources:")[1] || "";
  for (const m of block.matchAll(/https?:\/\/[^\s)]+/gi) || []) {
    const h = hostOf(m[0]);
    if (h) hosts.add(h);
  }
  return [...hosts];
}

function issue(code, extra = {}) {
  const meta = FINDING_CATALOG[code] || {
    severity: "medium",
    category: "other",
    title: code,
    description: "",
    remediation: "",
  };
  return { code, severity: meta.severity, category: meta.category, ...extra };
}

async function checkUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return { ok: false, status: 0, error: "invalid" };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "BudapestNightCatalogAudit/1.0" },
    });
    clearTimeout(t);
    if ([403, 405].includes(res.status)) {
      const ctrl2 = new AbortController();
      const t2 = setTimeout(() => ctrl2.abort(), FETCH_TIMEOUT_MS);
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl2.signal,
        headers: { "User-Agent": "BudapestNightCatalogAudit/1.0" },
      });
      clearTimeout(t2);
    }
    return { ok: res.ok, status: res.status, finalUrl: res.url };
  } catch (e) {
    return { ok: false, status: 0, error: String(e.message || e) };
  }
}

async function mapPool(items, fn, limit) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function buildImageIndex(providers, events, meetups) {
  const byUrl = new Map();
  const add = (url, type, id, name) => {
    if (!url || !url.trim()) return;
    const list = byUrl.get(url) || [];
    list.push({ type, id, name });
    byUrl.set(url, list);
  };
  for (const p of providers) add(p.image, "provider", p.id, p.name);
  for (const e of events) add(e.image, "event", e.id, e.title);
  for (const m of meetups) add(m.coverImageUrl, "meetup", m.id, m.name);
  return byUrl;
}

function auditProvider(p, ctx) {
  const issues = [];
  const website = (p.website || "").trim();
  const websiteHost = hostOf(website);

  const addrKey = normalizeAddressKey(p.address);
  const duplicateAddressPeers =
    addrKey && ctx.addressPeerIndex
      ? (ctx.addressPeerIndex.get(addrKey) || []).filter((peer) => peer.id !== p.id)
      : [];

  for (const err of auditProviderLocationFields(p, { duplicateAddressPeers })) {
    issues.push(issue(err.code, { message: err.message, ...err }));
  }

  if (LEGACY_PROVIDER_ID_ALIASES[p.id]) {
    issues.push(issue("legacy_provider_id", { replaceWith: LEGACY_PROVIDER_ID_ALIASES[p.id] }));
  }

  for (const msg of validateCanonicalProvider(p, p.id)) {
    if (msg.includes("borough") || msg.includes("neighborhood") || msg.includes("address")) {
      issues.push(issue("canonical_location_mismatch", { message: msg }));
    } else if (msg.includes("wrong district")) {
      issues.push(issue("forbidden_district_copy", { message: msg }));
    } else if (msg.includes("website should")) {
      issues.push(issue("canonical_website_mismatch", { message: msg }));
    } else {
      issues.push(issue("canonical_location_mismatch", { message: msg }));
    }
  }

  const locFix = suggestProviderLocation(p);
  if (locFix && locFix.reason) {
    issues.push(
      issue("canonical_location_mismatch", {
        message: `Suggested: ${locFix.borough} / ${locFix.neighborhood}`,
        reason: locFix.reason,
      }),
    );
  }

  if (!website) issues.push(issue("website_empty"));
  else if (ctx.urlChecks) {
    const cached = ctx.websiteChecks.get(website);
    if (cached && !cached.ok) issues.push(issue("website_unreachable", { detail: cached }));
  }

  const emailHost = hostOf((p.email || "").split("@")[1] ? `https://${(p.email || "").split("@")[1]}` : "");
  if (emailHost && websiteHost && emailHost !== websiteHost && !emailHost.endsWith(`.${websiteHost}`)) {
    issues.push(issue("email_domain_mismatch", { emailHost, websiteHost }));
  }

  const sourceHosts = extractSourceHosts(p.longDescription);
  if (!/Sources:\s*https?:\/\//i.test(p.longDescription || "")) {
    issues.push(issue("sources_missing"));
  } else if (
    websiteHost &&
    sourceHosts.length &&
    !sourceHosts.every((h) => h === websiteHost || h.endsWith(`.${websiteHost}`))
  ) {
    issues.push(issue("sources_host_mismatch", { websiteHost, sourceHosts }));
  }

  for (const { pattern, label } of STALE_DOMAIN_PATTERNS) {
    if (pattern.test(website) || pattern.test(p.longDescription || "") || pattern.test(p.shortDescription || "")) {
      issues.push(issue("stale_domain_in_copy", { label }));
    }
  }

  const img = (p.image || "").trim();
  if (!img) issues.push(issue("image_empty"));
  else {
    if (!isImgBb(img)) issues.push(issue("image_not_imgbb", { url: img }));
    const hash = imgbbHash(img);
    if (BANNED_IMGBB_HASHES.some((b) => hash.includes(b))) issues.push(issue("banned_imgbb_hash", { hash }));
    const peers = ctx.imageIndex.get(img)?.filter((x) => x.type === "provider") || [];
    if (peers.length > 1) {
      issues.push(issue("duplicate_provider_image", { sharedWith: peers.filter((x) => x.id !== p.id) }));
    }
    const cross = ctx.imageIndex.get(img)?.filter((x) => x.type !== "provider") || [];
    if (cross.length) issues.push(issue("image_shared_across_catalog", { alsoUsedBy: cross }));
  }

  const imageSourceHost = hostOf(p.imageSource || "");
  if (imageSourceHost && websiteHost && imageSourceHost !== websiteHost) {
    if (ALLOWED_IMAGE_SOURCE_HOSTS.has(imageSourceHost)) {
      issues.push(issue("image_source_off_venue_site", { websiteHost, imageSourceHost }));
    } else if (!isImgBb(p.imageSource || "")) {
      issues.push(issue("unrelated_image_source", { websiteHost, imageSourceHost }));
    }
  }

  if (/Mediterranean/i.test(p.shortDescription || "") && /hungarian|goulash|paprik|modern magyar/i.test(`${p.name} ${p.longDescription}`)) {
    issues.push(issue("possible_wrong_cuisine_copy"));
  }

  if (MENU_CATEGORIES.has(p.category)) {
    const sections = p.menu?.sections?.length ?? 0;
    if (!sections) issues.push(issue("missing_menu"));
    if (p.menuTags && !sections) issues.push(issue("menu_tags_without_body"));
  }

  return { type: "provider", id: p.id, name: p.name, website, category: p.category, issues };
}

function auditEvent(e, ctx) {
  const issues = [];
  const hostId = e.venueIds?.[0];
  const host = hostId ? ctx.providersById.get(hostId) : null;

  for (const msg of validateCanonicalEvent(e, e.id, ctx.providersById)) {
    if (msg.includes("retired")) issues.push(issue("event_legacy_venue_id", { message: msg }));
    else if (msg.includes("host") && msg.includes("catalog")) {
      issues.push(issue("event_host_catalog_location_wrong", { message: msg }));
    } else issues.push(issue("event_host_location_mismatch", { message: msg }));
  }

  const img = (e.image || "").trim();
  if (!img) issues.push(issue("image_empty"));
  else {
    if (!isImgBb(img)) issues.push(issue("image_not_imgbb", { url: img }));
    const hash = imgbbHash(img);
    if (BANNED_IMGBB_HASHES.some((b) => hash.includes(b))) issues.push(issue("banned_imgbb_hash", { hash }));
    const eventPeers = ctx.imageIndex.get(img)?.filter((x) => x.type === "event") || [];
    if (eventPeers.length > 1) {
      issues.push(issue("duplicate_event_image", { sharedWith: eventPeers.filter((x) => x.id !== e.id) }));
    }
    if (host?.image && host.image === img) issues.push(issue("event_image_same_as_venue", { hostId }));
    const cross = ctx.imageIndex.get(img)?.filter((x) => x.type !== "event") || [];
    if (cross.length) issues.push(issue("image_shared_across_catalog", { alsoUsedBy: cross }));
  }

  const fees = e.entryFees || [];
  const hasFreeOnly =
    fees.length > 0 && fees.every((f) => f.currency === "FREE" || f.amount === 0);
  const looksPaid = /ticket|concert|festival|€|ft|huf/i.test(`${e.title} ${e.shortDescription} ${e.bookingUrl || ""}`);
  if (hasFreeOnly && looksPaid && (e.bookingUrl || "").trim()) {
    issues.push(issue("suspicious_free_tickets"));
  }

  return { type: "event", id: e.id, name: e.title, hostId, issues };
}

function auditMeetup(m, ctx) {
  const issues = [];
  const img = (m.coverImageUrl || "").trim();
  if (!img) issues.push(issue("image_empty"));
  else {
    if (!isImgBb(img)) issues.push(issue("image_not_imgbb", { url: img }));
    const hash = imgbbHash(img);
    if (BANNED_IMGBB_HASHES.some((b) => hash.includes(b))) issues.push(issue("banned_imgbb_hash", { hash }));
    const peers = ctx.imageIndex.get(img)?.filter((x) => x.type === "meetup") || [];
    if (peers.length > 1) {
      issues.push(issue("duplicate_meetup_cover", { sharedWith: peers.filter((x) => x.id !== m.id) }));
    }
    const events = ctx.imageIndex.get(img)?.filter((x) => x.type === "event") || [];
    if (events.length) issues.push(issue("meetup_cover_same_as_event", { sharedWith: events }));
    const venues = ctx.imageIndex.get(img)?.filter((x) => x.type === "provider") || [];
    if (venues.length) issues.push(issue("meetup_cover_same_as_venue", { sharedWith: venues }));
    const cross = ctx.imageIndex.get(img)?.filter((x) => x.type !== "meetup") || [];
    if (cross.length) issues.push(issue("image_shared_across_catalog", { alsoUsedBy: cross }));
  }
  return { type: "meetup", id: m.id, name: m.name, issues };
}

function summarizeRows(rows) {
  const byCode = {};
  const bySeverity = {};
  let totalFindings = 0;
  for (const row of rows) {
    for (const iss of row.issues) {
      byCode[iss.code] = (byCode[iss.code] || 0) + 1;
      bySeverity[iss.severity] = (bySeverity[iss.severity] || 0) + 1;
      totalFindings++;
    }
  }
  return { byCode, bySeverity, totalFindings, rowsWithFindings: rows.filter((r) => r.issues.length).length };
}

function renderMarkdown(report) {
  const lines = [
    "# Budapest Night — catalog content audit",
    "",
    `Generated: **${report.generatedAt}**`,
    `Base: ${report.baseUrl}`,
    `Live URL checks: **${report.options.liveUrlChecks ? "yes" : "no (static only)"}**`,
    "",
    "## Summary",
    "",
    "| Catalog | Total | Rows with issues |",
    "|---------|------:|-----------------:|",
    `| Providers | ${report.catalogCounts.providers} | ${report.providers.summary.rowsWithFindings} |`,
    `| Timed events | ${report.catalogCounts.events} | ${report.events.summary.rowsWithFindings} |`,
    `| Culture circles | ${report.catalogCounts.meetups} | ${report.meetups.summary.rowsWithFindings} |`,
    "",
    `**${report.totals.totalFindings}** findings across **${report.totals.rowsWithFindings}** rows.`,
    "",
    "### How to read this report",
    "",
    "- **`website_unreachable`** — Many `prov-cov-*` bulk rows fail automated HEAD/GET (404, bot blocks). **Manually verify** on Maps before deleting; prioritize rows with wrong copy or images.",
    "- **`image_source_off_venue_site`** — Often **OK** when the venue uses Webflow (`cdn.prod.website-files.com`) or Wikimedia fixes.",
    "- **`missing_menu`** — Expected for most coverage-wave restaurants until menu curator batches land.",
    "- **Location** (`postal_borough_mismatch`, `landmark_neighborhood_mismatch`, `duplicate_address_inconsistent`) — run `node scripts/fix-venue-locations.cjs` then ingest `scripts/ingest-payloads/venue-location-fix.json`.",
    "- **Critical image/identity issues** (`banned_imgbb_hash`, `duplicate_*`, `legacy_provider_id`, `stale_domain_in_copy`) — fix first; none flagged means production is clean on those checks.",
    "",
    "### By severity",
    "",
  ];
  for (const [sev, n] of Object.entries(report.totals.bySeverity).sort()) {
    lines.push(`- **${sev}**: ${n}`);
  }
  lines.push("", "### By issue code", "", "| Count | Severity | Code | Title |", "|------:|----------|------|-------|");
  const sortedCodes = Object.entries(report.totals.byCode).sort((a, b) => b[1] - a[1]);
  for (const [code, count] of sortedCodes) {
    const meta = FINDING_CATALOG[code];
    lines.push(`| ${count} | ${meta?.severity || "?"} | \`${code}\` | ${meta?.title || code} |`);
  }

  lines.push("", "## Finding reference (from production incidents)", "");
  for (const [code, meta] of Object.entries(FINDING_CATALOG)) {
    lines.push(`### \`${code}\` (${meta.severity})`, "", meta.description, "", `**Fix:** ${meta.remediation}`, "");
  }

  const section = (title, rows) => {
    lines.push(`## ${title}`, "");
    if (!rows.length) {
      lines.push("_No rows flagged._", "");
      return;
    }
    for (const row of rows) {
      const codes = row.issues.map((i) => i.code).join(", ");
      lines.push(`### ${row.id} — ${row.name}`, "", `Issues: ${codes}`, "");
      for (const iss of row.issues) {
        lines.push(`- **${iss.code}** (${iss.severity})`);
        if (iss.message) lines.push(`  - ${iss.message}`);
        if (iss.detail) lines.push(`  - HTTP ${iss.detail.status || "?"} ${iss.detail.error || iss.detail.finalUrl || ""}`);
        if (iss.sharedWith?.length) {
          lines.push(`  - Shared with: ${iss.sharedWith.map((s) => s.id).join(", ")}`);
        }
        if (iss.alsoUsedBy?.length) {
          lines.push(`  - Also used by: ${iss.alsoUsedBy.map((s) => `${s.type}:${s.id}`).join(", ")}`);
        }
      }
      lines.push("");
    }
  };

  section("Providers (flagged)", report.providers.flagged);
  section("Timed events (flagged)", report.events.flagged);
  section("Culture circles (flagged)", report.meetups.flagged);

  lines.push("## Repair commands", "", "```bash", "# Re-run audit", "npm run audit:catalog", "", "# Single venue (image + contact)", "node scripts/fix-provider-one.cjs <prov-id>", "", "# Batch images", "npm run db:patch-venue-meetup-images", "npm run db:patch-event-images", "", "# Kiosk-style full patch", "node scripts/patch-kiosk-budapest.cjs", "```", "");

  return lines.join("\n");
}

async function main() {
  const skipUrls = process.argv.includes("--skip-urls");
  const asJson = process.argv.includes("--json");

  const [provRes, eventRes, meetRes] = await Promise.all([
    fetch(`${BASE}/api/public/providers`),
    fetch(`${BASE}/api/public/events`),
    fetch(`${BASE}/api/public/meetup-groups`),
  ]);
  const providers = await provRes.json();
  const events = await eventRes.json();
  const meetups = await meetRes.json();

  const providersById = new Map(providers.map((p) => [p.id, p]));
  const rawAddressIndex = buildAddressPeerIndex(providers);
  const addressPeerIndex = new Map();
  for (const [key, list] of rawAddressIndex) {
    addressPeerIndex.set(key, list);
  }
  const imageIndex = buildImageIndex(providers, events, meetups);

  const websiteChecks = new Map();
  if (!skipUrls) {
    const uniqueWebsites = [...new Set(providers.map((p) => (p.website || "").trim()).filter(Boolean))];
    const results = await mapPool(uniqueWebsites, async (url) => ({ url, result: await checkUrl(url) }), CONCURRENCY);
    for (const { url, result } of results) websiteChecks.set(url, result);
  }

  const ctx = { providersById, addressPeerIndex, imageIndex, websiteChecks, urlChecks: !skipUrls };

  const providerRows = providers.map((p) => auditProvider(p, ctx));
  const eventRows = events.map((e) => auditEvent(e, ctx));
  const meetupRows = meetups.map((m) => auditMeetup(m, ctx));

  const provFlagged = providerRows.filter((r) => r.issues.length).sort((a, b) => b.issues.length - a.issues.length);
  const eventFlagged = eventRows.filter((r) => r.issues.length).sort((a, b) => b.issues.length - a.issues.length);
  const meetFlagged = meetupRows.filter((r) => r.issues.length).sort((a, b) => b.issues.length - a.issues.length);

  const provSummary = summarizeRows(providerRows);
  const eventSummary = summarizeRows(eventRows);
  const meetSummary = summarizeRows(meetupRows);

  const totals = summarizeRows([...providerRows, ...eventRows, ...meetupRows]);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    options: { liveUrlChecks: !skipUrls },
    catalogCounts: {
      providers: providers.length,
      events: events.length,
      meetups: meetups.length,
    },
    findingCatalog: FINDING_CATALOG,
    totals,
    providers: { summary: provSummary, flagged: provFlagged },
    events: { summary: eventSummary, flagged: eventFlagged },
    meetups: { summary: meetSummary, flagged: meetFlagged },
  };

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(OUT_MD, renderMarkdown(report));

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("Catalog content audit complete");
  console.log(`  Providers: ${provSummary.rowsWithFindings}/${providers.length} flagged (${provSummary.totalFindings} findings)`);
  console.log(`  Events:    ${eventSummary.rowsWithFindings}/${events.length} flagged (${eventSummary.totalFindings} findings)`);
  console.log(`  Meetups:   ${meetSummary.rowsWithFindings}/${meetups.length} flagged (${meetSummary.totalFindings} findings)`);
  console.log(`  Total:     ${totals.totalFindings} findings on ${totals.rowsWithFindings} rows`);
  console.log("  By code:", totals.byCode);
  console.log("  JSON:", OUT_JSON);
  console.log("  MD:  ", OUT_MD);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
