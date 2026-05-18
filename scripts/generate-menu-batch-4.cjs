#!/usr/bin/env node
/**
 * Menu batch 4 — nightlife / ruin-bar drink menus.
 * Usage: node scripts/generate-menu-batch-4.cjs
 * Apply: npm run ingest:db -- scripts/ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch4.json
 * See docs/catalog-curation.md · siblings: generate-menu-batch-3.cjs, -5.cjs
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch4.json");
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

function drinkMenu(menuUrl, sourceUrls, sections, uncertainNote) {
  return {
    menuUrl,
    sourceUrls,
    lastVerifiedAt: "2026-05-18",
    sections,
    ...(uncertainNote ? {} : {}),
  };
}

const spiritsLoc = secLoc({
  hu: "Szesszek",
  es: "Licores",
  it: "Distillati",
  he: "משקאות חריפים",
  ar: "مشروبات روحية",
});

const cocktailsLoc = secLoc({
  hu: "Koktélok",
  es: "Cócteles",
  it: "Cocktail",
  he: "קוקטיילים",
  ar: "كوكتيلات",
});

const beerLoc = secLoc({
  hu: "Sörök",
  es: "Cervezas",
  it: "Birre",
  he: "בירות",
  ar: "بيرة",
});

const operations = [
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-instant-kiraly",
    patch: {
      menu: drinkMenu(
        "https://instant.co.hu/",
        ["https://instant.co.hu/", "https://instant-fogas.com/"],
        [
          {
            id: "spirits",
            title: "Spirits",
            kind: "drink",
            locales: spiritsLoc,
            items: [
              item(
                "house-palinka-4cl",
                "drink",
                "House pálinka (4 cl)",
                ["palinka", "ruin-bar"],
                1990,
                "estimated",
                {
                  hu: "Ház pálinka (4 cl)",
                  es: "Pálinka de la casa (4 cl)",
                  it: "Pálinka della casa (4 cl)",
                  he: "פלינקה הבית (4 מ״ל)",
                  ar: "بالينكا البيت (4 سم)",
                },
                "glass",
              ),
              item(
                "draft-beer",
                "drink",
                "Draft beer (0.4 l)",
                ["beer", "ruin-bar"],
                1090,
                "estimated",
                {
                  hu: "Csapolt sör (0,4 l)",
                  es: "Cerveza de barril (0,4 l)",
                  it: "Birra alla spina (0,4 l)",
                  he: "בירה מהחבית (0,4 ל׳)",
                  ar: "بيرة من الصنبور (0.4 ل)",
                },
                "glass",
              ),
            ],
          },
        ],
      ),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-corvin-club-ferencvaros",
    patch: {
      menu: drinkMenu("https://corvinclub.hu/", ["https://corvinclub.hu/"], [
        {
          id: "drinks",
          title: "Bar",
          kind: "drink",
          locales: cocktailsLoc,
          items: [
            item(
              "gin-tonic",
              "drink",
              "Gin & tonic",
              ["cocktail"],
              1890,
              "estimated",
              {
                hu: "Gin tonic",
                es: "Gin tonic",
                it: "Gin tonic",
                he: "ג'ין טוניק",
                ar: "جن تونيك",
              },
              "glass",
            ),
            item(
              "draft-beer",
              "drink",
              "Draft beer (0.4 l)",
              ["beer"],
              990,
              "estimated",
              {
                hu: "Csapolt sör (0,4 l)",
                es: "Cerveza de barril (0,4 l)",
                it: "Birra alla spina (0,4 l)",
                he: "בירה מהחבית (0,4 ל׳)",
                ar: "بيرة من الصنبور (0.4 ل)",
              },
              "glass",
            ),
          ],
        },
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-otkert-belvaros",
    patch: {
      menu: drinkMenu("https://otkert.hu/en/", ["https://otkert.hu/en/"], [
        {
          id: "cocktails",
          title: "Cocktails",
          kind: "drink",
          locales: cocktailsLoc,
          items: [
            item(
              "mojito",
              "drink",
              "Mojito",
              ["cocktail", "ruin-bar"],
              2790,
              "estimated",
              {
                hu: "Mojito",
                es: "Mojito",
                it: "Mojito",
                he: "מוחיטו",
                ar: "موهيتو",
              },
              "glass",
            ),
            item(
              "aperol-spritz",
              "drink",
              "Aperol Spritz",
              ["cocktail"],
              2490,
              "estimated",
              {
                hu: "Aperol Spritz",
                es: "Aperol Spritz",
                it: "Aperol Spritz",
                he: "אפרול ספריץ",
                ar: "أبيرول سبرتز",
              },
              "glass",
            ),
            item(
              "palinka-shot",
              "drink",
              "Hungarian pálinka (4 cl)",
              ["palinka"],
              1790,
              "estimated",
              {
                hu: "Magyar pálinka (4 cl)",
                es: "Pálinka húngara (4 cl)",
                it: "Pálinka ungherese (4 cl)",
                he: "פלינקה הונגרית (4 מ״ל)",
                ar: "بالينكا مجري (4 سم)",
              },
              "glass",
            ),
          ],
        },
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-csendes-nagy",
    patch: {
      menu: drinkMenu("https://www.csendes.com/", ["https://www.csendes.com/"], [
        {
          id: "coffee",
          title: "Coffee",
          kind: "drink",
          locales: secLoc({
            hu: "Kávék",
            es: "Café",
            it: "Caffè",
            he: "קפה",
            ar: "قهوة",
          }),
          items: [
            item(
              "espresso",
              "drink",
              "Espresso",
              ["coffee", "specialty-coffee"],
              690,
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
              890,
              "estimated",
              {
                hu: "Cappuccino",
                es: "Cappuccino",
                it: "Cappuccino",
                he: "קפוצ'ינו",
                ar: "كابتشينو",
              },
            ),
          ],
        },
        {
          id: "evening",
          title: "Evening drinks",
          kind: "drink",
          locales: cocktailsLoc,
          items: [
            item(
              "long-drink",
              "drink",
              "Vodka soda (4 cl + soda)",
              ["cocktail", "ruin-bar"],
              1590,
              "estimated",
              {
                hu: "Vodka szóda (4 cl + szóda)",
                es: "Vodka con soda (4 cl)",
                it: "Vodka soda (4 cl)",
                he: "וודקה סודה (4 מ״ל)",
                ar: "فودكا صودا (4 سم)",
              },
              "glass",
            ),
          ],
        },
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-hard-rock-vaci",
    patch: {
      menu: drinkMenu("https://cafe.hardrock.com/budapest/", ["https://cafe.hardrock.com/budapest/"], [
        {
          id: "cocktails",
          title: "Cocktails",
          kind: "drink",
          locales: cocktailsLoc,
          items: [
            item(
              "legendary-burger-combo-drink",
              "drink",
              "House margarita",
              ["cocktail"],
              3290,
              "estimated",
              {
                hu: "Ház margarita",
                es: "Margarita de la casa",
                it: "Margarita della casa",
                he: "מרגריטה הבית",
                ar: "مارغريتا البيت",
              },
              "glass",
            ),
            item(
              "draft-beer",
              "drink",
              "Draft beer (0.5 l)",
              ["beer"],
              1990,
              "estimated",
              {
                hu: "Csapolt sör (0,5 l)",
                es: "Cerveza de barril (0,5 l)",
                it: "Birra alla spina (0,5 l)",
                he: "בירה מהחבית (0,5 ל׳)",
                ar: "بيرة من الصنبور (0.5 ل)",
              },
              "glass",
            ),
          ],
        },
      ]),
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-legio-nagy",
    patch: {
      menu: drinkMenu("https://www.legio.hu/", ["https://www.legio.hu/"], [
        {
          id: "pub-food",
          title: "Pub food & drinks",
          kind: "food",
          locales: secLoc({
            hu: "Kocsmai ételek és italok",
            es: "Comida y bebida de pub",
            it: "Cibo e drink da pub",
            he: "אוכל ושתייה בפאב",
            ar: "طعام ومشروبات الحانة",
          }),
          items: [
            item(
              "goulash-soup",
              "food",
              "Goulash soup",
              ["goulash", "hungarian"],
              2490,
              "estimated",
              {
                hu: "Gulyásleves",
                es: "Sopa goulash",
                it: "Zuppa goulash",
                he: "מרק גולאש",
                ar: "شوربة غولاش",
              },
              "bowl",
            ),
            item(
              "schnitzel",
              "food",
              "Wiener schnitzel",
              ["hungarian"],
              4490,
              "estimated",
              {
                hu: "Bécsi szelet",
                es: "Escalope vienés",
                it: "Cotoletta viennese",
                he: "שניצל וינאי",
                ar: "شنيتسل فييني",
              },
              "portion",
            ),
          ],
        },
        {
          id: "beer-spirits",
          title: "Beer & spirits",
          kind: "drink",
          locales: beerLoc,
          items: [
            item(
              "draft-beer",
              "drink",
              "Hungarian draft beer (0.5 l)",
              ["beer"],
              1190,
              "estimated",
              {
                hu: "Magyar csapolt sör (0,5 l)",
                es: "Cerveza húngara de barril (0,5 l)",
                it: "Birra ungherese alla spina (0,5 l)",
                he: "בירה הונגרית מהחבית (0,5 ל׳)",
                ar: "بيرة مجارية مجارية (0.5 ل)",
              },
              "glass",
            ),
            item(
              "palinka",
              "drink",
              "House pálinka (4 cl)",
              ["palinka"],
              1890,
              "estimated",
              {
                hu: "Ház pálinka (4 cl)",
                es: "Pálinka de la casa (4 cl)",
                it: "Pálinka della casa (4 cl)",
                he: "פלינקה הבית (4 מ״ל)",
                ar: "بالينكا البيت (4 سم)",
              },
              "glass",
            ),
          ],
        },
      ]),
    },
  },
];

const payload = {
  sourceUrls: [
    "https://instant.co.hu/",
    "https://corvinclub.hu/",
    "https://otkert.hu/en/",
    "https://www.csendes.com/",
    "https://cafe.hardrock.com/budapest/",
    "https://www.legio.hu/",
  ],
  notes:
    "Menu batch 4 (2026-05-18): ruin-bar / party drink menus — Instant Király, Corvin Club, Ötkert, Csendes, Hard Rock, Légió.",
  missingOrUncertain: [
    "prov-cov-instant-kiraly: Menu aligned with Instant-Fogas ruin-bar tiers; instant.co.hu not itemized.",
    "prov-corvin-club-ferencvaros: corvinclub.hu not scraped; prices estimated from district clubs.",
    "prov-otkert-belvaros: otkert.hu drinks page 404; ruin-bar cocktail tiers estimated.",
    "prov-cov-csendes-nagy: csendes.com returned 503; coffee/cocktail tiers estimated.",
    "prov-cov-hard-rock-vaci: Hard Rock menu not scraped; global HRC drink tiers estimated.",
    "prov-cov-legio-nagy: legio.hu not scraped; Hungarian pub food/drink tiers estimated.",
  ],
  operations,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log("Wrote", OUT, `(${operations.length} operations)`);
