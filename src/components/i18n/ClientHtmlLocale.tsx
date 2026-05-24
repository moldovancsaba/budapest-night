"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { isRtlLocale, type AppLocale } from "@/i18n/config";

/** Syncs document `lang` and `dir` for locale routes (html lives in root layout). */
export function ClientHtmlLocale() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale as AppLocale) ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
