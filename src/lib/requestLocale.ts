import { headers } from "next/headers";
import { isRtlLocale, type AppLocale } from "@/i18n/config";

const LOCALES: AppLocale[] = ["hu", "en", "es", "it", "he", "ar"];

export function localeFromPathname(pathname: string): AppLocale {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (LOCALES.includes(seg as AppLocale)) return seg as AppLocale;
  return "hu";
}

/** Server: locale + text direction from middleware pathname header. */
export async function getRequestLocale(): Promise<{ locale: AppLocale; dir: "ltr" | "rtl" }> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale = localeFromPathname(pathname);
  return { locale, dir: isRtlLocale(locale) ? "rtl" : "ltr" };
}
