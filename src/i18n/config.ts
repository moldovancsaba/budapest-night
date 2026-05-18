export const locales = ["en", "es", "it", "hu", "he", "ar"] as const;
export type AppLocale = (typeof locales)[number];

/** Pesti Est is HU-first; English uses locale prefix `/en/...`. */
export const defaultLocale: AppLocale = "hu";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  it: "Italiano",
  hu: "Magyar",
  he: "עברית",
  ar: "العربية",
};

/** Locales that use right-to-left layout. */
export const rtlLocales: AppLocale[] = ["he", "ar"];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as AppLocale);
}
