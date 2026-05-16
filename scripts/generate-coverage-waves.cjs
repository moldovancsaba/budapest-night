#!/usr/bin/env node
/**
 * Build ingest payloads from coverage-venue-db.json for current gaps.
 * Each DB entry: { gapKey, id, name, address, website, phone, email, imageSource,
 *   activityTypes, ageRanges, dayTimeTags, pricePerClass, shortDescription, longDescription }
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { buildProviderLocales } = require("./lib/build-provider-locales.cjs");

const DB_PATH = path.join(__dirname, "coverage-venue-db.json");
const OUT_DIR = path.join(__dirname, "ingest-payloads");
const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();

const CATEGORIES = ["Events", "Parties", "Restaurants", "Cafés"];
const BOROUGHS = ["Belváros", "Terézváros", "Erzsébetváros", "Ferencváros", "Buda", "Óbuda", "Újbuda"];
const HOODS = {
  Belváros: ["Váci utca", "Deák tér", "Parliament", "Danube Promenade", "Inner City"],
  Terézváros: ["Andrássy út", "Opera", "Oktogon", "Király utca", "Liszt Ferenc tér"],
  Erzsébetváros: ["Jewish Quarter", "Gozsdu Udvar", "Kazinczy utca", "Wesselényi utca", "Rákóczi tér"],
  Ferencváros: ["Corvin-negyed", "Műegyetem", "Nagytemplom utca", "Boráros tér", "Millenniumi Városközpont"],
  Buda: ["Castle District", "Gellért Hill", "Tabán", "Rózsadomb", "Szent Gellért tér"],
  Óbuda: ["Óbuda Island", "Aquincum", "Kolosy tér", "Bécsi út", "Main Square Óbuda"],
  Újbuda: ["Móricz Zsigmond körtér", "Gellért Baths area", "Infopark", "Kosztolányi Dezső tér", "Bikás park"],
};
const ACTIVITIES = [
  "Live Music", "DJ Sets", "Rooftop", "Ruin Bar", "Fine Dining", "Street Food", "Wine Bar", "Craft Beer",
  "Coffee & Brunch", "Gallery", "Theatre", "Festival", "Boat Party", "Thermal Bath", "Jazz", "Electronic",
  "Cocktails", "Late Kitchen",
];
const AGES = ["All ages", "Family", "18+", "21+", "Late night"];
const TIMES = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"];
const MEETUP_TYPES = ["Art & Gallery", "Live Culture", "Food & Wine Circle", "Nightlife Crew", "Local Creators"];

function computeGaps(providers, meetups) {
  const g = { catBor: [], catHood: [], catAct: [], catAge: [], catTime: [], mBor: [], mHood: [], mGT: [] };
  for (const c of CATEGORIES) {
    for (const b of BOROUGHS) {
      if (!providers.some((p) => p.category === c && p.borough === b)) g.catBor.push(`${c}|${b}`);
      for (const h of HOODS[b]) {
        if (!providers.some((p) => p.category === c && p.borough === b && p.neighborhood === h)) {
          g.catHood.push(`${c}|${b}|${h}`);
        }
      }
    }
    for (const a of ACTIVITIES) if (!providers.some((p) => p.category === c && p.activityTypes.includes(a))) g.catAct.push(`${c}|${a}`);
    for (const a of AGES) if (!providers.some((p) => p.category === c && p.ageRanges.includes(a))) g.catAge.push(`${c}|${a}`);
    for (const t of TIMES) if (!providers.some((p) => p.category === c && p.dayTimeTags.includes(t))) g.catTime.push(`${c}|${t}`);
  }
  for (const b of BOROUGHS) {
    if (!meetups.some((m) => m.borough === b)) g.mBor.push(b);
    for (const h of HOODS[b]) if (!meetups.some((m) => m.borough === b && m.neighborhood === h)) g.mHood.push(`${b}|${h}`);
  }
  for (const t of MEETUP_TYPES) if (!meetups.some((m) => m.groupType === t)) g.mGT.push(t);
  return g;
}

async function uploadImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([buf]), path.basename(filePath));
  const res = await fetch(`${BASE}/api/ingest/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const json = await res.json();
  if (!json.url) throw new Error(JSON.stringify(json));
  return json.url;
}

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return true;
  return false;
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 BudapestNightCurator" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isValidImageBuffer(buf)) throw new Error(`Not an image: ${url}`);
  fs.writeFileSync(dest, buf);
}

let fallbackImageUrl;

async function getFallbackImageUrl() {
  if (fallbackImageUrl) return fallbackImageUrl;
  const pr = await (await fetch(`${BASE}/api/public/providers`)).json();
  fallbackImageUrl = pr.find((p) => p.image?.includes("i.ibb.co"))?.image;
  if (!fallbackImageUrl) throw new Error("No fallback ImgBB image in catalog");
  return fallbackImageUrl;
}

async function resolveImageUrl(entry) {
  const tryUrls = [];
  if (entry.imageSource) tryUrls.push(entry.imageSource);
  if (entry.website) {
    try {
      const res = await fetch(entry.website, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await res.text();
      const m = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (m?.[1]) tryUrls.push(m[1]);
      for (const u of html.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || []) {
        if (!u.includes("favicon")) tryUrls.push(u);
      }
    } catch {
      /* ignore */
    }
  }
  for (const url of tryUrls) {
    const head = await fetch(url, { method: "HEAD", headers: { "User-Agent": "Mozilla/5.0" } }).catch(() => null);
    if (head?.ok) return url;
    try {
      await downloadImage(url, "/tmp/bn-cov-probe.jpg");
      fs.unlinkSync("/tmp/bn-cov-probe.jpg");
      return url;
    } catch {
      /* next */
    }
  }
  return getFallbackImageUrl();
}

async function writeFallbackImage(imgPath) {
  const url = await getFallbackImageUrl();
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isValidImageBuffer(buf)) throw new Error("Fallback image invalid");
  fs.writeFileSync(imgPath, buf);
  return url;
}

async function downloadEntryImage(entry, imgPath) {
  if (fs.existsSync(imgPath)) {
    const cached = fs.readFileSync(imgPath);
    if (isValidImageBuffer(cached)) return imgPath;
    fs.unlinkSync(imgPath);
  }
  const url = await resolveImageUrl(entry);
  const fb = await getFallbackImageUrl();
  if (url === fb) return writeFallbackImage(imgPath);
  try {
    await downloadImage(url, imgPath);
    return url;
  } catch {
    return writeFallbackImage(imgPath);
  }
}

function parseGap(gapKey) {
  const parts = gapKey.split("|");
  if (parts.length === 3) return { category: parts[0], borough: parts[1], neighborhood: parts[2] };
  if (parts.length === 2 && CATEGORIES.includes(parts[0])) return { category: parts[0], borough: parts[1], neighborhood: null };
  return null;
}

function buildProviderOp(entry, imageUrl) {
  const g = parseGap(entry.gapKey);
  if (!g) return null;
  const hood = g.neighborhood || entry.neighborhood;
  const longDescription = `${entry.longDescription}\n\nSources: ${entry.website}`;
  return {
    resource: "provider",
    action: "upsert",
    document: {
      id: entry.id,
      name: entry.name,
      category: g.category,
      borough: g.borough,
      neighborhood: hood,
      address: entry.address,
      activityTypes: entry.activityTypes,
      ageRanges: entry.ageRanges,
      dayTimeTags: entry.dayTimeTags,
      // pricePerClass must be EUR (typical ticket/cover lower bound), never HUF amounts.
      pricePerClass: entry.pricePerClass ?? 0,
      shortDescription: entry.shortDescription,
      longDescription,
      rating: 0,
      reviewCount: 0,
      badges: entry.badges || [],
      image: imageUrl,
      email: entry.email || "",
      website: entry.website,
      phone: entry.phone || "+36 1 000 0000",
      // WARNING: buildProviderLocales mirrors English — run generate-cov-events-locale-patch after bulk cov ingest.
      locales: buildProviderLocales({
        id: entry.id,
        name: entry.name,
        shortDescription: entry.shortDescription,
        longDescription,
        website: entry.website,
      }),
    },
  };
}

function buildMeetupOp(entry, imageUrl, groupType, borough, neighborhood) {
  return {
    resource: "meetupGroup",
    action: "upsert",
    document: {
      id: entry.id,
      name: entry.name,
      borough,
      neighborhood,
      groupType,
      ageRange: entry.ageRange || "18+",
      cadence: entry.cadence || "Monthly",
      instagram: entry.instagram || "",
      website: entry.website,
      description: entry.description,
      initials: entry.initials || "BN",
      icon: entry.icon || "community",
      palette: entry.palette || "teal",
      coverImageUrl: imageUrl,
    },
  };
}

async function main() {
  if (!fs.existsSync(DB_PATH)) {
    console.error("Missing", DB_PATH);
    process.exit(1);
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const byGap = new Map(db.providers.map((e) => [e.gapKey, e]));
  const meetupByGap = new Map((db.meetups || []).map((e) => [e.gapKey, e]));

  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const meetups = await (await fetch(`${BASE}/api/public/meetup-groups`)).json();
  const gaps = computeGaps(providers, meetups);

  const needed = [
    ...gaps.catBor.map((k) => ({ type: "provider", gapKey: k })),
    ...gaps.catHood.map((k) => ({ type: "provider", gapKey: k })),
    ...gaps.mBor.map((k) => ({ type: "meetup", gapKey: k })),
    ...gaps.mHood.map((k) => ({ type: "meetup", gapKey: k })),
    ...gaps.mGT.map((t) => ({ type: "meetupGT", groupType: t })),
  ];

  const assetDir = path.join(__dirname, "imgbb-asset-sources/providers");
  fs.mkdirSync(assetDir, { recursive: true });

  const operations = [];
  const missing = [];

  for (const n of needed) {
    if (n.type === "meetupGT") {
      const entry = (db.meetups || []).find((m) => m.groupType === n.groupType);
      if (!entry) {
        missing.push(`meetupGT:${n.groupType}`);
        continue;
      }
      const slug = entry.id.replace(/^(?:prov-|grp-)/, "");
      const imgPath = path.join(assetDir, `cov-${slug}.jpg`);
      await downloadEntryImage(entry, imgPath);
      const imageUrl = await uploadImage(imgPath);
      operations.push(
        buildMeetupOp(entry, imageUrl, entry.groupType, entry.borough, entry.neighborhood),
      );
      continue;
    }

    const entry = n.type === "meetup" ? meetupByGap.get(n.gapKey) : byGap.get(n.gapKey);
    if (!entry) {
      missing.push(`${n.type}:${n.gapKey}`);
      continue;
    }
    const slug = entry.id.replace(/^(?:prov-|grp-)/, "");
    const imgPath = path.join(assetDir, `cov-${slug}.jpg`);
    await downloadEntryImage(entry, imgPath);
    const imageUrl = await uploadImage(imgPath);

    if (n.type === "meetup") {
      const [borough, neighborhood] = n.gapKey.split("|");
      operations.push(buildMeetupOp(entry, imageUrl, entry.groupType, borough, neighborhood));
    } else {
      const op = buildProviderOp(entry, imageUrl);
      if (op) operations.push(op);
    }
  }

  if (missing.length) {
    console.error("Missing DB entries:", missing.length);
    fs.writeFileSync(path.join(__dirname, "coverage-missing-gaps.json"), JSON.stringify(missing, null, 2));
  }

  if (!operations.length) {
    console.log("No operations to run.");
    process.exit(0);
  }

  const chunkSize = 25;
  for (let i = 0; i < operations.length; i += chunkSize) {
    const chunk = operations.slice(i, i + chunkSize);
    const outPath = path.join(OUT_DIR, `coverage-auto-wave-${String(Math.floor(i / chunkSize) + 1).padStart(2, "0")}.json`);
    const payload = {
      sourceUrls: chunk.map((o) => o.document.website).filter(Boolean),
      notes: `Auto coverage wave ${i / chunkSize + 1}`,
      missingOrUncertain: ["See coverage-venue-db.json for source notes."],
      operations: chunk,
    };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    console.log("Wrote", outPath, "ops", chunk.length);
  }

  console.log("Total operations:", operations.length, "missing:", missing.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
