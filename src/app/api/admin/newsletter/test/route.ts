import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { getCurrentWeekId } from "@/lib/programWeekCalendar";
import type { ProgramWeekDoc } from "@/types/programWeek";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import { resolveProvidersForLocale } from "@/lib/providerLocale";
import { resolveEventsForLocale } from "@/lib/eventLocale";
import { toPublicNightEvent } from "@/lib/publicEvent";
import { resolveProgramWeekLocaleBlock } from "@/lib/programWeekCopy";
import { pickDigestContent, renderNewsletterDigestHtml } from "@/lib/newsletterDigest";
import { getSiteOrigin } from "@/lib/appPaths";
import { isUpcoming } from "@/lib/eventDisplay";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
  }

  const { email } = (await req.json()) as { email?: string };
  const to = email?.trim().toLowerCase();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const weekId = getCurrentWeekId();
  const doc = (await db.collection(COL.programWeeks).findOne({
    weekId,
    published: true,
  })) as unknown as ProgramWeekDoc | null;

  const block = doc
    ? resolveProgramWeekLocaleBlock(doc, "hu")
    : { headline: "Ez a hét Budapesten — Pesti Est", intro: "" };

  const nowIso = new Date().toISOString();
  const [rawProviders, rawEvents] = await Promise.all([
    db.collection(COL.providers).find({}).toArray(),
    db
      .collection(COL.events)
      .find({ status: "scheduled", endsAt: { $gte: nowIso } })
      .toArray(),
  ]);

  const providersById = new Map(
    (rawProviders as unknown as Provider[]).map((p) => [p.id, p]),
  );
  const events = resolveEventsForLocale(rawEvents as unknown as NightEvent[], "hu")
    .filter(isUpcoming)
    .map((e) => toPublicNightEvent(e, providersById));

  const featuredIds = doc?.featuredEventIds ?? [];
  const digestEvents =
    featuredIds.length > 0
      ? events.filter((e) => featuredIds.includes(e.id))
      : events;

  const featuredProviderIds = doc?.featuredProviderIds ?? [];
  const venues = resolveProvidersForLocale(rawProviders as unknown as Provider[], "hu");
  const digestVenues =
    featuredProviderIds.length > 0
      ? venues.filter((p) => featuredProviderIds.includes(p.id))
      : venues;

  const content = pickDigestContent(
    {
      weekId,
      weekStartsAt: doc?.weekStartsAt ?? "",
      weekEndsAt: doc?.weekEndsAt ?? "",
      headline: block.headline,
      intro: block.intro,
      featuredEventIds: featuredIds,
      featuredProviderIds: featuredProviderIds,
      sponsorName: doc?.sponsorName,
      sponsorUrl: doc?.sponsorUrl,
    },
    digestEvents,
    digestVenues,
    "hu",
  );

  const origin = getSiteOrigin();
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL;
  const { html, text } = renderNewsletterDigestHtml(content, {
    unsubUrl: `${origin}/hu`,
    privacyUrl,
    locale: "hu",
  });

  const send = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.NEWSLETTER_FROM ?? "Pesti Est <onboarding@resend.dev>",
      to,
      subject: `[Teszt] Csütörtöki Pesti Est — ${content.headline}`,
      html,
      text,
    }),
  });

  if (!send.ok) {
    const err = await send.text();
    return NextResponse.json({ error: err || "Resend failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, to, weekId });
}
