import { getPathname } from "@/i18n/routing";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";
import {
  buildEventFullPath,
  buildGroupFullPath,
  buildVenueFullPath,
  getSiteOrigin,
  sectionFromCategory,
} from "@/lib/appPaths";

export function buildAbsoluteUrl(href: string, locale: AppLocale = defaultLocale): string {
  const path = getPathname({ href, locale });
  return `${getSiteOrigin()}${path}`;
}

export function buildAbsoluteVenueFullUrl(
  provider: Provider,
  locale?: AppLocale,
): string {
  const loc = locale ?? defaultLocale;
  return buildAbsoluteUrl(
    buildVenueFullPath(provider, {
      from: sectionFromCategory(provider.category),
      locale: loc,
    }),
    loc,
  );
}

/** @deprecated Use buildAbsoluteVenueFullUrl for share links. */
export function buildAbsoluteVenueUrl(provider: Provider, locale?: AppLocale): string {
  return buildAbsoluteVenueFullUrl(provider, locale);
}

export function buildAbsoluteEventFullUrl(
  eventOrKey: NightEvent | string,
  locale?: AppLocale,
): string {
  const loc = locale ?? defaultLocale;
  return buildAbsoluteUrl(buildEventFullPath(eventOrKey, { locale: loc }), loc);
}

export function buildAbsoluteGroupFullUrl(groupId: string, locale?: AppLocale): string {
  return buildAbsoluteUrl(buildGroupFullPath(groupId), locale);
}

/** @deprecated Use buildAbsoluteGroupFullUrl for share links. */
export function buildAbsoluteGroupUrl(groupId: string, locale?: AppLocale): string {
  return buildAbsoluteGroupFullUrl(groupId, locale);
}
