import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { getCurrentWeekId } from "@/lib/programWeekCalendar";
import type { ProgramWeekDoc } from "@/types/programWeek";
import type { NewsletterSubscriber } from "@/types/newsletter";
import { getSiteOrigin } from "@/lib/appPaths";

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
  const week = (await db.collection(COL.programWeeks).findOne({
    weekId,
    published: true,
  })) as unknown as ProgramWeekDoc | null;

  const subs = (await db
    .collection(COL.newsletterSubscribers)
    .find({ status: "confirmed" })
    .limit(5000)
    .toArray()) as unknown as NewsletterSubscriber[];

  const origin = getSiteOrigin();
  const programUrl = `${origin}/program`;
  const headline = week?.locales?.hu?.headline ?? "Ez a hét Budapesten — Pesti Est";
  const intro = week?.locales?.hu?.intro ?? "";

  let sent = 0;
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

  for (const sub of subs) {
    if (sub.locale !== "hu") continue;
    const unsub = `${origin}/api/public/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
    const html = `
      <h1>${headline}</h1>
      <p>${intro}</p>
      <p><a href="${programUrl}">Teljes heti program a Pesti Esten</a></p>
      <hr/>
      <p style="font-size:12px"><a href="${unsub}">Leiratkozás</a></p>
    `;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NEWSLETTER_FROM ?? "Pesti Est <onboarding@resend.dev>",
        to: sub.email,
        subject: `Csütörtöki Pesti Est — ${headline}`,
        html,
      }),
    });
    if (r.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent, subscribers: subs.length, weekId });
}
