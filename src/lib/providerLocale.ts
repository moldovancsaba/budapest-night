import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import type { Provider } from "@/types/provider";
import type { ProviderLocaleContent, ProviderLocalesMap } from "@/types/providerLocale";

export function parseAppLocaleParam(raw: string | null | undefined): AppLocale {
  if (raw && locales.includes(raw as AppLocale)) return raw as AppLocale;
  return defaultLocale;
}

function pickLocaleOverlay(variant: ProviderLocaleContent): Partial<Provider> {
  const out: Partial<Provider> = {};
  if (variant.name?.trim()) out.name = variant.name.trim();
  if (variant.shortDescription?.trim()) out.shortDescription = variant.shortDescription.trim();
  if (variant.longDescription?.trim()) out.longDescription = variant.longDescription.trim();
  if (variant.address?.trim()) out.address = variant.address.trim();
  if (variant.activityTypes?.length) out.activityTypes = variant.activityTypes;
  if (variant.announcementTitle?.trim()) out.announcementTitle = variant.announcementTitle.trim();
  if (variant.announcementDescription?.trim()) {
    out.announcementDescription = variant.announcementDescription.trim();
  }
  if (variant.announcementBadge?.trim()) out.announcementBadge = variant.announcementBadge.trim();
  if (variant.image?.trim()) out.image = variant.image.trim();
  return out;
}

/** Apply locale variant when present; otherwise return base (English) fields. */
export function resolveProviderForLocale(provider: Provider, locale: AppLocale): Provider {
  const variant = provider.locales?.[locale];
  if (!variant) return provider;
  return { ...provider, ...pickLocaleOverlay(variant) };
}

export function resolveProvidersForLocale(rows: Provider[], locale: AppLocale): Provider[] {
  return rows.map((p) => resolveProviderForLocale(p, locale));
}

export function getVenuePathKey(provider: Provider, locale: AppLocale = defaultLocale): string {
  const slug = provider.locales?.[locale]?.slug?.trim();
  return slug || provider.id;
}

/** Match `/venue/{id}` or `/venue/{locale-slug}` for the active locale. */
export function findProviderByVenueKey(providers: Provider[], key: string): Provider | undefined {
  const decoded = decodeURIComponent(key);
  const byId = providers.find((p) => p.id === decoded);
  if (byId) return byId;

  return providers.find((p) => {
    if (!p.locales) return false;
    return Object.values(p.locales).some((v) => v?.slug?.trim() === decoded);
  });
}

export function mergeProviderLocales(
  current: ProviderLocalesMap | undefined,
  patch: ProviderLocalesMap | undefined,
): ProviderLocalesMap | undefined {
  if (!patch) return current;
  const next: ProviderLocalesMap = { ...current };
  for (const loc of Object.keys(patch) as AppLocale[]) {
    const piece = patch[loc];
    if (!piece) continue;
    next[loc] = { ...next[loc], ...piece };
  }
  return next;
}
