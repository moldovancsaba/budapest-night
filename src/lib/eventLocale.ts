import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import type { NightEvent } from "@/types/event";
import type { EventLocaleContent, EventLocalesMap } from "@/types/eventLocale";

export function parseAppLocaleParam(raw: string | null | undefined): AppLocale {
  if (raw && locales.includes(raw as AppLocale)) return raw as AppLocale;
  return defaultLocale;
}

function pickOverlay(variant: EventLocaleContent): Partial<NightEvent> {
  const out: Partial<NightEvent> = {};
  if (variant.title?.trim()) out.title = variant.title.trim();
  if (variant.shortDescription?.trim()) out.shortDescription = variant.shortDescription.trim();
  if (variant.longDescription?.trim()) out.longDescription = variant.longDescription.trim();
  return out;
}

export function resolveEventForLocale(event: NightEvent, locale: AppLocale): NightEvent {
  const variant = event.locales?.[locale];
  if (!variant) return event;
  return { ...event, ...pickOverlay(variant) };
}

export function resolveEventsForLocale(rows: NightEvent[], locale: AppLocale): NightEvent[] {
  return rows.map((e) => resolveEventForLocale(e, locale));
}

export function getEventPathKey(event: NightEvent, locale: AppLocale = defaultLocale): string {
  const slug = event.locales?.[locale]?.slug?.trim();
  return slug || event.id;
}

export function findEventByKey(events: NightEvent[], key: string): NightEvent | undefined {
  const decoded = decodeURIComponent(key);
  const byId = events.find((e) => e.id === decoded);
  if (byId) return byId;
  return events.find((e) => {
    if (!e.locales) return false;
    return Object.values(e.locales).some((v) => v?.slug?.trim() === decoded);
  });
}

export function mergeEventLocales(
  current: EventLocalesMap | undefined,
  patch: EventLocalesMap | undefined,
): EventLocalesMap | undefined {
  if (!patch) return current;
  const next: EventLocalesMap = { ...current };
  for (const loc of Object.keys(patch) as AppLocale[]) {
    const piece = patch[loc];
    if (!piece) continue;
    next[loc] = { ...next[loc], ...piece };
  }
  return next;
}
