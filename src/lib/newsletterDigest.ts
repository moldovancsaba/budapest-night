import { getSiteOrigin, buildProgramPath } from "@/lib/appPaths";
import type { PublicProgramWeek } from "@/types/programWeek";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { AppLocale } from "@/i18n/config";

export type DigestContent = {
  headline: string;
  intro: string;
  programUrl: string;
  events: PublicNightEvent[];
  venues: Provider[];
  sponsorName?: string;
  sponsorUrl?: string;
};

export function pickDigestContent(
  week: PublicProgramWeek,
  events: PublicNightEvent[],
  venues: Provider[],
  locale: AppLocale = "hu",
): DigestContent {
  const origin = getSiteOrigin();
  const programPath = buildProgramPath(undefined, { locale });
  const programUrl = `${origin}${programPath}`;

  const pickedEvents = [...events]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 10);
  const pickedVenues = venues.slice(0, 4);

  return {
    headline: week.headline,
    intro: week.intro,
    programUrl,
    events: pickedEvents,
    venues: pickedVenues,
    sponsorName: week.sponsorName,
    sponsorUrl: week.sponsorUrl,
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEventWhen(ev: PublicNightEvent): string {
  try {
    return new Intl.DateTimeFormat("hu-HU", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Budapest",
    }).format(new Date(ev.startsAt));
  } catch {
    return ev.startsAt;
  }
}

export function renderNewsletterDigestHtml(
  content: DigestContent,
  options: { unsubUrl: string; privacyUrl?: string; locale?: AppLocale },
): { html: string; text: string } {
  const loc = options.locale ?? "hu";
  const isHu = loc === "hu";
  const cta = isHu ? "Teljes heti program" : "Full weekly program";
  const sponsorLabel = isHu ? "Heti támogató" : "Week sponsor";
  const eventsTitle = isHu ? "Kiemelt események" : "Featured events";
  const venuesTitle = isHu ? "Kiemelt helyszínek" : "Featured venues";
  const footerLegal = isHu
    ? "Pesti Est — ingyenes budapesti programmagazin. Adatkezelés: lásd az adatvédelmi tájékoztatót."
    : "Pesti Est — free Budapest program guide.";

  const eventCards = content.events
    .map(
      (ev) => `
      <tr><td style="padding:12px 0;border-bottom:1px solid #eee;">
        <strong style="font-size:16px;color:#111;">${esc(ev.title)}</strong><br/>
        <span style="color:#555;font-size:13px;">${esc(formatEventWhen(ev))}</span>
        ${ev.venues[0]?.name ? `<br/><span style="color:#777;font-size:12px;">${esc(ev.venues[0].name)}</span>` : ""}
      </td></tr>`,
    )
    .join("");

  const venueCards = content.venues
    .map(
      (v) => `
      <li style="margin:0 0 8px 0;color:#333;">${esc(v.name)} — ${esc(v.neighborhood)}</li>`,
    )
    .join("");

  const sponsorBlock =
    content.sponsorName && content.sponsorUrl
      ? `<p style="margin:24px 0;padding:12px;background:#f5f5f5;border-radius:8px;font-size:13px;">
          ${sponsorLabel}: <a href="${esc(content.sponsorUrl)}" style="color:#c41e3a;">${esc(content.sponsorName)}</a>
        </p>`
      : "";

  const privacyLine = options.privacyUrl
    ? `<a href="${esc(options.privacyUrl)}" style="color:#666;">${isHu ? "Adatvédelem" : "Privacy"}</a> · `
    : "";

  const html = `<!DOCTYPE html>
<html lang="${loc}">
<body style="margin:0;padding:0;background:#fafafa;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:28px 24px 8px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;color:#888;text-transform:uppercase;">Pesti Est</p>
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#111;">${esc(content.headline)}</h1>
      <p style="margin:0;color:#444;font-size:15px;line-height:1.5;">${esc(content.intro)}</p>
    </td></tr>
    <tr><td style="padding:8px 24px;">
      <a href="${esc(content.programUrl)}" style="display:inline-block;background:#c41e3a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600;font-size:14px;">${cta}</a>
    </td></tr>
    ${eventCards ? `<tr><td style="padding:16px 24px 0;"><h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;">${eventsTitle}</h2><table width="100%">${eventCards}</table></td></tr>` : ""}
    ${venueCards ? `<tr><td style="padding:16px 24px;"><h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#888;">${venuesTitle}</h2><ul style="padding-left:18px;margin:8px 0;">${venueCards}</ul></td></tr>` : ""}
    <tr><td style="padding:8px 24px 24px;">${sponsorBlock}</td></tr>
    <tr><td style="padding:16px 24px;background:#f5f5f5;font-size:11px;color:#666;line-height:1.5;">
      ${footerLegal}<br/><br/>
      ${privacyLine}<a href="${esc(options.unsubUrl)}" style="color:#666;">${isHu ? "Leiratkozás" : "Unsubscribe"}</a>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    content.headline,
    "",
    content.intro,
    "",
    `${cta}: ${content.programUrl}`,
    "",
    content.events.length
      ? `${eventsTitle}:\n${content.events.map((e) => `• ${e.title} — ${formatEventWhen(e)}`).join("\n")}`
      : "",
    content.venues.length
      ? `\n${venuesTitle}:\n${content.venues.map((v) => `• ${v.name}`).join("\n")}`
      : "",
    content.sponsorName ? `\n${sponsorLabel}: ${content.sponsorName} ${content.sponsorUrl ?? ""}` : "",
    "",
    options.privacyUrl ? `Privacy: ${options.privacyUrl}` : "",
    `Unsubscribe: ${options.unsubUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}
