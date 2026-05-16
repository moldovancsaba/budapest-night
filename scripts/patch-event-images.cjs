#!/usr/bin/env node
/**
 * Download official event promo images (og:image / venue listing art),
 * upload each to ImgBB, write patch payload, optionally POST ingest.
 *
 *   node scripts/patch-event-images.cjs [--dry-run] [--write-only]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");

const ASSETS = path.join(__dirname, "imgbb-asset-sources/events");
const OUT_PAYLOAD = path.join(__dirname, "ingest-payloads/patch-event-images-unique.json");

/** Event-specific image from official listing pages (not venue card fallbacks). */
const EVENTS = [
  {
    id: "event-rilles-budapest-park-2026",
    file: "rilles.jpg",
    source: "https://www.budapestpark.hu/tickets/event/RILES_20260531",
    imageUrl:
      "https://budapestpark.cdn-netpositive.com/event_images/2026/event_image_xl/0514-103723-75d837b71fb4b55e98dd1cd7e3946dfc.jpg",
  },
  {
    id: "event-deva-budapest-park-2026",
    file: "deva.jpg",
    source: "https://www.budapestpark.hu/tickets/event/deva-20260627",
    imageUrl:
      "https://budapestpark.cdn-netpositive.com/event_images/2026/event_image_xl/0506-131849-6a945f6d55118b8eb5e7328a943adc82.jpg",
  },
  {
    id: "event-lp-budapest-park-2026",
    file: "lp.png",
    source: "https://www.budapestpark.hu/en/events/lp-20260707",
    imageUrl: "https://www.budapestpark.hu/uploads/616623bf8c5ed89f15dff75f1d991178.png",
  },
  {
    id: "event-idles-budapest-park-2026",
    file: "idles.png",
    source: "https://www.budapestpark.hu/en/events/idles-20260708",
    imageUrl: "https://www.budapestpark.hu/uploads/19167cdc139a758b1ec5c3c59698d849.png",
  },
  {
    id: "event-charlie-puth-budapest-park-2026",
    file: "charlie-puth.jpg",
    source: "https://www.budapestpark.hu/en/events/charlie-puth-20260727",
    imageUrl: "https://www.budapestpark.hu/uploads/dbef9958b77f5caa93e98aef9fefdf46.jpg",
  },
  {
    id: "event-moby-budapest-park-2026",
    file: "moby.jpg",
    source: "https://www.budapestpark.hu/index.php/en/events/moby-20260801",
    imageUrl: "https://www.budapestpark.hu/uploads/95abf9fdecd20fd5d50eae95041da594.jpg",
  },
  {
    id: "event-sting-mvm-dome-2026",
    file: "sting.jpg",
    source: "https://www.livenation.hu/en/tickets/sting-3-0-budapest-events-edp1623026",
    imageUrl: "https://dynamicmedia.livenationinternational.com/h/y/b/8f01e807-7081-4660-9bd9-74ee51b18b5a.jpg",
  },
  {
    id: "event-wagner-parsifal-mupa-2026",
    file: "parsifal.webp",
    source:
      "https://mupa.hu/en/program/classical-music-opera-theatre/wagner-parsifal-2026-06-30_16-00-bela-bartok-national-concert-hall",
    imageUrl:
      "https://mupa.hu/storage/media/91141/conversions/27375_budapesti_wagner_napok_wagner_parsifal_260605_01-full-width-hero.webp",
  },
  {
    id: "event-oliver-tree-durer-kert-2026",
    file: "oliver-tree.webp",
    source: "https://www.durerkert.com/en/event/oliver_tree_2026",
    imageUrl: "https://minio.durerkert.com/durer/oliver_tree_jpg_5545f85cc1.webp",
  },
  {
    id: "event-dogstar-akvarium-2026",
    file: "dogstar.jpg",
    source: "https://akvariumklub.hu/en/events/dogstar/",
    imageUrl:
      "https://akvariumklub.hu/wp-content/uploads/2025/12/2023_07_18-0377_Credit-Ross-Halfin-scaled-16x9-1-1024x576.jpg",
  },
  {
    id: "event-in-flames-barba-negra-2026",
    file: "in-flames.jpg",
    source: "https://www.barbanegra.hu/in-flames_20260725",
    imageUrl: "https://www.barbanegra.hu/uploads/in-flames_20260725.jpg",
  },
];

function isValidImageBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0xff && buf[1] === 0xd8) return true;
  if (buf[0] === 0x89 && buf[1] === 0x50) return true;
  if (buf[0] === 0x47 && buf[1] === 0x49) return true;
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") return true;
  return false;
}

async function downloadImage(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 BudapestNightCurator" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isValidImageBuffer(buf)) throw new Error(`Not a raster image: ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
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
  const url = json.data?.url || json.data?.display_url;
  if (!url) throw new Error("ImgBB response missing url");
  return url;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const writeOnly = process.argv.includes("--write-only");
  const uploaded = {};
  const sourceUrls = [];

  for (const ev of EVENTS) {
    const dest = path.join(ASSETS, ev.file);
    process.stderr.write(`Download ${ev.id}...\n`);
    const bytes = await downloadImage(ev.imageUrl, dest);
    process.stderr.write(`  ${bytes} bytes -> ${dest}\n`);
    sourceUrls.push(ev.source);

    if (!dryRun) {
      const url = await uploadImgbb(dest);
      uploaded[ev.id] = url;
      process.stderr.write(`  ImgBB: ${url}\n`);
    }
  }

  if (dryRun) {
    console.log("Dry run: assets saved under", ASSETS);
    return;
  }

  const urls = Object.values(uploaded);
  const dup = urls.filter((u, i) => urls.indexOf(u) !== i);
  if (dup.length) throw new Error(`Duplicate ImgBB URLs: ${[...new Set(dup)].join(", ")}`);

  const payload = {
    sourceUrls: [...new Set(sourceUrls)],
    notes:
      "Replace venue-generic event images with official per-show promo art from listing pages; each event gets a unique ImgBB URL.",
    missingOrUncertain: [
      "Sting image from Live Nation dynamic media (tour artwork), not MVM Dome building photo.",
    ],
    operations: EVENTS.map((ev) => ({
      resource: "event",
      action: "patch",
      id: ev.id,
      patch: { image: uploaded[ev.id] },
    })),
  };

  fs.writeFileSync(OUT_PAYLOAD, `${JSON.stringify(payload, null, 2)}\n`);
  console.log("Wrote", OUT_PAYLOAD);

  if (writeOnly) return;

  const { spawnSync } = require("child_process");
  const r = spawnSync(
    "npm",
    ["run", "ingest:listing", "--", OUT_PAYLOAD],
    { cwd: path.join(__dirname, ".."), stdio: "inherit", shell: true },
  );
  process.exit(r.status ?? 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
