import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { getCurrentWeekId } from "@/lib/programWeekCalendar";
import type { ProgramWeekDoc } from "@/types/programWeek";
import type { NewsletterSubscriber } from "@/types/newsletter";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import { getSiteOrigin } from "@/lib/appPaths";
import { resolveProgramWeekLocaleBlock } from "@/lib/programWeekCopy";
import { resolveProvidersForLocale } from "@/lib/providerLocale";
import { resolveEventsForLocale } from "@/lib/eventLocale";
import { toPublicNightEvent } from "@/lib/publicEvent";
import { isUpcoming } from "@/lib/eventDisplay";
import { pickDigestContent, renderNewsletterDigestHtml } from "@/lib/newsletterDigest";
import { filterPromosByLocale, getActivePromotions, weekSponsorFromPromos } from "@/lib/promotionsDb";

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const weekId = getCurrentWeekId();
  const weekDoc = (await db.collection(COL.programWeeks).findOne({
    weekId,
    published: true,
  })) as unknown as ProgramWeekDoc | null;

  const subs = (await db
    .collection(COL.newsletterSubscribers)
    .find({ status: "confirmed" })
    .limit(5000)
    .toArray()) as unknown as NewsletterSubscriber[];

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "RESEND_API_KEY not set",
      subscribers: subs.length,
      weekId,
    });
  }

  const nowIso = new Date().toISOString();
  const [rawProviders, rawEvents, promos] = await Promise.all([
    db.collection(COL.providers).find({}).toArray(),
    db
      .collection(COL.events)
      .find({ status: "scheduled", endsAt: { $gte: nowIso } })
      .toArray(),
    getActivePromotions(db),
  ]);

  const providersById = new Map(
    (rawProviders as unknown as Provider[]).map((p) => [p.id, p]),
  );

  let sent = 0;
  const origin = getSiteOrigin();
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;

  for (const sub of subs) {
    const locale = (sub.locale === "hu" ? "hu" : sub.locale) as "hu" | "en" | "es" | "it" | "he" | "ar";
    const block = weekDoc
      ? resolveProgramWeekLocaleBlock(weekDoc, locale)
      : {
          headline:
            locale === "hu"
              ? "Ez a hét Budapesten — Pesti Est"
              : "This week in Budapest — Pesti Est",
          intro: "",
        };

    const scopedPromos = filterPromosByLocale(promos, locale);
    const sponsor = weekSponsorFromPromos(scopedPromos);

    const events = resolveEventsForLocale(rawEvents as unknown as NightEvent[], locale)
      .filter(isUpcoming)
      .map((e) => toPublicNightEvent(e, providersById));

    const featuredIds = weekDoc?.featuredEventIds ?? [];
    const digestEvents =
      featuredIds.length > 0 ? events.filter((e) => featuredIds.includes(e.id)) : events;

    const venues = resolveProvidersForLocale(rawProviders as unknown as Provider[], locale);
    const featuredProviderIds = weekDoc?.featuredProviderIds ?? [];
    const digestVenues =
      featuredProviderIds.length > 0
        ? venues.filter((p) => featuredProviderIds.includes(p.id))
        : venues;

    const content = pickDigestContent(
      {
        weekId,
        weekStartsAt: weekDoc?.weekStartsAt ?? "",
        weekEndsAt: weekDoc?.weekEndsAt ?? "",
        headline: block.headline,
        intro: block.intro,
        featuredEventIds: featuredIds,
        featuredProviderIds,
        sponsorName: weekDoc?.sponsorName ?? sponsor?.name,
        sponsorUrl: weekDoc?.sponsorUrl ?? sponsor?.url,
      },
      digestEvents,
      digestVenues,
      locale,
    );

    const unsub = `${origin}/api/public/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
    const { html, text } = renderNewsletterDigestHtml(content, {
      unsubUrl: unsub,
      privacyUrl,
      locale,
    });

    const subject =
      locale === "hu"
        ? `Csütörtöki Pesti Est — ${content.headline}`
        : `Pesti Est weekly — ${content.headline}`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NEWSLETTER_FROM ?? "Pesti Est <onboarding@resend.dev>",
        to: sub.email,
        subject,
        html,
        text,
      }),
    });
    if (r.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent, subscribers: subs.length, weekId });
}
