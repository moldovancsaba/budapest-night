import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { getCurrentWeekId, getWeekBounds, eventsInWeek } from "@/lib/programWeekCalendar";
import type { ProgramWeekDoc, PublicProgramWeek } from "@/types/programWeek";
import {
  PROGRAM_WEEK_LOCALE_DEFAULTS,
  resolveProgramWeekLocaleBlock,
} from "@/lib/programWeekCopy";
import type { AppLocale } from "@/i18n/config";
import { resolveProvidersForLocale } from "@/lib/providerLocale";
import { resolveEventsForLocale } from "@/lib/eventLocale";
import { toPublicNightEvent } from "@/lib/publicEvent";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import type { PublicNightEvent } from "@/lib/publicEvent";
import {
  featuredEventIds,
  filterPromosByLocale,
  getActivePromotions,
  promotionLabelByTarget,
  verticalSponsorsFromPromos,
  weekSponsorFromPromos,
} from "@/lib/promotionsDb";
import { archiveFinishedEvents } from "@/lib/eventsArchive";
import { isUpcoming } from "@/lib/eventDisplay";
import { splitFeaturedProgramEvents } from "@/lib/programWeekFeatured";

export const dynamic = "force-dynamic";

function resolveWeekCopy(doc: ProgramWeekDoc, locale: AppLocale): PublicProgramWeek {
  const block = resolveProgramWeekLocaleBlock(doc, locale);
  return {
    weekId: doc.weekId,
    weekStartsAt: doc.weekStartsAt,
    weekEndsAt: doc.weekEndsAt,
    headline: block.headline,
    intro: block.intro,
    featuredEventIds: doc.featuredEventIds,
    featuredProviderIds: doc.featuredProviderIds,
    sponsorName: doc.sponsorName,
    sponsorUrl: doc.sponsorUrl,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get("locale") ?? "hu") as AppLocale;
  const weekParam = searchParams.get("week") ?? "current";
  const weekId = weekParam === "current" ? getCurrentWeekId() : weekParam;

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "No database" }, { status: 503 });
  }

  let doc = (await db.collection(COL.programWeeks).findOne({
    weekId,
    published: true,
  })) as unknown as ProgramWeekDoc | null;

  if (!doc && weekParam === "current") {
    const bounds = getWeekBounds(weekId);
    doc = {
      _id: weekId,
      weekId,
      weekStartsAt: bounds.startsAt,
      weekEndsAt: bounds.endsAt,
      published: true,
      locales: Object.fromEntries(
        (["hu", "en", "es", "it", "he", "ar"] as AppLocale[]).map((loc) => [
          loc,
          PROGRAM_WEEK_LOCALE_DEFAULTS[loc],
        ]),
      ) as ProgramWeekDoc["locales"],
      featuredEventIds: [],
      featuredProviderIds: [],
      updatedAt: new Date().toISOString(),
    };
  }

  if (!doc) {
    return NextResponse.json({ error: "Week not found" }, { status: 404 });
  }

  let week = resolveWeekCopy(doc, locale);

  await archiveFinishedEvents(db);
  const nowIso = new Date().toISOString();

  const [rawProviders, rawEvents, promos] = await Promise.all([
    db.collection(COL.providers).find({}).toArray(),
    db
      .collection(COL.events)
      .find({ status: "scheduled", endsAt: { $gte: nowIso } })
      .toArray(),
    getActivePromotions(db),
  ]);

  const scopedPromos = filterPromosByLocale(promos, locale);
  const promoLabels = promotionLabelByTarget(scopedPromos);
  const featuredEvIds = featuredEventIds(scopedPromos);
  const sponsor = weekSponsorFromPromos(scopedPromos);
  const verticalSponsors = verticalSponsorsFromPromos(scopedPromos);
  if (sponsor && !week.sponsorName) {
    week = { ...week, sponsorName: sponsor.name, sponsorUrl: sponsor.url ?? week.sponsorUrl };
  }

  const providers = resolveProvidersForLocale(
    rawProviders as unknown as Provider[],
    locale,
  );
  const providersById = new Map(
    (rawProviders as unknown as Provider[]).map((p) => [
      p.id,
      { ...p, ...resolveProviderLocation(p) },
    ]),
  );
  const upcomingPublic = resolveEventsForLocale(rawEvents as unknown as NightEvent[], locale)
    .filter((e) => isUpcoming(e))
    .map((e) => toPublicNightEvent(e, providersById));

  const events = upcomingPublic
    .filter((e) => eventsInWeek(e.startsAt, weekId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const applyEventPromo = (e: PublicNightEvent): PublicNightEvent => {
    const label = promoLabels.get(e.id);
    if (!label && !featuredEvIds.has(e.id)) return e;
    return {
      ...e,
      isFeatured: featuredEvIds.has(e.id) || e.isFeatured,
      promotionLabel: label ?? e.promotionLabel,
    };
  };

  const applyProviderPromo = (p: Provider): Provider => {
    const label = promoLabels.get(p.id);
    if (!label) return p;
    return { ...p, promotionLabel: label, isPromoted: true };
  };

  const sortFeatured = (list: PublicNightEvent[]) =>
    list.map(applyEventPromo).sort((a, b) => {
      const af = a.isFeatured ? 0 : 1;
      const bf = b.isFeatured ? 0 : 1;
      if (af !== bf) return af - bf;
      return a.startsAt.localeCompare(b.startsAt);
    });

  const { thisWeek, spotlight } = splitFeaturedProgramEvents(
    week.featuredEventIds,
    upcomingPublic,
    weekId,
  );
  const featuredEvents = sortFeatured(thisWeek);
  const spotlightEvents = sortFeatured(spotlight);

  let featuredProviders =
    week.featuredProviderIds.length > 0
      ? providers.filter((p) => week.featuredProviderIds.includes(p.id))
      : providers.slice(0, 6);

  featuredProviders = featuredProviders.map(applyProviderPromo);

  const suggestedEvents =
    featuredEvents.length === 0 && spotlightEvents.length === 0
      ? sortFeatured(upcomingPublic).slice(0, 6)
      : [];

  return NextResponse.json(
    {
      week,
      featuredEvents,
      spotlightEvents,
      featuredProviders,
      fallbackEventCount: events.length,
      suggestedEvents,
      verticalSponsors,
    },
    {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    },
  );
}
