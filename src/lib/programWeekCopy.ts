import { defaultLocale, locales, type AppLocale } from "@/i18n/config";
import type { ProgramWeekDoc, ProgramWeekLocaleBlock } from "@/types/programWeek";

export function resolveProgramWeekLocaleBlock(
  doc: ProgramWeekDoc,
  locale: AppLocale,
): ProgramWeekLocaleBlock {
  return (
    doc.locales[locale] ??
    doc.locales[defaultLocale] ??
    doc.locales.hu ??
    doc.locales.en ??
    { headline: "", intro: "" }
  );
}

export const PROGRAM_WEEK_LOCALE_DEFAULTS: Record<AppLocale, ProgramWeekLocaleBlock> = {
  hu: {
    headline: "Ez a hét Budapesten",
    intro: "A legjobb programok egy helyen — események és helyszínek kerület szerint.",
  },
  en: {
    headline: "This week in Budapest",
    intro: "Highlights from Pesti Est — concerts, culture, and venues by district.",
  },
  es: {
    headline: "Esta semana en Budapest",
    intro: "Lo mejor de Pesti Est — eventos, cultura y locales por distrito.",
  },
  it: {
    headline: "Questa settimana a Budapest",
    intro: "In evidenza su Pesti Est — eventi, cultura e locali per quartiere.",
  },
  he: {
    headline: "השבוע בבודפשט",
    intro: "מבחר Pesti Est — אירועים, תרבות ומקומות לפי אזור.",
  },
  ar: {
    headline: "هذا الأسبوع في بودابست",
    intro: "أبرز ما في Pesti Est — فعاليات وثقافة وأماكن حسب المنطقة.",
  },
};

export function emptyProgramWeekLocales(): ProgramWeekDoc["locales"] {
  const out = {} as ProgramWeekDoc["locales"];
  for (const loc of locales) {
    out[loc] = { ...PROGRAM_WEEK_LOCALE_DEFAULTS[loc] };
  }
  return out;
}
