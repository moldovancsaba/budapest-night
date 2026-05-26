import { getGdsMessages } from "@doneisbetter/gds-core";
import type { AppLocale } from "@/i18n/config";

/** GDS semantic control messages (SSOT: @doneisbetter/gds-core locales). */
export function getGdsMessagesForLocale(locale: AppLocale): Record<string, string> {
  return getGdsMessages(locale);
}
