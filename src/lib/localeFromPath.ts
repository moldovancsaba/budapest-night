import { isRtlLocale, type AppLocale } from "@/i18n/config";

const LOCALES: AppLocale[] = ["hu", "en", "es", "it", "he", "ar"];

export function localeFromPathname(pathname: string): AppLocale {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (LOCALES.includes(seg as AppLocale)) return seg as AppLocale;
  return "hu";
}

export function dirFromLocale(locale: AppLocale): "ltr" | "rtl" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
