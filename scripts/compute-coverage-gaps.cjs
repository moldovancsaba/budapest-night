#!/usr/bin/env node
/**
 * Print coverage gaps for Discover + Meetup filters.
 * Usage: node scripts/compute-coverage-gaps.cjs
 */
const BASE = (process.env.INGEST_BASE_URL || "https://budapest-night.vercel.app").replace(/\/$/, "");

const CATEGORIES = ["Events", "Parties", "Restaurants", "Cafés"];
const BOROUGHS = ["Belváros", "Terézváros", "Erzsébetváros", "Ferencváros", "Buda", "Óbuda", "Újbuda"];
const HOODS = {
  Belváros: ["Váci utca", "Deák tér", "Parliament", "Danube Promenade", "Inner City"],
  Terézváros: ["Andrássy út", "Opera", "Oktogon", "Király utca", "Liszt Ferenc tér"],
  Erzsébetváros: ["Jewish Quarter", "Gozsdu Udvar", "Kazinczy utca", "Wesselényi utca", "Rákóczi tér"],
  Ferencváros: ["Corvin-negyed", "Műegyetem", "Nagytemplom utca", "Boráros tér", "Millenniumi Városközpont"],
  Buda: ["Castle District", "Gellért Hill", "Tabán", "Rózsadomb", "Szent Gellért tér"],
  Óbuda: ["Óbuda Island", "Aquincum", "Kolosy tér", "Bécsi út", "Main Square Óbuda"],
  Újbuda: ["Móricz Zsigmond körtér", "Gellért Baths area", "Infopark", "Kosztolányi Dezső tér", "Bikás park"],
};
const ACTIVITIES = [
  "Live Music", "DJ Sets", "Rooftop", "Ruin Bar", "Fine Dining", "Street Food", "Wine Bar", "Craft Beer",
  "Coffee & Brunch", "Gallery", "Theatre", "Festival", "Boat Party", "Thermal Bath", "Jazz", "Electronic",
  "Cocktails", "Late Kitchen",
];
const AGES = ["All ages", "Family", "18+", "21+", "Late night"];
const TIMES = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"];
const GROUP_TYPES = ["Art & Gallery", "Live Culture", "Food & Wine Circle", "Nightlife Crew", "Local Creators"];

function gapsFor(providers, meetups) {
  const g = {
    catBor: [], catHood: [], catAct: [], catAge: [], catTime: [],
    mBor: [], mHood: [], mGT: [],
  };
  for (const c of CATEGORIES) {
    for (const b of BOROUGHS) {
      if (!providers.some((p) => p.category === c && p.borough === b)) g.catBor.push(`${c}|${b}`);
      for (const h of HOODS[b]) {
        if (!providers.some((p) => p.category === c && p.borough === b && p.neighborhood === h)) {
          g.catHood.push(`${c}|${b}|${h}`);
        }
      }
    }
    for (const a of ACTIVITIES) {
      if (!providers.some((p) => p.category === c && p.activityTypes.includes(a))) g.catAct.push(`${c}|${a}`);
    }
    for (const a of AGES) {
      if (!providers.some((p) => p.category === c && p.ageRanges.includes(a))) g.catAge.push(`${c}|${a}`);
    }
    for (const t of TIMES) {
      if (!providers.some((p) => p.category === c && p.dayTimeTags.includes(t))) g.catTime.push(`${c}|${t}`);
    }
  }
  for (const b of BOROUGHS) {
    if (!meetups.some((m) => m.borough === b)) g.mBor.push(b);
    for (const h of HOODS[b]) {
      if (!meetups.some((m) => m.borough === b && m.neighborhood === h)) g.mHood.push(`${b}|${h}`);
    }
  }
  for (const t of GROUP_TYPES) {
    if (!meetups.some((m) => m.groupType === t)) g.mGT.push(t);
  }
  return g;
}

function total(g) {
  return Object.values(g).reduce((s, arr) => s + arr.length, 0);
}

async function main() {
  const providers = await (await fetch(`${BASE}/api/public/providers`)).json();
  const meetups = await (await fetch(`${BASE}/api/public/meetup-groups`)).json();
  const g = gapsFor(providers, meetups);
  console.log(JSON.stringify({ providers: providers.length, meetups: meetups.length, totalGaps: total(g), gaps: g }, null, 2));
  process.exit(total(g) > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
