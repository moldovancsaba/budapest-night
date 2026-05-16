import type { AppLocale } from "@/i18n/config";

export interface EventLocaleContent {
  title?: string;
  shortDescription?: string;
  longDescription?: string;
  slug?: string;
}

export type EventLocalesMap = Partial<Record<AppLocale, EventLocaleContent>>;
