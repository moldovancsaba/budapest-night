#!/usr/bin/env node
/**
 * Publish current program week + demo promotions + partner flags (R5 ops).
 *   node -r ./scripts/load-env.cjs scripts/bootstrap-program-delivery.cjs
 */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");
const { randomUUID } = require("crypto");

const DB = process.env.MONGODB_DB || "budapest-night";

const SPOTLIGHT_PREFER = [
  "event-sting-mvm-dome-2026",
  "event-wagner-walkure-mupa-2026",
  "event-scorpions-mvm-dome-2026",
];

const FEATURED_PROVIDERS = [
  "prov-urania-film",
  "prov-nemzeti-szinhaz",
  "prov-katona-szinhaz",
  "prov-art-plus-cinema",
];

/** Pilot QR pack: venue ship, cinema, theatre */
const PARTNER_PROVIDERS = [
  "prov-a38-ferencvaros",
  "prov-urania-film",
  "prov-nemzeti-szinhaz",
];

const PROGRAM_WEEK_LOCALES = {
  hu: {
    headline: "Ez a hét Budapesten",
    intro: "Kiemelt koncertek, színház és mozi — Pesti Est szerkesztői válogatása.",
  },
  en: {
    headline: "This week in Budapest",
    intro: "Editor's picks — concerts, theatre, and cinema from Pesti Est.",
  },
  es: {
    headline: "Esta semana en Budapest",
    intro: "Selección editorial: conciertos, teatro y cine en Pesti Est.",
  },
  it: {
    headline: "Questa settimana a Budapest",
    intro: "Scelta della redazione — concerti, teatro e cinema su Pesti Est.",
  },
  he: {
    headline: "השבוע בבודפשט",
    intro: "בחירת המערכת — הופעות, תיאטרון וקולנוע ב-Pesti Est.",
  },
  ar: {
    headline: "هذا الأسبوع في بودابست",
    intro: "اختيارات التحرير — حفلات ومسرح وسينما من Pesti Est.",
  },
};

function getCurrentWeekId(at = new Date()) {
  const TZ = "Europe/Budapest";
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = fmt.formatToParts(at);
  const get = (t) => parts.find((p) => p.type === t)?.value ?? "";
  const y = Number(get("year"));
  const m = Number(get("month"));
  const day = Number(get("day"));
  const weekday = get("weekday");
  const idx = { Thu: 4, Fri: 5, Sat: 6, Sun: 0, Mon: 1, Tue: 2, Wed: 3 }[weekday] ?? 0;
  const daysSinceThu = (idx + 7 - 4) % 7;
  const thuDay = day - daysSinceThu;
  const thu = new Date(Date.UTC(y, m - 1, thuDay));
  const p2 = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(thu);
  const g2 = (t) => p2.find((p) => p.type === t)?.value ?? "";
  return `${g2("year")}-${g2("month")}-${g2("day")}`;
}

function getWeekBounds(weekId) {
  const [y, m, d] = weekId.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, 22, 0, 0));
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

function eventsInWeek(startsAt, weekId) {
  const { startsAt: wStart, endsAt: wEnd } = getWeekBounds(weekId);
  const t = new Date(startsAt).getTime();
  return t >= new Date(wStart).getTime() && t <= new Date(wEnd).getTime();
}

async function pickFeaturedEventIds(db, weekId) {
  const now = new Date().toISOString();
  const events = await db
    .collection("events")
    .find({ status: "scheduled", endsAt: { $gte: now } })
    .sort({ startsAt: 1 })
    .toArray();

  const inWeek = events.filter((e) => eventsInWeek(e.startsAt, weekId));
  const later = events.filter((e) => !eventsInWeek(e.startsAt, weekId));

  const ids = [];
  for (const e of inWeek.slice(0, 2)) ids.push(e.id);

  for (const prefer of SPOTLIGHT_PREFER) {
    if (ids.length >= 5) break;
    if (later.some((e) => e.id === prefer)) ids.push(prefer);
  }
  for (const e of later) {
    if (ids.length >= 5) break;
    if (!ids.includes(e.id)) ids.push(e.id);
  }
  return [...new Set(ids)].slice(0, 5);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI required");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB);

  const weekId = getCurrentWeekId();
  const bounds = getWeekBounds(weekId);
  const now = new Date().toISOString();
  const featuredEventIds = await pickFeaturedEventIds(db, weekId);
  console.log(`Featured events: ${featuredEventIds.join(", ")}`);

  const weekDoc = {
    _id: weekId,
    weekId,
    weekStartsAt: bounds.startsAt,
    weekEndsAt: bounds.endsAt,
    published: true,
    locales: PROGRAM_WEEK_LOCALES,
    featuredEventIds,
    featuredProviderIds: FEATURED_PROVIDERS,
    sponsorName: "Pesti Est",
    sponsorUrl: "https://budapest-night.vercel.app",
    editorNotes: "Bootstrap via scripts/bootstrap-program-delivery.cjs",
    updatedAt: now,
  };

  await db.collection("programWeeks").replaceOne({ weekId }, weekDoc, { upsert: true });
  console.log(`Published program week ${weekId}`);

  for (const id of PARTNER_PROVIDERS) {
    await db.collection("providers").updateOne(
      { id },
      { $set: { partnerTier: "partner", updatedAt: now } },
    );
  }
  console.log(`Marked ${PARTNER_PROVIDERS.length} providers as partner`);

  const promoStart = new Date();
  promoStart.setDate(promoStart.getDate() - 1);
  const promoEnd = new Date();
  promoEnd.setDate(promoEnd.getDate() + 21);

  const promoEventLabels = ["Kiemelt koncert", "Nagy koncert", "MÜPA kiemelt"];
  const eventPromos = featuredEventIds.slice(0, 3).map((targetId, i) => ({
    type: "featured_event",
    targetId,
    label: promoEventLabels[i] ?? "Kiemelt",
    contractRef: `PE-2026-EVT-${String(i + 1).padStart(3, "0")}`,
  }));

  const venuePromos = [
    { targetId: "prov-urania-film", label: "Mozipartner" },
    { targetId: "prov-nemzeti-szinhaz", label: "Színház partner" },
    { targetId: "prov-katona-szinhaz", label: "Kiemelt színház" },
    { targetId: "prov-art-plus-cinema", label: "Art mozi partner" },
  ].map((v, i) => ({
    type: "featured_venue",
    targetId: v.targetId,
    label: v.label,
    contractRef: `PE-2026-VEN-${String(i + 1).padStart(3, "0")}`,
  }));

  const promos = [
    ...eventPromos,
    ...venuePromos,
    {
      type: "week_sponsor",
      targetId: "https://budapest-night.vercel.app",
      label: "Pesti Est",
      contractRef: "PE-2026-WK-001",
    },
  ];

  await db.collection("promotions").deleteMany({
    contractRef: { $regex: /^PE-2026-/ },
  });

  for (const p of promos) {
    const doc = {
      _id: randomUUID(),
      type: p.type,
      targetId: p.targetId,
      label: p.label,
      contractRef: p.contractRef,
      startsAt: promoStart.toISOString(),
      endsAt: promoEnd.toISOString(),
      priority: 20,
      internalNotes: "Demo monetization row — bootstrap script",
    };
    await db.collection("promotions").insertOne(doc);
  }
  console.log(`Inserted ${promos.length} promotions`);

  await client.close();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
