import { getGdsMessages } from "@gds/core";
import type { AppLocale } from "@/i18n/config";

/** GDS semantic control messages (SSOT: @gds/core locales, currently 2.4.3). */
export function getGdsMessagesForLocale(locale: AppLocale): Record<string, string> {
  return getGdsMessages(locale);
}
