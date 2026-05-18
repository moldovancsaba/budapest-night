#!/usr/bin/env node
/**
 * Replace wrongly shared Johannes Oerding / generic concert art on venues and culture circles.
 *
 *   node scripts/patch-venue-meetup-images.cjs [--dry-run] [--write-only]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const PROVIDER_ASSETS = path.join(__dirname, "imgbb-asset-sources/providers");
const TMP = path.join(__dirname, ".tmp-meetup-covers");
const OUT_PAYLOAD = path.join(__dirname, "ingest-payloads/patch-unique-venue-meetup-images.json");

/** Wrong ImgBB hashes reused across unrelated listings. */
const BAD_IMAGE_MARKERS = [
  "cde3b78d5c56",
  "cf91ad578e08",
  "5e673e7e0093",
  "038fd3264859",
  "cb56a463140e",
  "126cf4283420", // Il Friuli newspaper scan (e.g. Gellért Brasserie)
  "0fe6d212760e", // same newspaper under second ImgBB URL
  "d61ba9ebae99", // re-upload of newspaper via bad Wikimedia fallback
  "ff4674d43955", // Fehérvári úti hall on Central Market Hall listing
];

/** Local meetup placeholders that were bulk-copied (same file bytes). */
const BAD_LOCAL_MD5 = new Set(["99969adabd8cc78a42c906e67b3c48de"]);

const PROVIDER_FIXES = [
  { id: "prov-cov-frici-jewish-q", file: "cov-cov-frici-jewish-q.jpg" },
  { id: "prov-cov-vegazzi-kazinczy", file: "cov-cov-vegazzi-kazinczy.jpg" },
  { id: "prov-momkult-ujbuda", file: "momkult.jpg" },
  { id: "prov-budapest-park-ferencvaros", file: "budapest-park.jpg" },
  { id: "prov-mvm-dome-terezvaros", file: "mvm-dome.jpg" },
];

/** Unique on-disk covers (bulk placeholders share MD5 99969ada…). */
const MEETUP_LOCAL_FILE = {
  "grp-cov-meet-kazinczy": "cov-cov-meet-gozsdu.jpg",
  "grp-cov-meet-nagytemplom": "cov-cov-meet-deak.jpg",
  "grp-cov-meet-boraros": "cov-cov-meet-rakoczi.jpg",
  "grp-cov-meet-gellert-hill": "cov-cov-meet-castle.jpg",
  "grp-cov-meet-taban": "cov-cov-meet-wessel.jpg",
  "grp-cov-meet-rozsadomb": "cov-cov-meet-opera.jpg",
  "grp-cov-meet-szent-gellert": "cov-cov-meet-liszt.jpg",
  "grp-cov-meet-kolosy": "cov-cov-meet-bikas.jpg",
  "grp-cov-meet-becsi": "cov-cov-meet-aquincum.jpg",
  "grp-cov-meet-main-square-obuda": "cov-cov-meet-muegyetem.jpg",
  "grp-cov-meet-moricz": "cov-cov-meet-corvin.jpg",
  "grp-cov-meet-kosztolanyi": "cov-cov-meet-kiraly.jpg",
};

const MEETUP_WIKI_URL = {
  "grp-cov-meet-gellert-baths": "https://upload.wikimedia.org/wikipedia/commons/9/99/Citadella_-_Budapest.jpg",
  "grp-cov-meet-millennium":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Conferentiecentrum_B%C3%A1lna.jpg/1280px-Conferentiecentrum_B%C3%A1lna.jpg",
};

function isBadImageUrl(url) {
  const u = (url || "").trim();
  if (!u) return false;
  return BAD_IMAGE_MARKERS.some((m) => u.includes(m));
}

function isBadImageBuffer(buf) {
  if (!buf || buf.length < 12) return true;
  const md5 = crypto.createHash("md5").update(buf).digest("hex");
  return BAD_LOCAL_MD5.has(md5);
}

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return true;
  return false;
}

function isBadImageUrlCandidate(url) {
  return /favicon|icon\d|\/icon|sprite|print\.png|logo\.png|1x1|pixel\.|spacer|blank\.|avatar|emoji|button/i.test(url);
}

function scoreImageUrl(url) {
  if (isBadImageUrlCandidate(url)) return -100;
  let s = 0;
  if (/og:image|hero|cover|banner|gallery|upload|wp-content|wikimedia|commons/i.test(url)) s += 20;
  if (/\.(jpg|jpeg|webp)$/i.test(url)) s += 5;
  if (/thumb|thumbnail|small|icon|50x|100x|150x/i.test(url)) s -= 15;
  return s;
}

async function discoverImageUrls(website) {
  const urls = [];
  if (!website) return urls;
  try {
    const res = await fetch(website, {
      headers: { "User-Agent": "Mozilla/5.0 BudapestNightFix" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    const html = await res.text();
    const og = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (og?.[1]) urls.push(og[1]);
    for (const m of html.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || []) {
      if (!isBadImageUrlCandidate(m)) urls.push(m);
    }
  } catch {
    /* ignore */
  }
  return [...new Set(urls)].sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
}

async function wikimediaCandidates(group) {
  const queries = [
    `${group.neighborhood} Budapest Hungary`,
    `${group.name} Budapest`,
    `${group.borough} Budapest nightlife`,
  ];
  const out = [];
  for (const searchTitle of queries) {
    try {
      const q = encodeURIComponent(searchTitle);
      const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
      const res = await fetch(api, { headers: { "User-Agent": "BudapestNightFix/1.0" } });
      const json = await res.json();
      for (const p of Object.values(json?.query?.pages || {})) {
        const title = p.title || "";
        if (/logo|icon|coat of arms|map\.svg|\.webm/i.test(title)) continue;
        const thumb = p.imageinfo?.[0]?.thumburl;
        if (thumb && !isBadImageUrlCandidate(thumb)) out.push(thumb);
      }
    } catch {
      /* next */
    }
  }
  return [...new Set(out)];
}

async function downloadToFile(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isValidImageBuffer(buf) || isBadImageBuffer(buf)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return true;
}

function meetupAssetPath(groupId) {
  const mapped = MEETUP_LOCAL_FILE[groupId];
  if (mapped) {
    const p = path.join(PROVIDER_ASSETS, mapped);
    if (fs.existsSync(p) && !isBadImageBuffer(fs.readFileSync(p))) return p;
  }
  const suffix = groupId.replace(/^grp-cov-meet-/, "");
  for (const ext of [".jpg", ".jpeg", ".png"]) {
    const p = path.join(PROVIDER_ASSETS, `cov-cov-meet-${suffix}${ext}`);
    if (fs.existsSync(p)) {
      const buf = fs.readFileSync(p);
      if (!isBadImageBuffer(buf)) return p;
    }
  }
  return null;
}

async function uploadImgbb(filePath) {
  const key = (process.env.IMGBB_API_KEY || "").trim();
  if (!key) throw new Error("Missing IMGBB_API_KEY");
  const buf = fs.readFileSync(filePath);
  const body = new URLSearchParams();
  body.set("key", key);
  body.set("image", buf.toString("base64"));
  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `ImgBB HTTP ${res.status}`);
  }
  return json.data?.url || json.data?.display_url;
}

async function resolveMeetupCover(group, usedImgbb) {
  fs.mkdirSync(TMP, { recursive: true });
  const dest = path.join(TMP, `${group.id}.jpg`);
  const candidates = [];

  const local = meetupAssetPath(group.id);
  if (local) candidates.push({ type: "file", path: local });
  if (MEETUP_WIKI_URL[group.id]) candidates.push({ type: "url", url: MEETUP_WIKI_URL[group.id] });

  candidates.push(...(await discoverImageUrls(group.website)).map((url) => ({ type: "url", url })));
  for (const url of await wikimediaCandidates(group)) {
    candidates.push({ type: "url", url });
  }

  for (const c of candidates) {
    let ok = false;
    if (c.type === "file") {
      fs.copyFileSync(c.path, dest);
      ok = true;
    } else if (c.type === "url") {
      ok = await downloadToFile(c.url, dest);
    }
    if (!ok) continue;
    const url = await uploadImgbb(dest);
    if (!usedImgbb.has(url)) {
      usedImgbb.add(url);
      return { url, via: c.type === "file" ? path.basename(c.path) : c.url.slice(0, 80) };
    }
  }
  return null;
}

async function fetchCatalog() {
  const [providersRes, meetupsRes] = await Promise.all([
    fetch(`${BASE}/api/public/providers`),
    fetch(`${BASE}/api/public/meetup-groups`),
  ]);
  if (!providersRes.ok) throw new Error(`providers HTTP ${providersRes.status}`);
  if (!meetupsRes.ok) throw new Error(`meetup-groups HTTP ${meetupsRes.status}`);
  return {
    providers: await providersRes.json(),
    meetups: await meetupsRes.json(),
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const writeOnly = process.argv.includes("--write-only");

  const { providers, meetups } = await fetchCatalog();
  const uploaded = {};
  const usedImgbb = new Set(
    [...providers, ...meetups]
      .flatMap((r) => [r.image, r.coverImageUrl])
      .filter((u) => u && !isBadImageUrl(u)),
  );
  const operations = [];
  const missing = [];

  for (const fix of PROVIDER_FIXES) {
    const current = providers.find((p) => p.id === fix.id);
    if (!current) {
      missing.push(`provider missing: ${fix.id}`);
      continue;
    }
    if (!isBadImageUrl(current.image)) {
      process.stderr.write(`Skip provider ${fix.id} (image already unique)\n`);
      continue;
    }
    const local = path.join(PROVIDER_ASSETS, fix.file);
    if (!fs.existsSync(local)) {
      missing.push(`provider asset missing: ${local}`);
      continue;
    }
    process.stderr.write(`Provider ${fix.id} <- ${fix.file}\n`);
    if (!dryRun) {
      uploaded[`provider:${fix.id}`] = await uploadImgbb(local);
      usedImgbb.add(uploaded[`provider:${fix.id}`]);
      process.stderr.write(`  ${uploaded[`provider:${fix.id}`]}\n`);
    }
    operations.push({
      resource: "provider",
      action: "patch",
      id: fix.id,
      patch: { image: "" },
    });
  }

  for (const group of meetups) {
    if (!isBadImageUrl(group.coverImageUrl)) continue;
    process.stderr.write(`Meetup ${group.id} (${group.name})...\n`);
    if (dryRun) {
      operations.push({
        resource: "meetupGroup",
        action: "patch",
        id: group.id,
        patch: { coverImageUrl: "https://i.ibb.co/dry-run/placeholder.jpg" },
      });
      continue;
    }
    const result = await resolveMeetupCover(group, usedImgbb);
    if (!result) {
      missing.push(`meetup no unique image: ${group.id}`);
      continue;
    }
    uploaded[`meetup:${group.id}`] = result.url;
    process.stderr.write(`  via ${result.via}\n  ${result.url}\n`);
    operations.push({
      resource: "meetupGroup",
      action: "patch",
      id: group.id,
      patch: { coverImageUrl: result.url },
    });
  }

  if (missing.length) {
    console.error("Failed:\n", missing.map((m) => `  - ${m}`).join("\n"));
    process.exit(1);
  }

  if (operations.length === 0) {
    console.log("Nothing to patch — no bad images in live catalog.");
    return;
  }

  if (dryRun) {
    console.log(`Dry run: would patch ${operations.length} listing(s).`);
    return;
  }

  for (const op of operations) {
    if (op.resource === "provider") {
      op.patch.image = uploaded[`provider:${op.id}`];
    }
  }

  const payload = {
    sourceUrls: [
      "https://budapest-night.vercel.app/api/public/providers",
      "https://budapest-night.vercel.app/api/public/meetup-groups",
    ],
    notes: `Replace ${operations.length} listings that reused wrong concert/generic ImgBB art with unique per-listing images.`,
    missingOrUncertain: [],
    operations,
  };

  fs.writeFileSync(OUT_PAYLOAD, `${JSON.stringify(payload, null, 2)}\n`);
  console.log("Wrote", OUT_PAYLOAD, `(${operations.length} operations)`);

  if (writeOnly) return;

  const key = (process.env.INGEST_API_KEY || "").trim();
  if (!key) {
    console.error("INGEST_API_KEY not set — payload written only. Run: npm run ingest:listing --", OUT_PAYLOAD);
    process.exit(0);
  }

  const r = spawnSync("npm", ["run", "ingest:listing", "--", OUT_PAYLOAD], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    shell: true,
  });
  process.exit(r.status ?? 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
