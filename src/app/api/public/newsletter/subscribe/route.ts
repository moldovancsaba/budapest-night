import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getDb, COL } from "@/lib/mongodb";
import type { NewsletterSubscriber } from "@/types/newsletter";
import { getSiteOrigin } from "@/lib/appPaths";

export async function POST(req: Request) {
  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const { email, locale = "hu" } = (await req.json()) as { email?: string; locale?: string };
  const normalized = email?.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const confirmToken = randomBytes(24).toString("hex");
  const unsubscribeToken = randomBytes(24).toString("hex");
  const now = new Date().toISOString();

  const doc: NewsletterSubscriber = {
    _id: normalized,
    email: normalized,
    locale,
    status: "pending",
    consentAt: now,
    confirmToken,
    unsubscribeToken,
  };

  await db.collection(COL.newsletterSubscribers).updateOne(
    { _id: normalized } as Record<string, unknown>,
    { $set: doc },
    { upsert: true },
  );

  const origin = getSiteOrigin();
  const confirmUrl = `${origin}/api/public/newsletter/confirm?token=${confirmToken}`;

  if (process.env.RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NEWSLETTER_FROM ?? "Pesti Est <onboarding@resend.dev>",
        to: normalized,
        subject: locale === "hu" ? "Erősítsd meg a Pesti Est hírlevelet" : "Confirm your Pesti Est newsletter",
        html: `<p>${locale === "hu" ? "Kattints a feliratkozás megerősítéséhez:" : "Click to confirm:"}</p><p><a href="${confirmUrl}">${confirmUrl}</a></p>`,
      }),
    }).catch(() => undefined);
  }

  return NextResponse.json({
    ok: true,
    message: "pending_confirmation",
    confirmUrl: process.env.NODE_ENV === "development" ? confirmUrl : undefined,
  });
}
