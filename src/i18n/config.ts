export const locales = ["en", "es", "it", "hu", "he", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

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
