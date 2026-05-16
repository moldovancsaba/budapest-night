#!/usr/bin/env node
/**
 * Normalize menu section titles and item names to English on the root;
 * preserve Hungarian (and other locales) under locales.*.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LIVE_PATH = process.env.MENUS_FULL || "/tmp/menus-full-post-locale.json";
const OUT_PATH = path.join(
  ROOT,
  "scripts/ingest-payloads/cursor-patch-menu-en-root-2026-05-16.json",
);

/** @type {Record<string, { title?: string, huTitle?: string }>} */
const SECTION_ROOT = {
  "prov-mazel-tov-erzsebetvaros/coffee": {
    title: "Coffee & tea",
    huTitle: "Kávék és tea",
  },
  "prov-mazel-tov-erzsebetvaros/palinka": {
    title: "Pálinka",
    huTitle: "Pálinkák",
  },
  "prov-central-market-ferencvaros/lunch": {
    title: "Homestyle specialties",
    huTitle: "Házias specialitások",
  },
  "prov-central-market-ferencvaros/drinks": {
    title: "House drinks",
    huTitle: "Házi italok",
  },
  "prov-cov-frici-jewish-q/soups": { title: "Soups", huTitle: "Levesek" },
  "prov-cov-frici-jewish-q/mains": {
    title: "Main dishes",
    huTitle: "Készételek",
  },
  "prov-cov-daubner-oktogon/coffee": { title: "Coffee", huTitle: "Kávék" },
  "prov-new-york-cafe-belvaros/spirits": {
    title: "Pálinka (4 cl)",
    huTitle: "Pálinkák (4 cl)",
  },
};

/** @type {Record<string, { name: string, huName?: string }>} */
const ITEM_ROOT = {
  "prov-new-york-cafe-belvaros/espresso": {
    name: "Espresso",
    huName: "Eszpresszó",
  },
  "prov-new-york-cafe-belvaros/hungarian-coffee": {
    name: "Hungarian coffee",
    huName: "Magyar kávé",
  },
  "prov-new-york-cafe-belvaros/beef-goulash-soup": {
    name: "Beef goulash soup with homemade pinched pasta",
    huName: "Marhagulyás házi csipetkével",
  },
  "prov-new-york-cafe-belvaros/arpad-valogatas": {
    name: "Árpád selection 60% (4 cl)",
    huName: "Árpád válogatás 60% (4 cl)",
  },
  "prov-new-york-cafe-belvaros/paprikas-csirke": {
    name: "Chicken paprikash with homemade dumplings",
    huName: "Paprikás csirke házi galuskával",
  },
  "prov-mazel-tov-erzsebetvaros/arpad-kajszibarack": {
    name: "Árpád Hungarian apricot (40 ml)",
    huName: "Árpád Magyar kajszibarack (40 ml)",
  },
  "prov-mazel-tov-erzsebetvaros/arpad-irsai": {
    name: "Árpád Irsai Oliver (40 ml)",
    huName: "Árpád Irsai olivér (40 ml)",
  },
  "prov-central-market-ferencvaros/gulyasleves": {
    name: "Beef goulash soup",
    huName: "Gulyásleves marhahússal",
  },
  "prov-central-market-ferencvaros/sertes-porkolt": {
    name: "Pork stew with dumplings",
    huName: "Sertéspörkölt galuskával",
  },
  "prov-central-market-ferencvaros/goulash-tasting-plate": {
    name: 'Goulash tasting plate (goulash soup, chicken stew, pork stew)',
    huName:
      "„Goulash” kóstolótál (gulyásleves, csirkepörkölt, sertéspörkölt)",
  },
  "prov-central-market-ferencvaros/fakanal-palinka": {
    name: "Fakanál pálinka (swing-top bottle, Villány muscat)",
    huName: "Fakanál pálinka (csatos üvegben, Villányi muskotály)",
  },
  "prov-central-market-ferencvaros/lavazza-espresso": {
    name: "Lavazza espresso",
    huName: "Lavazza presszókávé",
  },
  "prov-cov-frici-jewish-q/gulyasleves": {
    name: "Goulash soup",
    huName: "Gulyásleves",
  },
  "prov-cov-frici-jewish-q/vorosboros-marhaporkolt": {
    name: "Beef stew in red wine",
    huName: "Vörösboros marhapörkölt",
  },
  "prov-cov-frici-jewish-q/paprikas-csirkemell": {
    name: "Chicken breast paprikash",
    huName: "Paprikás csirkemell",
  },
  "prov-cov-frici-jewish-q/brassoi": {
    name: "Brassói small roast (pork and potatoes)",
    huName: "Brassói aprópecsenye",
  },
  "prov-cov-daubner-oktogon/tejes-kave": {
    name: "Coffee with milk",
    huName: "Tejes kávé",
  },
};

const PROVIDER_IDS = new Set([
  ...Object.keys(SECTION_ROOT).map((k) => k.split("/")[0]),
  ...Object.keys(ITEM_ROOT).map((k) => k.split("/")[0]),
]);

function applySection(pid, sec) {
  const key = `${pid}/${sec.id}`;
  const rule = SECTION_ROOT[key];
  if (!rule) return false;
  const prevTitle = sec.title;
  sec.title = rule.title;
  sec.locales = sec.locales || {};
  sec.locales.hu = sec.locales.hu || {};
  sec.locales.hu.title = rule.huTitle ?? prevTitle;
  return true;
}

function applyItem(pid, it) {
  const key = `${pid}/${it.id}`;
  const rule = ITEM_ROOT[key];
  if (!rule) return false;
  const prevName = it.name;
  it.name = rule.name;
  it.locales = it.locales || {};
  it.locales.hu = it.locales.hu || {};
  it.locales.hu.name = rule.huName ?? prevName;
  return true;
}

function normalizeMenu(provider) {
  const menu = JSON.parse(JSON.stringify(provider.menu));
  delete menu.venueLink;
  let changed = 0;
  for (const sec of menu.sections || []) {
    if (applySection(provider.id, sec)) changed++;
    for (const it of sec.items || []) {
      if (applyItem(provider.id, it)) changed++;
    }
  }
  return { menu, changed };
}

function main() {
  const live = JSON.parse(fs.readFileSync(LIVE_PATH, "utf8"));
  const operations = [];
  for (const provider of live) {
    if (!PROVIDER_IDS.has(provider.id)) continue;
    const { menu, changed } = normalizeMenu(provider);
    if (!changed) {
      console.warn(`WARN: no changes for ${provider.id}`);
      continue;
    }
    operations.push({
      resource: "provider",
      action: "patch",
      id: provider.id,
      patch: { menu },
    });
    console.log(`${provider.id}: ${changed} root fields normalized`);
  }

  const payload = {
    sourceUrls: [
      "https://newyorkcafe.hu/en/cafe-menu/",
      "https://mazeltov.hu/itallap",
      "https://fakanaletterem.hu/etlap/",
      "https://www.fricipapa.hu/menus",
      "http://daubnercukraszda.hu/content/kiegeszitok",
    ],
    notes:
      "Normalize menu root title/name to English (en fallback); Hungarian lines moved to locales.hu only. Five providers with bilingual or HU-only printed menus.",
    missingOrUncertain: [],
    operations,
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} patches → ${OUT_PATH}`);
}

main();
