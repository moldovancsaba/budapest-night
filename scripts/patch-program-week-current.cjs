#!/usr/bin/env node
/**
 * Set featured picks for the active Thu-start program week.
 *   node -r ./scripts/load-env.cjs scripts/patch-program-week-current.cjs
 */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");
const { getCurrentWeekId, getWeekBounds } = require("../src/lib/programWeekCalendar.ts");

const DB = process.env.MONGODB_DB || "budapest-night";

/** In-week first, then headline spotlight (order preserved in UI). */
const FEATURED_EVENT_IDS = [
  "event-nebula-a38-2026",
  "event-makam-trio-zenehaza-2026",
  "event-guido-mancusi-zeneakademia-2026",
  "event-kft-45th-a38-2026",
  "event-sting-mvm-dome-2026",
  "event-scorpions-mvm-dome-2026",
  "event-wagner-walkure-mupa-2026",
  "event-man-with-a-mission-akvarium-2026",
  "event-rilles-budapest-park-2026",
];

const FEATURED_PROVIDER_IDS = [
  "prov-urania-film",
  "prov-nemzeti-szinhaz",
  "prov-katona-szinhaz",
  "prov-a38-ferencvaros",
];

const LOCALES = {
  hu: {
    headline: "Ez a hét Budapesten",
    intro:
      "Kedd esti koncertek: A38, Zeneakadémia és ingyenes jazz a Zene Házában — plusz nyári nagykoncertek elővétele.",
  },
  en: {
    headline: "This week in Budapest",
    intro:
      "Tuesday night: A38, Liszt Academy, and a free jazz set at the House of Music — plus summer headliners ahead.",
  },
  es: {
    headline: "Esta semana en Budapest",
    intro:
      "Opereta el domingo en Nagymező, rock el martes en A38 — y adelanto de los grandes conciertos de verano.",
  },
  it: {
    headline: "Questa settimana a Budapest",
    intro:
      "Operetta domenica a Nagymező, rock martedì all'A38 — anteprima dei grandi concerti estivi.",
  },
  he: {
    headline: "השבוע בבודפשט",
    intro: "אופרטה ביום ראשון בנגימזו, רוק ביום שלישי ב-A38 — ותצוגה מקדימה לקונצרטי הקיץ.",
  },
  ar: {
    headline: "هذا الأسبوع في بودابست",
    intro: "أوبريتا يوم الأحد في ناجيميزو، روك يوم الثلاثاء في A38 — مع معاينة لحفلات الصيف الكبرى.",
  },
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI required");
    process.exit(1);
  }

  const weekId = getCurrentWeekId();
  const bounds = getWeekBounds(weekId);
  const now = new Date().toISOString();

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB);

  const existing = await db.collection("programWeeks").findOne({ weekId });
  const locales = { ...(existing?.locales ?? {}) };
  for (const [code, block] of Object.entries(LOCALES)) {
    locales[code] = { ...(locales[code] ?? {}), ...block };
  }

  const weekDoc = {
    _id: weekId,
    weekId,
    weekStartsAt: bounds.startsAt,
    weekEndsAt: bounds.endsAt,
    published: true,
    locales,
    featuredEventIds: FEATURED_EVENT_IDS,
    featuredProviderIds: FEATURED_PROVIDER_IDS,
    sponsorName: existing?.sponsorName ?? "Pesti Est",
    sponsorUrl: existing?.sponsorUrl ?? "https://budapest-night.vercel.app",
    editorNotes: "Editorial patch via scripts/patch-program-week-current.cjs",
    updatedAt: now,
  };

  await db.collection("programWeeks").replaceOne({ weekId }, weekDoc, { upsert: true });
  await client.close();

  console.log(`Published program week ${weekId}`);
  console.log("featuredEventIds:\n" + FEATURED_EVENT_IDS.join("\n"));
  console.log("featuredProviderIds:\n" + FEATURED_PROVIDER_IDS.join("\n"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
