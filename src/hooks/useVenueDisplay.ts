"use client";

import { useTranslations } from "next-intl";
import type { Category, Provider, AgeRange, DayTimeTag } from "@/types/provider";
import type { Borough, BoroughChoice } from "@/types/provider";

const DISTRICT_KEY: Record<Exclude<Borough, never>, string> = {
  Belváros: "belvaros",
  Terézváros: "terezvaros",
  Erzsébetváros: "erzsebetvaros",
  Ferencváros: "ferencvaros",
  Buda: "buda",
  Óbuda: "obuda",
  Újbuda: "ujbuda",
};

const CATEGORY_KEY: Record<Category, "events" | "parties" | "restaurants" | "cafes"> = {
  Events: "events",
  Parties: "parties",
  Restaurants: "restaurants",
  Cafés: "cafes",
};

export function useCategoryLabel() {
  const t = useTranslations("nav");
  return (category: Category) => t(CATEGORY_KEY[category]);
}

export function useDistrictLabel() {
  const t = useTranslations("district");
  return (borough: BoroughChoice) => (borough === "All" ? t("all") : t(DISTRICT_KEY[borough]));
}

export function useAgeRangeLabel() {
  const t = useTranslations("ageRange");
  return (age: AgeRange | string) => t(age as AgeRange);
}

export function useDayTimeLabel() {
  const t = useTranslations("dayTime");
  return (tag: DayTimeTag | string) => t(tag as DayTimeTag);
}

export type VenuePriceDisplay = { main: string; suffix?: string };

export function useFormatVenuePrice() {
  const t = useTranslations("venue");
  return (provider: Pick<Provider, "category" | "pricePerClass">): VenuePriceDisplay => {
    const n = provider.pricePerClass;
    if (n === 0) {
      if (provider.category === "Parties") return { main: t("freeEntry") };
      if (provider.category === "Events") return { main: t("free"), suffix: t("perTicket") };
      return { main: t("priceVaries") };
    }
    const suffix =
      provider.category === "Events"
        ? t("perTicket")
        : provider.category === "Parties"
          ? t("perCover")
          : t("perPerson");
    return { main: `€${n}`, suffix };
  };
}

export function useVenueSharePriceLine() {
  const format = useFormatVenuePrice();
  return (provider: Pick<Provider, "category" | "pricePerClass">) => {
    const p = format(provider);
    if (!p.suffix) return p.main;
    if (p.main.startsWith("€")) return `${p.main}${p.suffix}`;
    return p.main;
  };
}
