#!/usr/bin/env node
/**
 * Fix prov-cov-kiosk-parliament: official site, hero image, menu, locales → production ingest.
 * Usage: node scripts/patch-kiosk-budapest.cjs [--dry-run]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { buildProviderLocales } = require("./lib/build-provider-locales.cjs");

const ID = "prov-cov-kiosk-parliament";
const SITE = "https://www.kiosk-budapest.hu/";
const SOURCES = [
  SITE,
  "https://www.kiosk-budapest.hu/eteleink",
  "https://www.kiosk-budapest.hu/italaink",
  "https://www.kiosk-budapest.hu/heti-menu",
];
/** Official brand mark (user-provided / repo asset) — not homepage video poster. */
const HERO_ASSET = path.join(__dirname, "imgbb-asset-sources/providers/kiosk-parliament.png");

const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");
const KEY = (process.env.INGEST_API_KEY || "").trim();

function ml(name, map = {}) {
  const codes = ["hu", "es", "it", "he", "ar"];
  const out = {};
  for (const c of codes) out[c] = { name: map[c] || name };
  return out;
}

function sl(title, map = {}) {
  const codes = ["hu", "es", "it", "he", "ar"];
  const out = {};
  for (const c of codes) out[c] = { title: map[c] || title };
  return out;
}

function item(id, kind, name, tags, amount, localeNames = {}) {
  return {
    id,
    kind,
    name,
    tags,
    locales: ml(name, localeNames),
    price: { amount, currency: "HUF", unit: "each", source: "published" },
  };
}

const menu = {
  menuUrl: SOURCES[1],
  sourceUrls: SOURCES,
  lastVerifiedAt: "2026-05-16",
  sections: [
    {
      id: "small-plates",
      title: "Small plates",
      kind: "food",
      locales: sl("Small plates", {
        hu: "Kis falatok",
        es: "Entrantes",
        it: "Piccoli piatti",
        he: "מנות קטנות",
        ar: "أطباق صغيرة",
      }),
      items: [
        item("duck-liver", "food", "Duck liver pâté", ["hungarian"], 6650, {
          hu: "Kacsamájkrém",
          es: "Paté de hígado de pato",
          it: "Paté di fegatini d'anatra",
        }),
        item("beef-tartare", "food", "Beef tartare", ["hungarian"], 5650, { hu: "Marhatatár" }),
        item("casino-egg", "food", "Casino egg", ["hungarian"], 4450, { hu: "Kaszinótojás" }),
      ],
    },
    {
      id: "soups",
      title: "Soups",
      kind: "food",
      locales: sl("Soups", { hu: "Levesek", es: "Sopas", it: "Zuppe", he: "מרקים", ar: "حساء" }),
      items: [
        item("goulash-soup", "food", "Goulash soup", ["goulash", "hungarian"], 4950, { hu: "Gulyásleves" }),
        item("chicken-broth", "food", "Chicken broth", ["hungarian"], 3450, { hu: "Kakas húsleves" }),
      ],
    },
    {
      id: "icons",
      title: "KIOSK icons",
      kind: "food",
      locales: sl("KIOSK icons", {
        hu: "KIOSK ikonok",
        es: "Iconos KIOSK",
        it: "Icone KIOSK",
        he: "אייקוני KIOSK",
        ar: "أيقونات KIOSK",
      }),
      items: [
        item("paprikash", "food", "Chicken paprikash", ["goulash", "hungarian"], 6650, { hu: "Paprikás csirke" }),
        item("wiener-schnitzel", "food", "Traditional veal Wiener schnitzel", ["hungarian"], 7950, {
          hu: "Tradicionális borjú bécsi",
        }),
        item("budapest-burger", "food", "Budapest burger", ["street-food"], 6950, { hu: "Budapest burger" }),
      ],
    },
    {
      id: "signature-cocktails",
      title: "Signatures of KIOSK",
      kind: "drink",
      locales: sl("Signatures of KIOSK", {
        hu: "A KIOSK aláírásai",
        es: "Firmas de KIOSK",
        it: "Firme KIOSK",
        he: "חתימות KIOSK",
        ar: "توقيعات KIOSK",
      }),
      items: [
        item("eros-cocktail", "drink", "EROS", ["cocktail"], 5550),
        item("kiosk-cocktail", "drink", "KIOSK", ["cocktail"], 5550),
        item("negroni", "drink", "Negroni", ["cocktail"], 5050),
        item("espresso-martini", "drink", "Espresso Martini", ["cocktail", "coffee"], 5050),
      ],
    },
    {
      id: "spirits",
      title: "Pálinka & spirits",
      kind: "drink",
      locales: sl("Pálinka & spirits", {
        hu: "Pálinka és röviditalok",
        es: "Pálinka y destilados",
        it: "Pálinka e distillati",
        he: "פלינקה ומשקאות",
        ar: "بالينكا ومشروبات",
      }),
      items: [
        item("arpad-apricot", "drink", "Árpád aged apricot pálinka (4 cl)", ["palinka"], 4550, {
          hu: "Árpád dupla ágyas kajszibarack pálinka (4 cl)",
        }),
        item("unicum", "drink", "Unicum (4 cl)", ["palinka"], 2650, { hu: "Unicum (4 cl)" }),
      ],
    },
    {
      id: "coffee",
      title: "Coffee",
      kind: "drink",
      locales: sl("Coffee", { hu: "Kávé", es: "Café", it: "Caffè", he: "קפה", ar: "قهوة" }),
      items: [
        item("espresso", "drink", "Espresso", ["coffee"], 1150, { hu: "Espresso" }),
        item("cappuccino", "drink", "Cappuccino", ["coffee", "specialty-coffee"], 1450, { hu: "Cappuccino" }),
        item("flat-white", "drink", "Flat white", ["coffee", "specialty-coffee"], 1750, { hu: "Flat White" }),
      ],
    },
    {
      id: "wine",
      title: "Wines",
      kind: "drink",
      locales: sl("Wines", { hu: "Borok", es: "Vinos", it: "Vini", he: "יינות", ar: "نبيذ" }),
      items: [
        item("sauska-rose-brut", "drink", "Sauska Rosé Brut (0.1 l)", ["wine"], 1950, {
          hu: "Sauska Rosé Brut (0,1 l)",
        }),
        item("furmint-glass", "drink", "Szepsy Furmint (0.1 l)", ["wine"], 2950, { hu: "Szepsy Furmint (0,1 l)" }),
      ],
    },
  ],
};

const docFields = {
  name: "Kiosk Budapest",
  shortDescription:
    "Modern Hungarian bistro on Március 15. tér — Danube terrace, farm-driven kitchen, and signature cocktails from lunch until late.",
  longDescription: `KIOSK Budapest has been a downtown meeting place since 2013, pairing contemporary Hungarian cooking with a bold cocktail program and terrace views toward the Danube and Parliament. Kitchen pause daily 16:30–17:30; bills include a 15% service charge. Book via kiosk-budapest.hu.

Sources: ${SOURCES.join(" ")}`,
  website: SITE,
};

const locales = buildProviderLocales({ id: ID, ...docFields });
for (const loc of Object.values(locales)) {
  loc.longDescription = loc.longDescription.replace(/kioskbudapest\.com/gi, "kiosk-budapest.hu");
  loc.shortDescription = loc.shortDescription.replace(/Mediterranean|mediterrán/gi, (m) =>
    m.toLowerCase().includes("mediterr") ? "modern Hungarian" : m,
  );
}

async function uploadHero() {
  if (!fs.existsSync(HERO_ASSET)) {
    throw new Error(`Missing hero asset: ${HERO_ASSET}`);
  }
  const form = new FormData();
  form.append("file", new Blob([fs.readFileSync(HERO_ASSET)], { type: "image/png" }), "kiosk-parliament.png");
  const up = await fetch(`${BASE}/api/ingest/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
    body: form,
  });
  const json = await up.json();
  if (!json.url) throw new Error(`Upload failed: ${JSON.stringify(json)}`);
  return json.url;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!KEY && !dryRun) {
    console.error("Missing INGEST_API_KEY");
    process.exit(1);
  }

  let imageUrl = "";
  if (!dryRun) {
    imageUrl = await uploadHero();
    console.log("Uploaded hero:", imageUrl);
  }

  const patch = {
    address: "1056 Budapest, Március 15. tér 4, Hungary",
    phone: "+36 70 585 5727",
    email: "info@kiosk-budapest.hu",
    website: SITE,
    imageSource: HERO_ASSET,
    activityTypes: ["Fine Dining", "Cocktails", "Wine Bar", "Late Kitchen"],
    shortDescription: docFields.shortDescription,
    longDescription: docFields.longDescription,
    locales,
    menu,
  };
  if (!dryRun) patch.image = imageUrl;

  const payload = {
    sourceUrls: SOURCES,
    notes: "Fix Kiosk Budapest: wrong domain, wrong hero (metro kiosk), add published menu from kiosk-budapest.hu.",
    missingOrUncertain: [
      "Weekly specials on /heti-menu rotate — patch includes stable à la carte from /eteleink and /italaink only.",
    ],
    operations: [
      {
        resource: "provider",
        action: "patch",
        id: ID,
        patch,
      },
    ],
  };

  const outPath = path.join(__dirname, "ingest-payloads/patch-kiosk-budapest.json");
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  if (dryRun) {
    execSync(`npm run ingest:listing -- --dry-run "${outPath}"`, { stdio: "inherit", cwd: path.join(__dirname, "..") });
    console.log("Dry-run OK — wrote", outPath);
    return;
  }

  execSync(`npm run ingest:listing -- --force "${outPath}"`, { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("Ingested", ID);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
