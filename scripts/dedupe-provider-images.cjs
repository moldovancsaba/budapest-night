#!/usr/bin/env node
/**
 * Assign unique images to every provider that shares an image with another.
 * Usage: node scripts/dedupe-provider-images.cjs [--dry-run]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { buildProviderLocales } = require("./lib/build-provider-locales.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();
const DB_PATH = path.join(__dirname, "coverage-venue-db.json");
const ASSET_DIR = path.join(__dirname, "imgbb-asset-sources/providers");
const crypto = require("crypto");

function buildUniqueAssetPool() {
  const pool = [];
  const hashSeen = new Set();
  for (const f of fs.readdirSync(ASSET_DIR)) {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(f)) continue;
    const p = path.join(ASSET_DIR, f);
    const buf = fs.readFileSync(p);
    if (buf.length < 100000) continue;
    const h = crypto.createHash("md5").update(buf).digest("hex");
    if (hashSeen.has(h)) continue;
    hashSeen.add(h);
    pool.push({ path: p, name: f, hash: h });
  }
  pool.sort((a, b) => fs.statSync(b.path).size - fs.statSync(a.path).size);
  return pool;
}

let assetPool = [];
let poolIndex = 0;
const usedAssetHashes = new Set();

// Reuse helpers from fix-provider-one (inlined minimal set)
function isBadImageUrl(url) {
  return /favicon|icon\d|\/icon|sprite|print\.png|logo\.png|1x1|pixel\.|spacer|blank\.|avatar|emoji|button/i.test(url);
}
function isValidImageBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return true;
  return false;
}
function scoreImageUrl(url) {
  if (isBadImageUrl(url)) return -100;
  let s = 0;
  if (/og:image|hero|cover|banner|gallery|upload|wp-content|files\/default/i.test(url)) s += 20;
  if (/\.(jpg|jpeg|webp)$/i.test(url)) s += 5;
  if (/thumb|thumbnail|small|icon|50x|100x|150x/i.test(url)) s -= 15;
  return s;
}

async function discoverImageUrls(website, imageSource) {
  const urls = [];
  if (imageSource) urls.push(imageSource);
  if (!website) return [...new Set(urls)].sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
  const variants = [website];
  if (website.startsWith("https://")) variants.push(website.replace("https://", "http://"));
  if (website.startsWith("http://")) variants.push(website.replace("http://", "https://"));
  try {
    const u = new URL(website);
    if (u.hostname.startsWith("www.")) variants.push(`${u.protocol}//${u.hostname.slice(4)}${u.pathname}`);
    else variants.push(`${u.protocol}//www.${u.hostname}${u.pathname}`);
  } catch {
    /* ignore */
  }
  for (const w of variants) {
    try {
      const res = await fetch(w, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" },
        redirect: "follow",
        signal: AbortSignal.timeout(20000),
      });
      const html = await res.text();
      const og = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
      if (og?.[1]) urls.push(og[1]);
      for (const m of html.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi) || []) {
        if (!isBadImageUrl(m)) urls.push(m);
      }
      for (const m of html.match(/(?:src|href)=["'](\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi) || []) {
        const rel = m.match(/["'](\/[^"']+)["']/i)?.[1];
        if (rel && !/favicon|print\.png/i.test(rel)) {
          const base = new URL(w);
          urls.push(`${base.origin}${rel}`);
        }
      }
    } catch {
      /* next */
    }
  }
  return [...new Set(urls)].sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
}

async function wikimediaCandidates(name, category, limit = 8) {
  const queries = [
    `${name} Budapest`,
    `${name} Budapest Hungary`,
    category === "Cafés" ? `${name} café Budapest` : `${name} restaurant Budapest`,
  ];
  const out = [];
  for (const searchTitle of queries) {
    try {
      await new Promise((r) => setTimeout(r, 2200));
      const q = encodeURIComponent(searchTitle);
      const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
      const res = await fetch(api, { headers: { "User-Agent": "BudapestNightDedupe/1.0" } });
      const json = await res.json();
      for (const p of Object.values(json?.query?.pages || {})) {
        const title = p.title || "";
        if (/\.webm|black hole|logo|icon|coat of arms|map\.svg|diagram|flag/i.test(title)) continue;
        const thumb = p.imageinfo?.[0]?.thumburl?.split("?")[0];
        if (thumb && !isBadImageUrl(thumb)) out.push(thumb);
      }
    } catch {
      /* next */
    }
  }
  return [...new Set(out)];
}

async function downloadToTemp(url, dest) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isValidImageBuffer(buf)) return false;
    fs.writeFileSync(dest, buf);
    return true;
  } catch {
    return false;
  }
}

async function uploadImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase() || ".jpg";
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  const form = new FormData();
  form.append("file", new Blob([buf], { type: mime }), path.basename(filePath));
  const res = await fetch(`${BASE}/api/ingest/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Upload ${res.status}: ${text.slice(0, 200)}`);
  }
  if (!json.url) throw new Error(JSON.stringify(json));
  return json.url;
}

function dbEntryFor(id) {
  if (!fs.existsSync(DB_PATH)) return null;
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  return db.providers?.find((p) => p.id === id) || null;
}

function takeUniqueLocalFile(tmp) {
  const slug = arguments[1] || "";
  const prefer = [
    path.join(ASSET_DIR, `fixed-cov-${slug.replace(/^prov-/, "")}.jpg`),
    path.join(ASSET_DIR, `cov-cov-${slug.replace(/^prov-/, "")}.jpg`),
  ];
  for (const lp of prefer) {
    if (!fs.existsSync(lp)) continue;
    const buf = fs.readFileSync(lp);
    if (buf.length < 100000) continue;
    const h = crypto.createHash("md5").update(buf).digest("hex");
    if (usedAssetHashes.has(h)) continue;
    usedAssetHashes.add(h);
    fs.writeFileSync(tmp, buf);
    return { via: `local:${path.basename(lp)}`, hash: h };
  }
  while (poolIndex < assetPool.length) {
    const item = assetPool[poolIndex++];
    if (usedAssetHashes.has(item.hash)) continue;
    usedAssetHashes.add(item.hash);
    fs.copyFileSync(item.path, tmp);
    return { via: `pool:${item.name}`, hash: item.hash };
  }
  return null;
}

async function resolveUniqueImage(doc, seed, usedSourceUrls, usedImgbbUrls) {
  const slug = doc.id.replace(/^prov-/, "");
  const tmp = path.join(ASSET_DIR, `dedupe-${slug}.jpg`);

  const local = takeUniqueLocalFile(tmp, doc.id);
  if (local) {
    try {
      const url = await uploadImage(tmp);
      if (!usedImgbbUrls.has(url)) {
        usedImgbbUrls.add(url);
        return { imageUrl: url, via: local.via };
      }
    } catch {
      /* fall through */
    }
  }

  const webUrls = await discoverImageUrls(doc.website || seed?.website, seed?.imageSource);
  for (const src of webUrls) {
    if (usedSourceUrls.has(src)) continue;
    if (await downloadToTemp(src, tmp)) {
      usedSourceUrls.add(src);
      const url = await uploadImage(tmp);
      if (!usedImgbbUrls.has(url)) {
        usedImgbbUrls.add(url);
        return { imageUrl: url, via: src };
      }
    }
  }

  const wiki = await wikimediaCandidates(doc.name, doc.category, 10);
  for (const src of wiki) {
    if (usedSourceUrls.has(src)) continue;
    if (await downloadToTemp(src, tmp)) {
      usedSourceUrls.add(src);
      const url = await uploadImage(tmp);
      if (!usedImgbbUrls.has(url)) {
        usedImgbbUrls.add(url);
        return { imageUrl: url, via: `wiki:${src.slice(0, 60)}` };
      }
    }
  }

  return null;
}

async function upsertImage(doc, imageUrl) {
  const long = doc.longDescription?.includes("Sources:")
    ? doc.longDescription
    : `${doc.longDescription}\n\nSources: ${doc.website}`;
  const payload = {
    operations: [
      {
        resource: "provider",
        action: "upsert",
        document: {
          ...doc,
          image: imageUrl,
          longDescription: long,
          locales: doc.locales || buildProviderLocales({ ...doc, longDescription: long }),
        },
      },
    ],
  };
  const res = await fetch(`${BASE}/api/ingest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Ingest ${res.status}: ${await res.text()}`);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  assetPool = buildUniqueAssetPool();
  console.log("Unique local assets in pool:", assetPool.length);
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const byImage = new Map();
  for (const p of providers) {
    if (!p.image) continue;
    if (!byImage.has(p.image)) byImage.set(p.image, []);
    byImage.get(p.image).push(p);
  }

  const toFix = [];
  for (const [, group] of byImage) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 1; i < group.length; i++) toFix.push(group[i]);
  }

  console.log("Providers needing unique images:", toFix.length);
  const usedSourceUrls = new Set();
  const usedImgbbUrls = new Set(providers.map((p) => p.image).filter(Boolean));
  let ok = 0;
  let fail = 0;

  for (const doc of toFix) {
    console.log(`\n→ ${doc.id} (${doc.name})`);
    try {
      const seed = dbEntryFor(doc.id) || {};
      const result = await resolveUniqueImage(doc, seed, usedSourceUrls, usedImgbbUrls);
      if (!result) {
        console.error("  FAILED — no unique image found");
        fail++;
        continue;
      }
      console.log("  ", result.via);
      console.log("  ", result.imageUrl);
      if (!dryRun) {
        await upsertImage(doc, result.imageUrl);
        usedImgbbUrls.add(result.imageUrl);
      }
      ok++;
    } catch (e) {
      console.error("  ERROR:", e.message || e);
      fail++;
    }
  }

  if (!dryRun) {
    const after = await (await fetch(`${BASE}/api/public/providers`)).json();
    const by = {};
    for (const x of after) {
      if (!x.image) continue;
      by[x.image] = (by[x.image] || 0) + 1;
    }
    const dup = Object.values(by).filter((n) => n > 1).length;
    console.log(`\nDone. Fixed: ${ok} Failed: ${fail} Duplicate image groups left: ${dup}`);
  } else {
    console.log(`\nDry run. Would fix: ${ok} Failed: ${fail}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
