import { ar, en, he, hu, it } from "@gds/core";
import type { AppLocale } from "@/i18n/config";

/** GDS semantic messages; `es` falls back to `en` until @gds/core ships `es`. */
const GDS_MESSAGES: Record<AppLocale, Record<string, string>> = {
  hu,
  en,
  es: en,
  it,
  he,
  ar,
};

export function getGdsMessagesForLocale(locale: AppLocale): Record<string, string> {
  return GDS_MESSAGES[locale] ?? en;
}
