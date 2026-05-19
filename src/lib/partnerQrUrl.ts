import { getVenuePathKey } from "@/lib/providerLocale";
import { getSiteOrigin } from "@/lib/appPaths";
import type { Provider } from "@/types/provider";
import type { AppLocale } from "@/i18n/config";

export type PartnerQrUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
};

/** Stable venue URL for QR / print (short `/v/` path on HU). */
export function buildPartnerVenueUrl(
  provider: Provider,
  locale: AppLocale = "hu",
  utm: PartnerQrUtm = {},
): string {
  const slug = getVenuePathKey(provider, locale);
  const origin = getSiteOrigin();
  const localePath = locale === "hu" ? "" : `/${locale}`;
  const segment = locale === "hu" ? "v" : "venue";
  const params = new URLSearchParams();
  params.set("utm_source", utm.source ?? "pestiest");
  params.set("utm_medium", utm.medium ?? "qr");
  params.set("utm_content", utm.content ?? provider.id);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  return `${origin}${localePath}/${segment}/${encodeURIComponent(slug)}?${params.toString()}`;
}
