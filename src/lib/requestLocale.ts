import { headers } from "next/headers";
import { dirFromLocale, localeFromPathname } from "@/lib/localeFromPath";
import type { AppLocale } from "@/i18n/config";

export { localeFromPathname } from "@/lib/localeFromPath";

/** Server: locale + text direction from middleware pathname header. */
export async function getRequestLocale(): Promise<{ locale: AppLocale; dir: "ltr" | "rtl" }> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const locale = localeFromPathname(pathname);
  return { locale, dir: dirFromLocale(locale) };
}
