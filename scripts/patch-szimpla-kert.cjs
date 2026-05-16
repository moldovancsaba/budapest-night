#!/usr/bin/env node
/**
 * Replace placeholder Szimpla menu with items from official chalkboard (szimpla.hu/drinks_202403.jpg).
 * Usage: node scripts/patch-szimpla-kert.cjs [--dry-run]
 */
require("./load-env.cjs");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { buildProviderLocales } = require("./lib/build-provider-locales.cjs");

const ID = "prov-szimpla-kert-erzsebetvaros";
const SITE = "https://szimpla.hu/";
const MENU_PAGE = "https://szimpla.hu/drinks.html";
const MENU_IMAGE = "https://szimpla.hu/drinks_202403.jpg";
const SOURCES = [SITE, MENU_PAGE, MENU_IMAGE, "https://szimpla.hu/info.html"];

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

function item(id, kind, name, tags, amount, opts = {}) {
  const { unit = "each", localeNames = {}, description } = opts;
  const row = {
    id,
    kind,
    name,
    tags,
    locales: ml(name, localeNames),
    price: { amount, currency: "HUF", unit, source: "published" },
  };
  if (description) row.description = description;
  return row;
}

const menu = {
  menuUrl: MENU_PAGE,
  sourceUrls: SOURCES,
  lastVerifiedAt: "2026-05-16",
  sections: [
    {
      id: "food",
      title: "Food",
      kind: "food",
      locales: sl("Food", {
        hu: "Ételek",
        es: "Comida",
        it: "Cibo",
        he: "אוכל",
        ar: "طعام",
      }),
      items: [
        item("pulled-pork-flautas", "food", "Pulled pork flautas", ["hungarian"], 4200, {
          localeNames: { hu: "Pulled pork flautas" },
          description: "BBQ pork, cheese, pickles, garlic sour cream",
        }),
        item("barbacoa-flautas", "food", "Barbacoa flautas", ["hungarian"], 4200, {
          localeNames: { hu: "Barbacoa flautas" },
          description: "BBQ beef, Mexican rice, cheese, tomato salsa",
        }),
        item("hortobagy-flautas", "food", "Hortobágyi flautas", ["hungarian"], 4200, {
          localeNames: { hu: "Hortobágyi flautas" },
          description: "Chicken paprikás, pickles, sour cream",
        }),
        item("vega-wrap", "food", "Vega wrap", ["hungarian"], 4200, {
          localeNames: { hu: "Vega wrap" },
          description: "Grilled cheese, veggies, roasted tomato, caper mayo",
        }),
        item("grill-plate-2", "food", "Grill plate (for 2)", ["hungarian"], 9200, {
          localeNames: { hu: "Grill tál (2 főre)" },
          description: "3 sausages, grilled cheese, fries, pickles, honey mustard, caper mayo",
        }),
        item("langos-crackers", "food", "Lángos crackers", ["hungarian"], 3000, {
          localeNames: { hu: "Lángos crackers" },
          description: "Sour cream, cheese, fresh chives",
        }),
      ],
    },
    {
      id: "beer-tap",
      title: "Beer on tap",
      kind: "drink",
      locales: sl("Beer on tap", {
        hu: "Csapolt sör",
        es: "Cerveza de barril",
        it: "Birra alla spina",
        he: "בירה מהחבית",
        ar: "بيرة من الصنبور",
      }),
      items: [
        item("pilsner-urquell-03", "drink", "Pilsner Urquell (0.3 l)", ["beer"], 1600, {
          unit: "glass",
          localeNames: { hu: "Pilsner Urquell (0,3 l)" },
        }),
        item("pilsner-urquell-05", "drink", "Pilsner Urquell (0.5 l)", ["beer"], 2000, {
          unit: "glass",
          localeNames: { hu: "Pilsner Urquell (0,5 l)" },
        }),
        item("wheat-beer-05", "drink", "Wheat beer (0.5 l)", ["beer"], 1800, {
          unit: "glass",
          localeNames: { hu: "Búzasör (0,5 l)" },
        }),
        item("konrad-lager-05", "drink", "Konrad lager (0.5 l)", ["beer"], 1700, {
          unit: "glass",
          localeNames: { hu: "Konrad lager (0,5 l)" },
        }),
        item("flying-rabbit-ipa", "drink", "Flying Rabbit IPA (0.4 l)", ["beer", "craft-beer"], 1800, {
          unit: "glass",
          localeNames: { hu: "Flying Rabbit IPA (0,4 l)" },
        }),
        item("magners-cider", "drink", "Magners apple cider (0.5 l)", ["beer"], 2500, {
          unit: "glass",
          localeNames: { hu: "Magners alma cider (0,5 l)" },
        }),
      ],
    },
    {
      id: "wine",
      title: "Wine & fröccs",
      kind: "drink",
      locales: sl("Wine & fröccs", {
        hu: "Bor és fröccs",
        es: "Vino y fröccs",
        it: "Vino e fröccs",
        he: "יין ופרוץ'",
        ar: "نبيذ وفرۆتش",
      }),
      items: [
        item("house-wine-2dl", "drink", "House wine white/rosé (2 dl)", ["wine"], 1000, {
          unit: "glass",
          localeNames: { hu: "Házbor fehér/rozé (2 dl)" },
        }),
        item("quality-wine-2dl", "drink", "Quality wine white/red (2 dl)", ["wine"], 1600, {
          unit: "glass",
          localeNames: { hu: "Prémium bor fehér/vörös (2 dl)" },
        }),
        item("kis-froccs", "drink", "Kis fröccs (1:1)", ["wine"], 600, {
          unit: "glass",
          localeNames: { hu: "Kis fröccs (1:1)" },
        }),
        item("nagy-froccs", "drink", "Nagy fröccs (2:1)", ["wine"], 1100, {
          unit: "glass",
          localeNames: { hu: "Nagy fröccs (2:1)" },
        }),
        item("prosecco-tap", "drink", "Prosecco on tap (1.5 dl)", ["wine"], 1500, {
          unit: "glass",
          localeNames: { hu: "Prosecco csap (1,5 dl)" },
        }),
      ],
    },
    {
      id: "spirits",
      title: "Spirits (4 cl)",
      kind: "drink",
      locales: sl("Spirits (4 cl)", {
        hu: "Szesszek (4 cl)",
        es: "Licores (4 cl)",
        it: "Distillati (4 cl)",
        he: "משקאות חריפים (4 ס״מ)",
        ar: "مشروبات روحية (4 سم)",
      }),
      items: [
        item("palinka-apricot", "drink", "Pálinka — apricot", ["palinka"], 2500, {
          unit: "glass",
          localeNames: { hu: "Pálinka — barack" },
        }),
        item("palinka-pear", "drink", "Pálinka — pear", ["palinka"], 2500, {
          unit: "glass",
          localeNames: { hu: "Pálinka — körte" },
        }),
        item("palinka-cherry", "drink", "Pálinka — cherry", ["palinka"], 2500, {
          unit: "glass",
          localeNames: { hu: "Pálinka — cseresznye" },
        }),
        item("forras-plum", "drink", "Forrás plum pálinka 55% (4 cl)", ["palinka"], 2000, {
          unit: "glass",
          localeNames: { hu: "Forrás szilvapálinka 55% (4 cl)" },
        }),
        item("beefeater-gin", "drink", "Beefeater gin (4 cl)", ["cocktail"], 2000, {
          unit: "glass",
          localeNames: { hu: "Beefeater gin (4 cl)" },
        }),
        item("jameson", "drink", "Jameson (4 cl)", [], 2000, {
          unit: "glass",
          localeNames: { hu: "Jameson (4 cl)" },
        }),
        item("jim-beam", "drink", "Jim Beam (4 cl)", [], 2000, {
          unit: "glass",
          localeNames: { hu: "Jim Beam (4 cl)" },
        }),
        item("unicum", "drink", "Zwack Unicum (4 cl)", [], 2000, {
          unit: "glass",
          localeNames: { hu: "Zwack Unicum (4 cl)" },
        }),
      ],
    },
    {
      id: "soft",
      title: "Non-alcoholic",
      kind: "drink",
      locales: sl("Non-alcoholic", {
        hu: "Alkoholmentes",
        es: "Sin alcohol",
        it: "Analcolici",
        he: "ללא אלכוהול",
        ar: "بدون كحول",
      }),
      items: [
        item("soft-drink", "drink", "Soft drink (Pepsi, tonic, water)", [], 800, {
          localeNames: { hu: "Üdítő (Pepsi, tonic, víz)" },
        }),
        item("juice-3dl", "drink", "Juice (3 dl)", [], 900, {
          unit: "glass",
          localeNames: { hu: "Gyümölcslé (3 dl)" },
        }),
        item("red-bull", "drink", "Red Bull", [], 1800, {
          localeNames: { hu: "Red Bull" },
        }),
        item("tea", "drink", "Tea", [], 900, {
          unit: "each",
          localeNames: { hu: "Tea" },
        }),
      ],
    },
  ],
};

const docFields = {
  name: "Szimpla Kert",
  shortDescription:
    "Iconic ruin bar in the Jewish Quarter — courtyards, live music, street food, and Budapest nightlife energy.",
  longDescription: `Szimpla Kert is one of Budapest's best-known ruin bars on Kazinczy utca. Expect rambling courtyards, chalkboard food and drink menus, concerts, and a packed weekend crowd. Free entry — you pay only for what you order. Check szimpla.hu for tonight's program.

Sources: ${SOURCES.join(" ")}`,
  website: SITE,
};

const locales = buildProviderLocales({ id: ID, ...docFields });
locales.hu = {
  name: "Szimpla Kert",
  shortDescription:
    "Ikonikus romkocsma a Zsidó negyedben — udvarok, élő zene, street food és budapesti éjszakai hangulat.",
  longDescription: `A Szimpla Kert Budapest egyik leghíresebb romkocsmája a Kazinczy utcában. Krétatáblás étlap és italok, koncertek, zsúfolt hétvégi tömeg. A belépés ingyenes — csak amit fogyasztasz, azt fizeted. Mai program: szimpla.hu.

Sources: ${SOURCES.join(" ")}`,
  slug: "szimpla-kert",
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const KEY = (process.env.INGEST_API_KEY || "").trim();
  if (!KEY && !dryRun) {
    console.error("Missing INGEST_API_KEY");
    process.exit(1);
  }

  const patch = {
    phone: "+36 1 352 4198",
    email: "kert@szimpla.hu",
    website: SITE,
    rating: 0,
    reviewCount: 0,
    activityTypes: ["Ruin Bar", "Live Music", "Craft Beer", "Late Kitchen"],
    shortDescription: docFields.shortDescription,
    longDescription: docFields.longDescription,
    locales,
    menu,
  };

  const payload = {
    sourceUrls: SOURCES,
    notes:
      "Szimpla Kert: replace placeholder menu with chalkboard items from official drinks_202403.jpg; drop fake Google rating.",
    missingOrUncertain: [
      "Full spirit list on chalkboard — patch includes representative 4 cl pours; see drinks_202403.jpg for full board.",
      "Chalkboard dated Feb 2024 on szimpla.hu — re-check in venue if a price looks off.",
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

  const outPath = path.join(__dirname, "ingest-payloads/patch-szimpla-kert.json");
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  if (dryRun) {
    execSync(`npm run ingest:listing -- --dry-run "${outPath}"`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("Dry-run OK — wrote", outPath);
    return;
  }

  execSync(`npm run ingest:listing -- --force "${outPath}"`, {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
  console.log("Ingested", ID);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
