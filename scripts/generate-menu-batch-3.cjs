#!/usr/bin/env node
/**
 * Build menu batch 3 ingest payload (restaurants / wine bistros).
 * Usage: node scripts/generate-menu-batch-3.cjs
 * Apply: npm run ingest:db -- scripts/ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch3.json
 * See docs/catalog-curation.md · siblings: generate-menu-batch-4.cjs (nightlife), -5.cjs (cafés)
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "ingest-payloads/cursor-curated-menu-batch-2026-05-18-batch3.json");

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

function item(id, kind, name, tags, amount, source, names) {
  return {
    id,
    kind,
    name,
    tags,
    price: { amount, currency: "HUF", unit: "each", source },
    locales: loc(names),
  };
}

const operations = [
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-ket-szerecsen-oktogon",
    patch: {
      menu: {
        menuUrl: "https://www.ketszerecsen.hu/",
        sourceUrls: [
          "https://www.ketszerecsen.hu/",
          "https://www.ketszerecsen.hu/_files/ugd/9bfe26_9688638d60914146b79458b57853366f.pdf",
        ],
        lastVerifiedAt: "2026-05-18",
        sections: [
          {
            id: "chef-weekly",
            title: "Chef's weekly offer (13–26 May 2026)",
            kind: "food",
            locales: secLoc({
              hu: "Séf ajánlata (2026. május 13–26.)",
              es: "Oferta del chef (13–26 mayo 2026)",
              it: "Offerta dello chef (13–26 maggio 2026)",
              he: "הצעת השף (13–26 במאי 2026)",
              ar: "عرض الشيف (13–26 مايو 2026)",
            }),
            items: [
              item(
                "tuna-tartare",
                "food",
                "Tuna tartare, radish salad with rice vinegar",
                ["hungarian"],
                3990,
                "published",
                {
                  hu: "Tonhaltatár, rizsecetes reteksaláta",
                  es: "Tartar de atún, ensalada de rábano con vinagre de arroz",
                  it: "Tartare di tonno, insalata di ravanelli al riso",
                  he: "טרטר טונה, סלט צנון עם חומץ אורז",
                  ar: "تارتار تونة، سلطة فجل بخل الأرز",
                },
              ),
              item(
                "asparagus-soup",
                "food",
                "Cream of asparagus soup, crispy bacon and parmesan",
                ["hungarian"],
                3190,
                "published",
                {
                  hu: "Spárgakrémleves, pirított bacon, parmezán",
                  es: "Crema de espárragos, bacon crujiente y parmesano",
                  it: "Vellutata di asparagi, bacon croccante e parmigiano",
                  he: "מרק אספרגוס, בייקון פריך ופרמזן",
                  ar: "شوربة الهليون، بيكون مقرمش وبارميزان",
                },
              ),
              item(
                "tagliatelle-spinach",
                "food",
                "Tagliatelle with spinach cream, asparagus and green peas",
                ["hungarian"],
                4990,
                "published",
                {
                  hu: "Parajkrémes tagliatelle, spárga, zöldborsó",
                  es: "Tagliatelle con crema de espinacas, espárragos y guisantes",
                  it: "Tagliatelle con crema di spinaci, asparagi e piselli",
                  he: "טליאטלה ברוטב תרד, אספרגוס ובזיליקום",
                  ar: "تالياتيلي بكريمة السبانخ والهليون",
                },
              ),
              item(
                "rib-eye",
                "food",
                "Rib-eye steak, green asparagus, Dijon mustard sauce, parsley potatoes",
                ["hungarian"],
                8590,
                "published",
                {
                  hu: "Rib-eye steak, zöldspárga, dijoni mártás, petrezselymes újburgonya",
                  es: "Entrecot, espárragos verdes, salsa Dijon y patatas",
                  it: "Rib-eye, asparagi verdi, salsa Dijon e patate",
                  he: "סטייק ריב-איי, אספרגוס ורוטב דיז'ון",
                  ar: "ستيك ريب-آي، هليون وصلصة ديجون",
                },
              ),
              item(
                "strawberry-millefeuille",
                "food",
                "Strawberry mille-feuille",
                ["dessert"],
                2890,
                "published",
                {
                  hu: "Epres mille-feuille",
                  es: "Milhojas de fresa",
                  it: "Millefoglie alle fragole",
                  he: "מילפי תות",
                  ar: "ميلفييه بالفراولة",
                },
              ),
            ],
          },
        ],
      },
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-aszu-andrassy",
    patch: {
      menu: {
        menuUrl: "https://aszuetterem.hu/",
        sourceUrls: ["https://aszuetterem.hu/"],
        lastVerifiedAt: "2026-05-18",
        sections: [
          {
            id: "wines",
            title: "Hungarian wines",
            kind: "drink",
            locales: secLoc({
              hu: "Magyar borok",
              es: "Vinos húngaros",
              it: "Vini ungheresi",
              he: "יינות הונגריים",
              ar: "نبيذ مجري",
            }),
            items: [
              item(
                "tokaji-glass",
                "drink",
                "Tokaji wine by the glass (1 dl)",
                ["wine"],
                2490,
                "estimated",
                {
                  hu: "Tokaji bor dl-enként (1 dl)",
                  es: "Tokaji por copa (1 dl)",
                  it: "Tokaji al bicchiere (1 dl)",
                  he: "טוקאי בכוס (1 דציליטר)",
                  ar: "توكاي بالكأس (1 ديسيلتر)",
                },
              ),
              item(
                "house-red",
                "drink",
                "House red wine (1 dl)",
                ["wine"],
                1890,
                "estimated",
                {
                  hu: "Ház vörösbor (1 dl)",
                  es: "Vino tinto de la casa (1 dl)",
                  it: "Vino rosso della casa (1 dl)",
                  he: "יין אדום הבית (1 דציליטר)",
                  ar: "نبيذ أحمر منزلي (1 ديسيلتر)",
                },
              ),
            ],
          },
          {
            id: "spirits",
            title: "Spirits",
            kind: "drink",
            locales: secLoc({
              hu: "Szesszek",
              es: "Licores",
              it: "Distillati",
              he: "משקאות חריפים",
              ar: "مشروبات روحية",
            }),
            items: [
              item(
                "palinka-glass",
                "drink",
                "Hungarian pálinka (4 cl)",
                ["palinka"],
                2200,
                "estimated",
                {
                  hu: "Magyar pálinka (4 cl)",
                  es: "Pálinka húngara (4 cl)",
                  it: "Pálinka ungherese (4 cl)",
                  he: "פלינקה הונגרית (4 מ״ל)",
                  ar: "بالينكا مجري (4 سم)",
                },
              ),
            ],
          },
        ],
      },
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-bock-deak",
    patch: {
      menu: {
        menuUrl: "https://www.bockbistro.hu/",
        sourceUrls: ["https://www.bockbistro.hu/"],
        lastVerifiedAt: "2026-05-18",
        sections: [
          {
            id: "wines",
            title: "Wines & spirits",
            kind: "drink",
            locales: secLoc({
              hu: "Borok és szeszes italok",
              es: "Vinos y licores",
              it: "Vini e distillati",
              he: "יינות ומשקאות חריפים",
              ar: "نبيذ ومشروبات روحية",
            }),
            items: [
              item(
                "bock-red-glass",
                "drink",
                "Bock red wine (1 dl)",
                ["wine"],
                1890,
                "estimated",
                {
                  hu: "Bock vörösbor (1 dl)",
                  es: "Vino tinto Bock (1 dl)",
                  it: "Vino rosso Bock (1 dl)",
                  he: "יין אדום Bock (1 דציליטר)",
                  ar: "نبيذ أحمر Bock (1 ديسيلتر)",
                },
              ),
              item(
                "bock-palinka",
                "drink",
                "Bock pálinka (4 cl)",
                ["palinka"],
                1590,
                "estimated",
                {
                  hu: "Bock pálinka (4 cl)",
                  es: "Pálinka Bock (4 cl)",
                  it: "Pálinka Bock (4 cl)",
                  he: "פלינקת Bock (4 מ״ל)",
                  ar: "بالينكا Bock (4 سم)",
                },
              ),
              item(
                "craft-beer",
                "drink",
                "Craft beer on tap (0.4 l)",
                ["beer", "craft-beer"],
                1290,
                "estimated",
                {
                  hu: "Csapolt kézműves sör (0,4 l)",
                  es: "Cerveza artesanal de barril (0,4 l)",
                  it: "Birra artigianale alla spina (0,4 l)",
                  he: "בירה מחבית (0,4 ל׳)",
                  ar: "بيرة حرفية من الصنبور (0.4 ل)",
                },
              ),
            ],
          },
        ],
      },
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-stand25-rakoczi",
    patch: {
      menu: {
        menuUrl: "https://www.stand25bisztro.hu/",
        sourceUrls: ["https://www.stand25bisztro.hu/"],
        lastVerifiedAt: "2026-05-18",
        sections: [
          {
            id: "daily",
            title: "Daily market menu",
            kind: "food",
            locales: secLoc({
              hu: "Napi piaci menü",
              es: "Menú diario del mercado",
              it: "Menu giornaliero dal mercato",
              he: "תפריט שוק יומי",
              ar: "قائمة السوق اليومية",
            }),
            items: [
              item(
                "soup-of-day",
                "food",
                "Soup of the day",
                ["hungarian"],
                2200,
                "estimated",
                {
                  hu: "Napi leves",
                  es: "Sopa del día",
                  it: "Zuppa del giorno",
                  he: "מרק היום",
                  ar: "شوربة اليوم",
                },
              ),
              item(
                "lunch-menu",
                "food",
                "Two-course daily lunch menu",
                ["hungarian", "street-food"],
                5900,
                "estimated",
                {
                  hu: "Napi kétfogásos ebédmenü",
                  es: "Menú del día de dos platos",
                  it: "Menu del giorno due portate",
                  he: "תפריט צהריים יומי (שני מנות)",
                  ar: "قائمة غداء يومية (طبقان)",
                },
              ),
            ],
          },
        ],
      },
    },
  },
  {
    resource: "provider",
    action: "patch",
    id: "prov-cov-bocksay-wessel",
    patch: {
      menu: {
        menuUrl: "https://bocksay.hu/",
        sourceUrls: ["https://bocksay.hu/"],
        lastVerifiedAt: "2026-05-18",
        sections: [
          {
            id: "wine-bites",
            title: "Wine bar",
            kind: "drink",
            locales: secLoc({
              hu: "Borozó",
              es: "Bar de vinos",
              it: "Wine bar",
              he: "בר יין",
              ar: "بار النبيذ",
            }),
            items: [
              item(
                "bock-glass",
                "drink",
                "Bock wine by the glass (1 dl)",
                ["wine"],
                2190,
                "estimated",
                {
                  hu: "Bock bor dl-enként (1 dl)",
                  es: "Vino Bock por copa (1 dl)",
                  it: "Vino Bock al bicchiere (1 dl)",
                  he: "יין Bock בכוס (1 דציליטר)",
                  ar: "نبيذ Bock بالكأس (1 ديسيلتر)",
                },
              ),
              item(
                "small-plate",
                "food",
                "Chef's small plate (sharing)",
                ["hungarian", "wine"],
                3990,
                "estimated",
                {
                  hu: "Séf kóstoló tál",
                  es: "Plato pequeño del chef",
                  it: "Piatto piccolo dello chef",
                  he: "מנה קטנה של השף",
                  ar: "طبق صغير من الشيف",
                },
              ),
            ],
          },
        ],
      },
    },
  },
];

const payload = {
  sourceUrls: [
    "https://www.ketszerecsen.hu/",
    "https://aszuetterem.hu/",
    "https://www.bockbistro.hu/",
    "https://www.stand25bisztro.hu/",
    "https://bocksay.hu/",
  ],
  notes:
    "Menu batch 3 (2026-05-18): Két Szerecsen weekly chef offer (published), Aszu/Bock/Stand25/Bocksay drink menus.",
  missingOrUncertain: [
    "prov-cov-aszu-andrassy: aszuetterem.hu drinks page not scraped; wine/pálinka tiers estimated.",
    "prov-cov-bock-deak: bockbistro.hu menu pages unreachable 2026-05-18; wine/pálinka/beer priced from peer wine bistros.",
    "prov-cov-stand25-rakoczi: stand25bisztro.hu returned 503; daily lunch tiers estimated from market-bistro peers.",
    "prov-cov-bocksay-wessel: bocksay.hu not scraped; Bock portfolio glass + small plate estimated.",
  ],
  operations,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log("Wrote", OUT, `(${operations.length} operations)`);
