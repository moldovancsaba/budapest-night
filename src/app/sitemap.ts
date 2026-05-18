import type { MetadataRoute } from "next";
import { getDb, COL } from "@/lib/mongodb";
import { locales } from "@/i18n/config";
import { getVenuePathKey } from "@/lib/providerLocale";
import { getEventPathKey } from "@/lib/eventLocale";
import { PROGRAM_VERTICALS } from "@/lib/programVerticals";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";

import { DEFAULT_SITE_ORIGIN } from "@/lib/appPaths";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_ORIGIN;

function localePath(locale: string, path: string) {
  if (locale === "hu") return path || "/";
  return `/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    "/program",
    ...PROGRAM_VERTICALS.map((v) => `/program/${v.id}`),
    "/venues",
    "/events",
    "/parties",
    "/restaurants",
    "/cafes",
    "/culture",
    "/eat-drink",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${BASE}${localePath(locale, p)}`,
        changeFrequency: p === "" || p === "/program" ? "daily" : "weekly",
        priority: p === "" ? 1 : p === "/program" ? 0.95 : 0.7,
      });
    }
  }

  const db = await getDb();
  if (!db) return entries;

  const [providers, events] = await Promise.all([
    db.collection(COL.providers).find({}).project({ id: 1, locales: 1 }).toArray(),
    db.collection(COL.events).find({ status: "scheduled" }).project({ id: 1, locales: 1, startsAt: 1 }).toArray(),
  ]);

  for (const locale of locales) {
    for (const raw of providers as unknown as Provider[]) {
      const slug = getVenuePathKey(raw, locale);
      entries.push({
        url: `${BASE}${localePath(locale, `/venue/${encodeURIComponent(slug)}`)}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const raw of events as unknown as NightEvent[]) {
      const slug = getEventPathKey(raw, locale);
      entries.push({
        url: `${BASE}${localePath(locale, `/event/${encodeURIComponent(slug)}`)}`,
        lastModified: raw.startsAt ? new Date(raw.startsAt) : undefined,
        changeFrequency: "daily",
        priority: 0.65,
      });
    }
  }

  return entries;
}
