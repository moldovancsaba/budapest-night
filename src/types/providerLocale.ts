import type { AppLocale } from "@/i18n/config";

/** Per-locale copy and optional URL slug for a venue / event listing. */
export interface ProviderLocaleContent {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  address?: string;
  activityTypes?: string[];
  announcementTitle?: string;
  announcementDescription?: string;
  announcementBadge?: string;
  /** Optional hero image for this locale (ImgBB https URL). */
  image?: string;
  /** URL segment under `/venue/{slug}` when this locale is active. */
  slug?: string;
}

export type ProviderLocalesMap = Partial<Record<AppLocale, ProviderLocaleContent>>;
