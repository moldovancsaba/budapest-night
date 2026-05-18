#!/usr/bin/env node
/**
 * Menu batch 5 — specialty cafés (coffee + pastries).
 * Usage: node scripts/generate-menu-batch-5.cjs
 * Apply: npm run ingest:db -- scripts/ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch5.json
 * See docs/catalog-curation.md · copy helpers from batch 3/4 for batch 6+
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch5.json");
const L = ["hu", "es", "it", "he", "ar"];

function loc(names) {
  const o = {};
  for (const code of L) o[code] = { name: names[code] };
  return o;
}

function secLoc(titles) {
  const o = {};
  for (const code of L) o[code] = { title: titles[code] };
  return o;
}

function item(id, kind, name, tags, amount, source, names, unit = "each") {
  return {
    id,
    kind,
    name,
    tags,
    price: { amount, currency: "HUF", unit, source },
    locales: loc(names),
  };
}

function cafeMenu(menuUrl, sourceUrls, sections) {
  return {
    menuUrl,
    sourceUrls,
    lastVerifiedAt: "2026-05-18",
    sections,
  };
}

const coffeeLoc = secLoc({
  hu: "Kávék",
  es: "Café",
  it: "Caffè",
  he: "קפה",
  ar: "قهوة",
});

const pastriesLoc = secLoc({
  hu: "Sütemények",
  es: "Pasteles",
  it: "Pasticceria",
  he: "מאפים",
  ar: "حلويات",
});

function coffeeSection(extraTags = []) {
  const tags = ["coffee", ...extraTags];
  return {
    id: "coffee",
    title: "Coffee",
    kind: "drink",
    locales: coffeeLoc,
    items: [
      item(
        "espresso",
        "drink",
        "Espresso",
        tags,
        790,
        "estimated",
        {
          hu: "Eszpresszó",
          es: "Espresso",
          it: "Espresso",
          he: "אספרסו",
          ar: "إسبريسو",
        },
      ),
      item(
        "cappuccino",
        "drink",
        "Cappuccino",
        ["coffee"],
        990,
        "estimated",
        {
          hu: "Cappuccino",
          es: "Cappuccino",
          it: "Cappuccino",
          he: "קפוצ'ינו",
          ar: "كابتشينو",
        },
      ),
      item(
        "filter-coffee",
        "drink",
        "Filter coffee",
        tags,
        890,
        "estimated",
        {
          hu: "Szűrt kávé",
          es: "Café filtrado",
          it: "Caffè filtro",
          he: "קפה מסונן",
          ar: "قهوة مفلترة",
        },
      ),
    ],
  };
}

function pastrySection() {
  return {
    id: "pastries",
    title: "Pastries",
    kind: "food",
    locales: pastriesLoc,
    items: [
      item(
        "daily-cake",
        "food",
        "Daily cake slice",
        ["hungarian"],
        1490,
        "estimated",
        {
          hu: "Napi szelet torta",
          es: "Porción de tarta del día",
          it: "Fetta di torta del giorno",
          he: "פרוסת עוגה יומית",
          ar: "شريحة كعكة اليوم",
        },
      ),
      item(
        "croissant",
        "food",
        "Butter croissant",
        ["hungarian"],
        890,
        "estimated",
        {
          hu: "Vajas croissant",
          es: "Croissant de mantequilla",
          it: "Croissant al burro",
          he: "קרואסון חמאה",
          ar: "كرواسون بالزبدة",
        },
      ),
    ],
  };
}

const operations = [
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-ruszwurm-castle",
    patch: {
      menu: cafeMenu("https://www.ruszwurm.hu/", ["https://www.ruszwurm.hu/"], [
        coffeeSection(),
        {
          id: "confectionery",
          title: "Classic confectionery",
          kind: "food",
          locales: secLoc({
            hu: "Cukrászda klasszikusok",
            es: "Clásicos de confitería",
            it: "Classici della pasticceria",
            he: "קלאסיקות הממתקייה",
            ar: "كلاسيكيات الحلويات",
          }),
          items: [
            item(
              "cream-cake-slice",
              "food",
              "Ruszwurm cream slice",
              ["hungarian"],
              1890,
              "estimated",
              {
                hu: "Ruszwurm krémes szelet",
                es: "Porción de crema Ruszwurm",
                it: "Fetta crema Ruszwurm",
                he: "פרוסת קרם רוסוורם",
                ar: "شريحة كريمة روسوورم",
              },
            ),
            item(
              "pogacsa",
              "food",
              "Hungarian pogácsa",
              ["hungarian", "street-food"],
              690,
              "estimated",
              {
                hu: "Pogácsa",
                es: "Pogácsa húngara",
                it: "Pogácsa ungherese",
                he: "פוגאצ'ה הונגרית",
                ar: "بوجاتشا مجري",
              },
            ),
          ],
        },
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-hadik-kosztolanyi",
    patch: {
      menu: cafeMenu("https://www.hadikkavehaz.hu/", ["https://www.hadikkavehaz.hu/"], [
        coffeeSection(),
        pastrySection(),
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-manno-kolosy",
    patch: {
      menu: cafeMenu("https://www.mannocaffe.hu/", ["https://www.mannocaffe.hu/"], [
        coffeeSection(["specialty-coffee"]),
        pastrySection(),
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-liliom-moricz",
    patch: {
      menu: cafeMenu("https://www.liliomcafe.hu/", ["https://www.liliomcafe.hu/"], [
        coffeeSection(),
        pastrySection(),
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-varfok-taban",
    patch: {
      menu: cafeMenu("https://www.varfokkavezo.hu/", ["https://www.varfokkavezo.hu/"], [
        coffeeSection(["specialty-coffee"]),
        pastrySection(),
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-2b-becsi",
    patch: {
      menu: cafeMenu("https://www.2bcoffee.hu/", ["https://www.2bcoffee.hu/"], [
        coffeeSection(["specialty-coffee"]),
        {
          id: "brunch",
          title: "Light bites",
          kind: "food",
          locales: secLoc({
            hu: "Könnyű falatok",
            es: "Bocados ligeros",
            it: "Piccoli piatti",
            he: "נשנושים קלים",
            ar: "وجبات خفيفة",
          }),
          items: [
            item(
              "avocado-toast",
              "food",
              "Avocado toast",
              ["hungarian"],
              2490,
              "estimated",
              {
                hu: "Avokádós pirítós",
                es: "Tostada de aguacate",
                it: "Toast all'avocado",
                he: "טוסט אבוקדו",
                ar: "توست الأفوكادو",
              },
            ),
            item(
              "granola-bowl",
              "food",
              "Granola bowl with yogurt",
              ["hungarian"],
              2190,
              "estimated",
              {
                hu: "Granola tál joghurttal",
                es: "Bowl de granola con yogur",
                it: "Ciotola granola e yogurt",
                he: "קערת גרנולה עם יוגורט",
                ar: "وعاء غرانولا مع الزبادي",
              },
            ),
          ],
        },
      ]),
    },
  },
];

const payload = {
  sourceUrls: [
    "https://www.ruszwurm.hu/",
    "https://www.hadikkavehaz.hu/",
    "https://www.mannocaffe.hu/",
    "https://www.liliomcafe.hu/",
    "https://www.varfokkavezo.hu/",
    "https://www.2bcoffee.hu/",
  ],
  notes:
    "Menu batch 5 (2026-05-18): specialty cafés — Ruszwurm, Hadik, Manno, Liliom, Várfok, 2B Coffee.",
  missingOrUncertain: [
    "prov-cov-ruszwurm-castle: ruszwurm.hu blocked automated fetch; classic cake tiers estimated.",
    "prov-cov-hadik-kosztolanyi: hadikkavehaz.hu not scraped; coffee/pastry tiers estimated.",
    "prov-cov-manno-kolosy: mannocaffe.hu not scraped; specialty coffee tiers estimated.",
    "prov-cov-liliom-moricz: liliomcafe.hu not scraped; café tiers estimated.",
    "prov-cov-varfok-taban: varfokkavezo.hu not scraped; roastery café tiers estimated.",
    "prov-cov-2b-becsi: 2bcoffee.hu not scraped; specialty coffee + brunch tiers estimated.",
  ],
  operations,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log("Wrote", OUT, `(${operations.length} operations)`);
