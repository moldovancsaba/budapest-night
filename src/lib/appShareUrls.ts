import { getPathname } from "@/i18n/routing";
import { defaultLocale, type AppLocale } from "@/i18n/config";
import type { Provider } from "@/types/provider";
import { buildGroupPath, buildVenuePath, getSiteOrigin, sectionFromCategory } from "@/lib/appPaths";

export function buildAbsoluteUrl(href: string, locale: AppLocale = defaultLocale): string {
  const path = getPathname({ href, locale });
  return `${getSiteOrigin()}${path}`;
}

export function buildAbsoluteVenueUrl(provider: Provider, locale?: AppLocale): string {
  const loc = locale ?? defaultLocale;
  return buildAbsoluteUrl(
    buildVenuePath(provider, { from: sectionFromCategory(provider.category), locale: loc }),
    loc,
  );
}

export function buildAbsoluteGroupUrl(groupId: string, locale?: AppLocale): string {
  return buildAbsoluteUrl(buildGroupPath(groupId), locale);
}
