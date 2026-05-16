#!/usr/bin/env node
/**
 * Fix one provider: verify image from official sources, upload ImgBB, upsert.
 * Usage: node scripts/fix-provider-one.cjs <provider-id> [--dry-run]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { buildProviderLocales } = require("./lib/build-provider-locales.cjs");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();
const DB_PATH = path.join(__dirname, "coverage-venue-db.json");
const FIXES_JSON_PATH = path.join(__dirname, "provider-image-fixes.json");

function loadJsonFixes(id) {
  if (!fs.existsSync(FIXES_JSON_PATH)) return {};
  const all = JSON.parse(fs.readFileSync(FIXES_JSON_PATH, "utf8"));
  const row = all[id];
  if (!row) return {};
  const out = { ...row };
  if (out.localImagePath && !path.isAbsolute(out.localImagePath)) {
    out.localImagePath = path.join(__dirname, "..", out.localImagePath);
  }
  return out;
}

function isBadImageUrl(url) {
  return /favicon|icon\d|\/icon|\/icons\/|sprite|print\.png|logo\.png|1x1|pixel\.|spacer|blank\.|avatar|emoji|button/i.test(
    url,
  );
}

function scoreImageUrl(url) {
  if (isBadImageUrl(url)) return -100;
  let s = 0;
  if (/og:image|hero|cover|banner|gallery|upload|wp-content|files\/default/i.test(url)) s += 20;
  if (/\.(jpg|jpeg|webp)$/i.test(url)) s += 5;
  if (/thumb|thumbnail|small|icon|50x|100x|150x/i.test(url)) s -= 15;
  if (/\.png$/i.test(url) && /logo|icon/i.test(url)) s -= 20;
  return s;
}

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return true;
  return false;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 BudapestNightFix" } });
  const body = await res.json();
  return { ok: res.ok, status: res.status, body };
}

function dbEntryFor(id) {
  if (!fs.existsSync(DB_PATH)) return null;
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  return db.providers?.find((p) => p.id === id) || null;
}

async function wikimediaThumb(name, category) {
  const queries = [
    `${name} Budapest Hungary`,
    category === "Cafés" ? `${name} café Budapest` : `${name} Budapest`,
    `${name} Hungary`,
  ];
  for (const searchTitle of queries) {
    try {
      const q = encodeURIComponent(searchTitle);
      const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json`;
      const res = await fetch(api, { headers: { "User-Agent": "BudapestNightFix/1.0" } });
      const json = await res.json();
      const pages = json?.query?.pages || {};
      for (const p of Object.values(pages)) {
        const title = p.title || "";
        if (/\.webm|black hole|logo|icon|coat of arms|map\.svg/i.test(title)) continue;
        const thumb = p.imageinfo?.[0]?.thumburl;
        if (thumb && !isBadImageUrl(thumb) && !/\.webm/i.test(thumb)) return thumb;
      }
    } catch {
      /* next query */
    }
  }
  return null;
}

async function discoverImageUrls(website, imageSource) {
  const urls = [];
  if (imageSource) urls.push(imageSource);
  if (!website) return urls;
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
      const og2 = html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
      if (og2?.[1]) urls.push(og2[1]);
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

async function downloadFirstValid(urls, dest) {
  const ranked = [...urls].sort((a, b) => scoreImageUrl(b) - scoreImageUrl(a));
  for (const url of ranked) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow" });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!isValidImageBuffer(buf)) continue;
      fs.writeFileSync(dest, buf);
      return url;
    } catch {
      /* try next */
    }
  }
  return null;
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
  const json = await res.json();
  if (!json.url) throw new Error(`Upload failed: ${JSON.stringify(json)}`);
  return json.url;
}

/** Manual corrections verified against official sites (override bad bulk data). */
const CORRECTIONS = {
  "prov-cov-pesti-vigado-vaci": {
    imageSource:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Budapest%2C_Vigad%C3%B3_t%C3%A9r_2%2C_Pesti_Vigad%C3%B3.jpg/1280px-Budapest%2C_Vigad%C3%B3_t%C3%A9r_2%2C_Pesti_Vigad%C3%B3.jpg",
    website: "https://www.vigado.hu/",
  },
  "prov-cov-embassy-rakoczi": {
    reuseImageFrom: "prov-espresso-embassy-belvaros",
    website: "https://espressoembassy.hu/",
    phone: "+36 20 445 0063",
    email: "hello@espressoembassy.hu",
  },
  "prov-cov-espresso-embassy-kiraly": {
    address: "1051 Budapest, Arany János utca 15, Hungary",
    phone: "+36 20 445 0063",
    email: "hello@espressoembassy.hu",
    website: "https://espressoembassy.hu/",
    reuseImageFrom: "prov-espresso-embassy-belvaros",
    shortDescription:
      "Pioneer specialty coffee on Arany János utca — espresso, filter, and pastries (Mon–Fri from 7:30).",
    longDescription:
      "Espresso Embassy at Arany János utca 15 is one of Budapest's early third-wave cafés, a short walk from Király utca nightlife. Mon–Fri 7:30–17:00, Sat–Sun 8:30–17:00; no reservations. Weekend laptops only on communal tables.\n\nSources: https://espressoembassy.hu/",
  },
  "prov-cov-daubner-oktogon": {
    address: "1025 Budapest, Szépvölgyi út 50, Hungary",
    borough: "Buda",
    neighborhood: "Rózsadomb",
    phone: "+36 20 329 8952",
    email: "rendeles@daubnercukraszda.hu",
    website: "http://daubnercukraszda.hu/",
    imageSource:
      "http://daubnercukraszda.hu/sites/default/files/csupasz%20parf%C3%A9torta-mang%C3%B3s.png",
    shortDescription:
      "Legendary Daubner patisserie on Szépvölgyi út — parfé tortes, bonbons, and coffee (Wed–Sun).",
    longDescription:
      "Daubner Cukrászda continues a pastry tradition founded in 1901, now at Szépvölgyi út 50 in the Buda hills. The shop is known for parfé tortes, children's cakes, and seasonal collections; orders are taken by phone or email. Open Wednesday through Sunday 9:00–19:00 (closed Mon–Tue).\n\nSources: http://daubnercukraszda.hu/",
  },
};

async function main() {
  const id = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");
  if (!id) {
    console.error("Usage: node scripts/fix-provider-one.cjs <provider-id> [--dry-run]");
    process.exit(1);
  }

  const { body: providers } = await fetchJson(`${BASE}/api/public/providers`);
  const current = providers.find((p) => p.id === id);
  if (!current) {
    console.error("Provider not found in public API:", id);
    process.exit(1);
  }

  const seed = dbEntryFor(id) || {};
  const fix = { ...loadJsonFixes(id), ...CORRECTIONS[id] };
  const { reuseImageFrom: _reuse, ...fixFields } = fix;
  const doc = {
    ...current,
    ...seed,
    ...fixFields,
    id,
    name: fix.name || seed.name || current.name,
    website: fix.website || seed.website || current.website,
    imageSource: fix.imageSource || seed.imageSource,
  };

  const assetDir = path.join(__dirname, "imgbb-asset-sources/providers");
  fs.mkdirSync(assetDir, { recursive: true });
  const slug = id.replace(/^prov-/, "");
  let imgPath = path.join(assetDir, `fixed-${slug}.jpg`);

  const localFixed = path.join(assetDir, `fixed-${slug}.jpg`);
  const localCov = path.join(assetDir, `cov-cov-${slug}.jpg`);
  let usedUrl;
  if (fix.localImagePath && fs.existsSync(fix.localImagePath)) {
    fs.copyFileSync(fix.localImagePath, imgPath);
    usedUrl = fix.localImagePath;
    console.log("Using local file:", fix.localImagePath);
  } else if (fs.existsSync(localFixed) && isValidImageBuffer(fs.readFileSync(localFixed))) {
    const sz = fs.statSync(localFixed).size;
    if (sz > 100000) {
      fs.copyFileSync(localFixed, imgPath);
      usedUrl = localFixed;
      console.log("Using cached fixed asset:", localFixed);
    }
  }
  if (!usedUrl && fix.reuseImageFrom) {
    const donor = providers.find((p) => p.id === fix.reuseImageFrom);
    if (!donor?.image) throw new Error(`reuseImageFrom not found: ${fix.reuseImageFrom}`);
    const res = await fetch(donor.image);
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isValidImageBuffer(buf)) throw new Error("Donor image invalid");
    fs.writeFileSync(imgPath, buf);
    usedUrl = donor.image;
    console.log("Reused image from", fix.reuseImageFrom);
  } else if (!usedUrl) {
    let candidates = await discoverImageUrls(doc.website, doc.imageSource);
    console.log("Trying", candidates.length, "image URL(s) for", doc.name);
    usedUrl = await downloadFirstValid(candidates, imgPath);
    if (!usedUrl) {
      const wiki = await wikimediaThumb(doc.name, doc.category);
      if (wiki) {
        console.log("Wikimedia fallback:", wiki);
        usedUrl = await downloadFirstValid([wiki], imgPath);
      }
    }
    if (!usedUrl && doc.imageSource?.match(/\.png/i)) {
      imgPath = path.join(assetDir, `fixed-${slug}.png`);
      usedUrl = await downloadFirstValid([doc.imageSource, ...candidates], imgPath);
    }
  }
  if (!usedUrl) {
    console.error("No valid image downloaded for", id);
    process.exit(1);
  }
  console.log("Downloaded:", usedUrl);

  if (dryRun) {
    console.log("Dry run — would update", id, "image from", usedUrl);
    console.log(JSON.stringify({ address: doc.address, borough: doc.borough, neighborhood: doc.neighborhood }, null, 2));
    process.exit(0);
  }

  const imageUrl = await uploadImage(imgPath);
  console.log("Uploaded:", imageUrl);

  const long =
    doc.longDescription?.includes("Sources:") ?
      doc.longDescription
    : `${doc.longDescription}\n\nSources: ${doc.website}`;

  const payload = {
    sourceUrls: [doc.website],
    notes: `Image/data fix for ${id}`,
    missingOrUncertain: usedUrl.includes("imagecache/thumnail") ? ["Used best available official site asset."] : [],
    operations: [
      {
        resource: "provider",
        action: "upsert",
        document: {
          ...current,
          ...doc,
          image: imageUrl,
          longDescription: long,
          locales: current.locales || buildProviderLocales({ ...doc, longDescription: long }),
        },
      },
    ],
  };

  const out = path.join(__dirname, "ingest-payloads", `fix-${slug}.json`);
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));

  const res = await fetch(`${BASE}/api/ingest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ operations: payload.operations }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    console.error("Ingest failed", res.status, json);
    process.exit(1);
  }
  console.log("Ingest OK:", id, "→", imageUrl);
  const verify = (await fetchJson(`${BASE}/api/public/providers`)).body.find((p) => p.id === id);
  console.log("Verified image:", verify?.image);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
