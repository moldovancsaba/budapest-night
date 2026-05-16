#!/usr/bin/env node
/**
 * Build menu locale audit patch from live export + curated locale sources.
 * Usage: node scripts/build-menu-locale-patch.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const LIVE_PATH = process.env.MENUS_FULL || "/tmp/menus-full.json";
const OUT_PATH = path.join(
  ROOT,
  "scripts/ingest-payloads/cursor-patch-menu-audit-fixes-2026-05-16.json",
);

const LOCALES = ["hu", "es", "it", "he", "ar"];

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function indexMenuFromPayload(payloadPath, providerId) {
  const data = loadJson(payloadPath);
  const op = data.operations.find(
    (o) => o.resource === "provider" && o.id === providerId,
  );
  if (!op?.patch?.menu && !op?.document?.menu) return null;
  const menu = op.patch?.menu ?? op.document.menu;
  const sections = new Map();
  const items = new Map();
  for (const sec of menu.sections || []) {
    sections.set(sec.id, sec);
    for (const it of sec.items || []) {
      items.set(`${sec.id}/${it.id}`, it);
    }
  }
  return { sections, items };
}

const kioskIdx = indexMenuFromPayload(
  "scripts/ingest-payloads/patch-kiosk-budapest.json",
  "prov-cov-kiosk-parliament",
);
const bar360Idx = indexMenuFromPayload(
  "scripts/ingest-payloads/cursor-curated-menu-batch-2026-05-16-360bar.json",
  "prov-360-bar-terezvaros",
);

/** @type {Record<string, Record<string, { hu: string, es: string, it: string, he: string, ar: string }>>} */
const SECTION_TITLES = {
  "Coffee & Tea": {
    hu: "Kávé és tea",
    es: "Café y té",
    it: "Caffè e tè",
    he: "קפה ותה",
    ar: "قهوة وشاي",
  },
  "Chocolate drinks": {
    hu: "Csokoládéitalok",
    es: "Bebidas de chocolate",
    it: "Bevande al cioccolato",
    he: "משקאות שוקולד",
    ar: "مشروبات الشوكولاتة",
  },
  "Coffee specialities": {
    hu: "Kávé specialitások",
    es: "Especialidades de café",
    it: "Specialità di caffè",
    he: "מיוחדות קפה",
    ar: "تخصصات القهوة",
  },
  Soups: {
    hu: "Levesek",
    es: "Sopas",
    it: "Zuppe",
    he: "מרקים",
    ar: "حساء",
  },
  "Pálinkák (4 cl)": {
    hu: "Pálinkák (4 cl)",
    es: "Pálinka (4 cl)",
    it: "Pálinka (4 cl)",
    he: "פלינקה (4 מ״ל)",
    ar: "بالينكا (4 سم)",
  },
  "Main courses": {
    hu: "Főételek",
    es: "Platos principales",
    it: "Piatti principali",
    he: "מנות עיקריות",
    ar: "أطباق رئيسية",
  },
  Spirits: {
    hu: "Szesszek",
    es: "Licores",
    it: "Distillati",
    he: "משקאות חריפים",
    ar: "مشروبات روحية",
  },
  "Kávék & tea": {
    hu: "Kávék és tea",
    es: "Cafés y té",
    it: "Caffè e tè",
    he: "קפה ותה",
    ar: "قهوة وشاي",
  },
  Pálinkák: {
    hu: "Pálinkák",
    es: "Pálinka",
    it: "Pálinka",
    he: "פלינקה",
    ar: "بالينكا",
  },
  Cocktails: {
    hu: "Koktélok",
    es: "Cócteles",
    it: "Cocktail",
    he: "קוקטיילים",
    ar: "كوكتيلات",
  },
  "Házias specialitások": {
    hu: "Házias specialitások",
    es: "Especialidades caseras",
    it: "Specialità della casa",
    he: "מנות ביתיות",
    ar: "أطباق منزلية",
  },
  "Házi italok": {
    hu: "Házi italok",
    es: "Bebidas de la casa",
    it: "Bevande della casa",
    he: "משקאות הבית",
    ar: "مشروبات منزلية",
  },
  Coffee: {
    hu: "Kávé",
    es: "Café",
    it: "Caffè",
    he: "קפה",
    ar: "قهوة",
  },
  Starters: {
    hu: "Előételek",
    es: "Entrantes",
    it: "Antipasti",
    he: "מנות ראשונות",
    ar: "مقبلات",
  },
  "Spirits (4 cl)": {
    hu: "Szesszek (4 cl)",
    es: "Licores (4 cl)",
    it: "Distillati (4 cl)",
    he: "משקאות חריפים (4 מ״ל)",
    ar: "مشروبات روحية (4 سم)",
  },
  Levesek: {
    hu: "Levesek",
    es: "Sopas",
    it: "Zuppe",
    he: "מרקים",
    ar: "حساء",
  },
  Készételek: {
    hu: "Készételek",
    es: "Platos preparados",
    it: "Piatti pronti",
    he: "מנות מוכנות",
    ar: "أطباق جاهزة",
  },
  Kávék: {
    hu: "Kávék",
    es: "Cafés",
    it: "Caffè",
    he: "קפה",
    ar: "قهوة",
  },
};

/** @type {Record<string, Record<string, { hu: string, es: string, it: string, he: string, ar: string }>>} */
const ITEM_NAMES = {
  // Gerbeaud
  "prov-gerbeaud-belvaros/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-gerbeaud-belvaros/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  "prov-gerbeaud-belvaros/flat-white": {
    hu: "Flat white",
    es: "Flat white",
    it: "Flat white",
    he: "פלאט וויט",
    ar: "فلات وايت",
  },
  "prov-gerbeaud-belvaros/caffe-latte": {
    hu: "Caffé latte",
    es: "Café con leche",
    it: "Caffellatte",
    he: "לאטה",
    ar: "لاتيه",
  },
  "prov-gerbeaud-belvaros/hot-dark-chocolate": {
    hu: "Forró csokoládé tejszínhabbal",
    es: "Chocolate caliente con nata",
    it: "Cioccolata calda con panna",
    he: "שוקולד חם עם קצפת",
    ar: "شوكولاتة ساخنة مع كريمة",
  },
  // New York Café
  "prov-new-york-cafe-belvaros/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-new-york-cafe-belvaros/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  "prov-new-york-cafe-belvaros/latte-macchiato": {
    hu: "Latte macchiato",
    es: "Latte macchiato",
    it: "Latte macchiato",
    he: "לאטה מקיאטו",
    ar: "لاتيه ماكياتو",
  },
  "prov-new-york-cafe-belvaros/hungarian-coffee": {
    hu: "Magyar kávé",
    es: "Café húngaro",
    it: "Caffè ungherese",
    he: "קפה הונגרי",
    ar: "قهوة مجرية",
  },
  "prov-new-york-cafe-belvaros/beef-goulash-soup": {
    hu: "Marhagulyás házi csipetkével",
    es: "Sopa goulash de ternera con pasta casera",
    it: "Zuppa goulash di manzo con pasta fatta in casa",
    he: "מרק גולאש בקר עם פסטה ביתית",
    ar: "حساء غولاش لحم بقري مع معكرونة منزلية",
  },
  "prov-new-york-cafe-belvaros/arpad-valogatas": {
    hu: "Árpád válogatás 60% (4 cl)",
    es: "Selección Árpád 60% (4 cl)",
    it: "Selezione Árpád 60% (4 cl)",
    he: "Árpád מבחר 60% (4 מ״ל)",
    ar: "تشكيلة Árpád 60% (4 سم)",
  },
  "prov-new-york-cafe-belvaros/paprikas-csirke": {
    hu: "Paprikás csirke házi galuskával",
    es: "Pollo al pimentón con ñoquis caseros",
    it: "Pollo al paprika con gnocchi fatti in casa",
    he: "עוף פפריקה עם גנוקי ביתי",
    ar: "دجاج بالفلفل الحلو مع نيوكي منزلي",
  },
  // Szimpla / Instant
  "prov-szimpla-kert-erzsebetvaros/house-palinka-4cl": {
    hu: "Ház pálinka (4 cl)",
    es: "Pálinka de la casa (4 cl)",
    it: "Pálinka della casa (4 cl)",
    he: "פלינקה הבית (4 מ״ל)",
    ar: "بالينكا البيت (4 سم)",
  },
  "prov-instant-fogas-erzsebetvaros/house-palinka-4cl": {
    hu: "Ház pálinka (4 cl)",
    es: "Pálinka de la casa (4 cl)",
    it: "Pálinka della casa (4 cl)",
    he: "פלינקה הבית (4 מ״ל)",
    ar: "بالينكا البيت (4 سم)",
  },
  // Mazel Tov
  "prov-mazel-tov-erzsebetvaros/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-mazel-tov-erzsebetvaros/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  "prov-mazel-tov-erzsebetvaros/flat-white": {
    hu: "Flat white",
    es: "Flat white",
    it: "Flat white",
    he: "פלאט וויט",
    ar: "فلات وايت",
  },
  "prov-mazel-tov-erzsebetvaros/arpad-kajszibarack": {
    hu: "Árpád Magyar kajszibarack (40 ml)",
    es: "Árpád albaricoque húngaro (40 ml)",
    it: "Árpád albicocca ungherese (40 ml)",
    he: "Árpád משמש הונגרי (40 מ״ל)",
    ar: "Árpád مشمش مجري (40 مل)",
  },
  "prov-mazel-tov-erzsebetvaros/arpad-irsai": {
    hu: "Árpád Irsai olivér (40 ml)",
    es: "Árpád Irsai Oliver (40 ml)",
    it: "Árpád Irsai Oliver (40 ml)",
    he: "Árpád אירסאי אוליבר (40 מ״ל)",
    ar: "Árpád إيرساي أوليفر (40 مل)",
  },
  "prov-mazel-tov-erzsebetvaros/aperol-spritz": {
    hu: "Aperol Spritz",
    es: "Aperol Spritz",
    it: "Aperol Spritz",
    he: "אפרול ספריץ",
    ar: "أبيرول سبرتز",
  },
  "prov-mazel-tov-erzsebetvaros/espresso-martini": {
    hu: "Eszpresszó martini",
    es: "Espresso Martini",
    it: "Espresso Martini",
    he: "אספרסו מרטיני",
    ar: "إسبريسو مارتيني",
  },
  "prov-mazel-tov-erzsebetvaros/mojito": {
    hu: "Jungle Mojito",
    es: "Jungle Mojito",
    it: "Jungle Mojito",
    he: "ג'ונגל מוחיטו",
    ar: "جونغل موهيتو",
  },
  // Doboz
  "prov-doboz-erzsebetvaros/signature-mojito": {
    hu: "Mojito",
    es: "Mojito",
    it: "Mojito",
    he: "מוחיטו",
    ar: "موهيتو",
  },
  "prov-doboz-erzsebetvaros/signature-gin-tonic": {
    hu: "Gin tonic",
    es: "Gin tonic",
    it: "Gin tonic",
    he: "ג'ין טוניק",
    ar: "جن تونيك",
  },
  "prov-doboz-erzsebetvaros/draft-beer": {
    hu: "Csapolt sör (0,4 l)",
    es: "Cerveza de barril (0,4 l)",
    it: "Birra alla spina (0,4 l)",
    he: "בירה מהחבית (0,4 ל׳)",
    ar: "بيرة من الصنبور (0.4 ل)",
  },
  // Great Market Hall
  "prov-central-market-ferencvaros/gulyasleves": {
    hu: "Gulyásleves marhahússal",
    es: "Sopa goulash con ternera",
    it: "Zuppa goulash con manzo",
    he: "מרק גולאש עם בקר",
    ar: "حساء غولاش بلحم البقر",
  },
  "prov-central-market-ferencvaros/sertes-porkolt": {
    hu: "Sertéspörkölt galuskával",
    es: "Estofado de cerdo con ñoquis",
    it: "Stufato di maiale con gnocchi",
    he: "תבשיל חזיר עם גנוקי",
    ar: "يخنة لحم الخنزير مع نيوكي",
  },
  "prov-central-market-ferencvaros/goulash-tasting-plate": {
    hu: "„Goulash” kóstolótál (gulyásleves, csirkepörkölt, sertéspörkölt)",
    es: "Bandeja degustación «Goulash» (goulash, pollo, cerdo)",
    it: "Piatto degustazione «Goulash» (goulash, pollo, maiale)",
    he: "מגש טעימות «גולאש» (מרק, עוף, חזיר)",
    ar: "طبق تذوق «غولاش» (حساء، دجاج، لحم خنزير)",
  },
  "prov-central-market-ferencvaros/fakanal-palinka": {
    hu: "Fakanál pálinka (csatos üvegben, Villányi muskotály)",
    es: "Pálinka Fakanál (botella con tapón, Villány muscat)",
    it: "Pálinka Fakanál (bottiglia a vite, Villány muscat)",
    he: "פלינקה Fakanál (בקבוק בורג, וילאני מוסקט)",
    ar: "بالينكا Fakanál (زجاجة بغطاء، فيلاني موسكات)",
  },
  "prov-central-market-ferencvaros/lavazza-espresso": {
    hu: "Lavazza presszókávé",
    es: "Espresso Lavazza",
    it: "Espresso Lavazza",
    he: "אספרסו Lavazza",
    ar: "إسبريسو Lavazza",
  },
  // Espresso Embassy + Bálna
  "prov-espresso-embassy-belvaros/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-espresso-embassy-belvaros/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  "prov-espresso-embassy-belvaros/flat-white": {
    hu: "Flat white",
    es: "Flat white",
    it: "Flat white",
    he: "פלאט וויט",
    ar: "فلات وايت",
  },
  "prov-espresso-embassy-belvaros/filter-coffee": {
    hu: "Szűrt kávé",
    es: "Café filtrado",
    it: "Caffè filtrato",
    he: "קפה מסונן",
    ar: "قهوة مفلترة",
  },
  "prov-cov-embassy-balna/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-cov-embassy-balna/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  "prov-cov-embassy-balna/flat-white": {
    hu: "Flat white",
    es: "Flat white",
    it: "Flat white",
    he: "פלאט וויט",
    ar: "فلات وايت",
  },
  // Menza
  "prov-cov-menza-liszt/hungarian-goulash-soup": {
    hu: "Magyar gulyásleves házi tésztával (csipetke)",
    es: "Sopa goulash húngara con pasta casera",
    it: "Zuppa goulash ungherese con pasta fatta in casa",
    he: "מרק גולאש הונגרי עם פסטה ביתית",
    ar: "حساء غولاش مجري مع معكرونة منزلية",
  },
  "prov-cov-menza-liszt/hungarian-fried-bread-hummus": {
    hu: "Magyar lángos humusszal, salátával és kecskesajttal",
    es: "Pan frito húngaro con hummus, ensalada y queso de cabra",
    it: "Pane fritto ungherese con hummus, insalata e formaggio di capra",
    he: "לחם מטוגן הונגרי עם חומוס, סלט וגבינת עזים",
    ar: "خبز مجري مقلي مع حمص وسلطة وجبن ماعز",
  },
  "prov-cov-menza-liszt/savoury-hungarian-crepe": {
    hu: "Sós magyar palacsinta csirkével, tejfölös paprikás mártással",
    es: "Crepa húngara salada con pollo y salsa de pimentón con nata",
    it: "Crêpe ungherese salata con pollo e salsa paprika alla panna",
    he: "קרפ הונגרי מלוח במילוי עוף ברוטב פפריקה ושמנת",
    ar: "كريب مجري مالح بحشوة دجاج وصلصة فلفل حلو بالقشدة",
  },
  "prov-cov-menza-liszt/cibakhazi-plum": {
    hu: "Cibakházi szilva (4 cl)",
    es: "Cibakházi ciruela (4 cl)",
    it: "Cibakházi prugna (4 cl)",
    he: "Cibakházi שזיף (4 מ״ל)",
    ar: "Cibakházi برقوق (4 سم)",
  },
  "prov-cov-menza-liszt/cibakhazi-apricot": {
    hu: "Cibakházi barack (4 cl)",
    es: "Cibakházi albaricoque (4 cl)",
    it: "Cibakházi albicocca (4 cl)",
    he: "Cibakházi משמש (4 מ״ל)",
    ar: "Cibakházi مشمش (4 سم)",
  },
  "prov-cov-menza-liszt/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-cov-menza-liszt/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  // Frici Papa
  "prov-cov-frici-jewish-q/gulyasleves": {
    hu: "Gulyásleves",
    es: "Sopa goulash",
    it: "Zuppa goulash",
    he: "מרק גולאש",
    ar: "حساء غولاش",
  },
  "prov-cov-frici-jewish-q/vorosboros-marhaporkolt": {
    hu: "Vörösboros marhapörkölt",
    es: "Estofado de ternera al vino tinto",
    it: "Stufato di manzo al vino rosso",
    he: "תבשיל בקר ביין אדום",
    ar: "يخنة لحم بقري بالنبيذ الأحمر",
  },
  "prov-cov-frici-jewish-q/paprikas-csirkemell": {
    hu: "Paprikás csirkemell",
    es: "Pechuga de pollo al pimentón",
    it: "Petto di pollo al paprika",
    he: "חזה עוף פפריקה",
    ar: "صدر دجاج بالفلفل الحلو",
  },
  "prov-cov-frici-jewish-q/brassoi": {
    hu: "Brassói aprópecsenye",
    es: "Brassói (guiso de cerdo y patatas)",
    it: "Brassói (stufato di maiale e patate)",
    he: "בראסוי (תבשיל חזיר ותפוחי אדמה)",
    ar: "براسوي (يخنة لحم خنزير وبطاطس)",
  },
  // Daubner
  "prov-cov-daubner-oktogon/espresso": {
    hu: "Eszpresszó",
    es: "Espresso",
    it: "Espresso",
    he: "אספרסו",
    ar: "إسبريسو",
  },
  "prov-cov-daubner-oktogon/cappuccino": {
    hu: "Cappuccino",
    es: "Cappuccino",
    it: "Cappuccino",
    he: "קפוצ'ינו",
    ar: "كابتشينو",
  },
  "prov-cov-daubner-oktogon/latte-macchiato": {
    hu: "Latte macchiato",
    es: "Latte macchiato",
    it: "Latte macchiato",
    he: "לאטה מקיאטו",
    ar: "لاتيه ماكياتو",
  },
  "prov-cov-daubner-oktogon/tejes-kave": {
    hu: "Tejes kávé",
    es: "Café con leche",
    it: "Caffè al latte",
    he: "קפה עם חלב",
    ar: "قهوة بالحليب",
  },
};

const HU_ITEM_TWEAKS = {
  "prov-360-bar-terezvaros/360-highlife": { hu: "360 Highlife koktél" },
  "prov-360-bar-terezvaros/espresso-martini": { hu: "Eszpresszó martini" },
  "prov-360-bar-terezvaros/espresso": { hu: "Eszpresszó / ripszertó" },
  "prov-cov-kiosk-parliament/espresso": { hu: "Eszpresszó" },
  "prov-cov-kiosk-parliament/cappuccino": { hu: "Kapucsínó" },
  "prov-cov-kiosk-parliament/flat-white": { hu: "Lapos fehér" },
  "prov-cov-kiosk-parliament/budapest-burger": { hu: "Budapesti burger" },
  "prov-cov-kiosk-parliament/espresso-martini": { hu: "Eszpresszó martini" },
};

function toSectionLocales(title) {
  const row = SECTION_TITLES[title];
  if (!row) {
    console.warn(`WARN: missing section title map: ${JSON.stringify(title)}`);
    return null;
  }
  return Object.fromEntries(
    LOCALES.map((code) => [code, { title: row[code] }]),
  );
}

function toItemLocales(pid, itemId, name) {
  const key = `${pid}/${itemId}`;
  const row = ITEM_NAMES[key];
  if (!row) {
    console.warn(`WARN: missing item map: ${key} (${name})`);
    return null;
  }
  const locales = Object.fromEntries(
    LOCALES.map((code) => [code, { name: row[code] }]),
  );
  const tweak = HU_ITEM_TWEAKS[key];
  if (tweak?.hu) locales.hu = { name: tweak.hu };
  return locales;
}

function pickLocales(pid, sectionId, itemId, existing) {
  if (pid === "prov-cov-kiosk-parliament" && kioskIdx) {
    const src = kioskIdx.items.get(`${sectionId}/${itemId}`);
    if (src?.locales) return JSON.parse(JSON.stringify(src.locales));
  }
  if (pid === "prov-360-bar-terezvaros" && bar360Idx) {
    const src = bar360Idx.items.get(`${sectionId}/${itemId}`);
    if (src?.locales) {
      const locales = JSON.parse(JSON.stringify(src.locales));
      const tweak = HU_ITEM_TWEAKS[`${pid}/${itemId}`];
      if (tweak?.hu) locales.hu = { name: tweak.hu };
      return locales;
    }
  }
  if (existing?.locales) {
    const locales = JSON.parse(JSON.stringify(existing.locales));
    const tweak = HU_ITEM_TWEAKS[`${pid}/${itemId}`];
    if (tweak?.hu) locales.hu = { name: tweak.hu };
    return locales;
  }
  return toItemLocales(pid, itemId, existing?.name);
}

function pickSectionLocales(pid, sectionId, title, existing) {
  if (pid === "prov-cov-kiosk-parliament" && kioskIdx) {
    const src = kioskIdx.sections.get(sectionId);
    if (src?.locales) return JSON.parse(JSON.stringify(src.locales));
  }
  if (pid === "prov-360-bar-terezvaros" && bar360Idx) {
    const src = bar360Idx.sections.get(sectionId);
    if (src?.locales) return JSON.parse(JSON.stringify(src.locales));
  }
  if (existing?.locales) return JSON.parse(JSON.stringify(existing.locales));
  return toSectionLocales(title);
}

function enrichMenu(provider) {
  const menu = JSON.parse(JSON.stringify(provider.menu));
  delete menu.venueLink;
  for (const sec of menu.sections || []) {
    const secLocales = pickSectionLocales(provider.id, sec.id, sec.title, sec);
    if (secLocales) sec.locales = secLocales;
    for (const it of sec.items || []) {
      const itemLocales = pickLocales(provider.id, sec.id, it.id, it);
      if (itemLocales) it.locales = itemLocales;
    }
  }
  return menu;
}

function main() {
  const live = JSON.parse(fs.readFileSync(LIVE_PATH, "utf8"));
  const operations = live.map((provider) => ({
    resource: "provider",
    action: "patch",
    id: provider.id,
    patch: { menu: enrichMenu(provider) },
  }));

  const payload = {
    sourceUrls: [
      "https://gerbeaud.hu/en/our-selection/drinks/",
      "https://newyorkcafe.hu/en/cafe-menu/",
      "https://mazeltov.hu/itallap",
      "https://www.kiosk-budapest.hu/eteleink",
      "https://www.360bar.hu/",
    ],
    notes:
      "Menu audit fixes: full locales (hu/es/it/he/ar) on all sections and items across 14 providers with menus; HU display names improved where root was English-only.",
    missingOrUncertain: [
      "Espresso Embassy Belváros & Bálna: coffee prices from budapestbylocals.com (2023) — unchanged.",
      "Instant-Fogas & Szimpla house pálinka: estimated pour price — unchanged.",
    ],
    operations,
  };

  fs.writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${operations.length} patches → ${OUT_PATH}`);

  let missingSections = 0;
  let missingItems = 0;
  for (const op of operations) {
    for (const sec of op.patch.menu.sections) {
      if (!sec.locales) missingSections++;
      for (const it of sec.items || []) {
        if (!it.locales) missingItems++;
      }
    }
  }
  if (missingSections || missingItems) {
    console.error(`FAIL: ${missingSections} sections, ${missingItems} items still missing locales`);
    process.exit(1);
  }
}

main();
