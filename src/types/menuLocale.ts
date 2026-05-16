import type { AppLocale } from "@/i18n/config";

/** Root menu item `name` / section `title` are English (canonical fallback). */
export const MENU_BASE_LOCALE: AppLocale = "en";

export type MenuIngestLocale = Exclude<AppLocale, typeof MENU_BASE_LOCALE>;

export type MenuItemLocaleContent = {
  name: string;
  description?: string;
};

export type MenuSectionLocaleContent = {
  title: string;
};

export type MenuItemLocalesMap = Partial<Record<MenuIngestLocale, MenuItemLocaleContent>>;
export type MenuSectionLocalesMap = Partial<Record<MenuIngestLocale, MenuSectionLocaleContent>>;
