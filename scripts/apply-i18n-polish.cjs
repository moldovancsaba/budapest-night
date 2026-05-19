#!/usr/bin/env node
/**
 * Apply curated translation polish to src/messages/*.json
 * Run: node scripts/apply-i18n-polish.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function setByPath(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    cur = /^\d+$/.test(key) ? cur[Number(key)] : cur[key];
  }
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) cur[Number(last)] = value;
  else cur[last] = value;
}

/** @type {Record<string, Record<string, string>>} */
const PATCHES = {
  hu: {
    "program.partnerBadge": "Pesti Est-partner",
    "menuTag.street-food": "Utcai étel",
    "meetup.cadence.popup": "Egyszeri esemény",
    "activityType.jazz": "Dzsessz",
    "neighborhood.opera": "Operaház",
    "home.guides.0.neighborhood": "Belváros",
    "home.guides.1.neighborhood": "Zsidó negyed",
    "home.guides.3.neighborhood": "Várnegyed",
  },
  es: {
    "nav.cafes": "Cafeterías",
    "venue.perCover": "/persona",
    "meetup.cadence.popup": "Evento puntual",
    "activityType.festival": "Festivales",
    "activityType.jazz": "Jazz",
    "menuTag.goulash": "Gulash",
    "menuTag.ruin-bar": "Bar en ruina",
    "menuTag.street-food": "Comida callejera",
    "eatDrink.venueCategory.Cafés": "Cafetería",
    "home.guides.0.neighborhood": "Centro histórico",
    "home.guides.1.neighborhood": "Barrio judío",
    "home.guides.3.neighborhood": "Barrio del castillo",
    "neighborhood.opera": "Ópera",
    "neighborhood.muegyetem": "Universidad técnica",
  },
  it: {
    "nav.home": "Inizio",
    "nav.budget": "Budget serale",
    "venue.perCover": "/coperto",
    "dayTime.Weekend": "Fine settimana",
    "meetup.cadence.weekend": "Fine settimana",
    "meetup.cadence.popup": "Evento pop-up",
    "meetup.groupType.nightlifeCrew": "Gruppo serale",
    "activityType.rooftop": "Terrazza",
    "activityType.ruinBar": "Ruin bar",
    "activityType.fineDining": "Alta cucina",
    "activityType.streetFood": "Cibo di strada",
    "activityType.wineBar": "Enoteca",
    "activityType.boatParty": "Festa in barca",
    "activityType.cinema": "Cinema",
    "activityType.festival": "Festival",
    "activityType.jazz": "Jazz",
    "menuTag.cocktail": "Cocktail",
    "menuTag.goulash": "Gulasch",
    "menuTag.street-food": "Cibo di strada",
    "menuTag.ruin-bar": "Ruin bar",
    "menuTag.rooftop": "Terrazza",
    "menuTag.specialty-coffee": "Caffè di specialità",
    "eatDrink.filterDrink": "Da bere",
    "program.vertical.mozi": "Cinema",
    "program.vertical.szinhaz": "Teatro",
    "program.vertical.kiallitas": "Mostre",
    "program.vertical.koncert": "Concerti",
    "program.partnerBadge": "Partner Pesti Est",
    "home.guides.0.neighborhood": "Centro storico",
    "home.guides.1.neighborhood": "Quartiere ebraico",
    "home.guides.3.neighborhood": "Castello",
    "nav.goHome": "Vai all'inizio",
  },
  he: {
    "neighborhood.opera": "אופרה",
    "neighborhood.muegyetem": "אוניברסיטת טכנולוגיה",
    "home.guides.0.neighborhood": "מרכז העיר",
    "home.guides.1.neighborhood": "הרובע היהודי",
    "home.guides.3.neighborhood": "רובע הטירה",
    "program.partnerBadge": "שותף Pesti Est",
    "meetup.cadence.popup": "אירוע חד-פעמי",
    "notFound.statValue": "0.0%",
  },
  ar: {
    "notFound.statValue": "0.0٪",
    "neighborhood.opera": "الأوبرا",
    "neighborhood.muegyetem": "جامعة التكنولوجيا",
    "home.guides.0.neighborhood": "وسط المدينة",
    "home.guides.1.neighborhood": "الحي اليهودي",
    "home.guides.3.neighborhood": "حي القلعة",
    "program.partnerBadge": "شريك Pesti Est",
    "meetup.cadence.popup": "فعالية منبثقة",
  },
};

/** @type {Record<string, Record<string, string>>} */
const ACCOUNT_PATCHES = {
  es: {
    "settings.saved.priceUnits.week": "consumición mínima",
    "settings.activityPlan.priceUnits.week": "consumición mínima",
  },
  it: {
    "settings.saved.priceUnits.week": "coperto",
    "settings.activityPlan.priceUnits.week": "coperto",
  },
  he: {
    "settings.saved.priceUnits.week": "דמי כניסה",
    "settings.activityPlan.priceUnits.week": "דמי כניסה",
  },
  ar: {
    "settings.saved.priceUnits.week": "رسوم الدخول",
    "settings.activityPlan.priceUnits.week": "رسوم الدخول",
  },
};

function applyPatches(filePath, patches) {
  const doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (const [key, value] of Object.entries(patches)) {
    setByPath(doc, key, value);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`);
}

function stripAccountNoise(filePath) {
  const doc = JSON.parse(fs.readFileSync(filePath, "utf8"));
  delete doc.meta;
  delete doc.nav;
  delete doc.program;
  fs.writeFileSync(filePath, `${JSON.stringify(doc, null, 2)}\n`);
}

for (const loc of ["hu", "es", "it", "he", "ar"]) {
  applyPatches(path.join(ROOT, `src/messages/${loc}.json`), PATCHES[loc]);
  console.log(`Polished ${loc}.json`);
}

for (const loc of ["en", "hu", "es", "it", "he", "ar"]) {
  stripAccountNoise(path.join(ROOT, `src/messages/account-${loc}.json`));
  if (ACCOUNT_PATCHES[loc]) {
    applyPatches(path.join(ROOT, `src/messages/account-${loc}.json`), ACCOUNT_PATCHES[loc]);
  }
  console.log(`Cleaned account-${loc}.json`);
}

console.log("Done.");
