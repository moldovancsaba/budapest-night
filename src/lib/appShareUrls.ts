import { getPathname } from "@/i18n/routing";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import type { Category } from "@/types/provider";
import { buildGroupPath, buildVenuePath, getSiteOrigin, sectionFromCategory } from "@/lib/appPaths";

export function buildAbsoluteUrl(href: string, locale: AppLocale = defaultLocale): string {
  const path = getPathname({ href, locale });
  return `${getSiteOrigin()}${path}`;
}

export function buildAbsoluteVenueUrl(venueId: string, category: Category, locale?: AppLocale): string {
  return buildAbsoluteUrl(
    buildVenuePath(venueId, { from: sectionFromCategory(category) }),
    locale,
  );
}

export function buildAbsoluteGroupUrl(groupId: string, locale?: AppLocale): string {
  return buildAbsoluteUrl(buildGroupPath(groupId), locale);
}
