"use client";

import { useTranslations } from "next-intl";
import { activityTypeMessageKey } from "@/data/activityTypeKeys";
import { neighborhoodMessageKey } from "@/data/neighborhoodKeys";
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

/** Display label for canonical neighborhood names stored in Mongo / URL params. */
export function useNeighborhoodLabel() {
  const t = useTranslations("neighborhood");
  return (canonical: string) => {
    const key = neighborhoodMessageKey(canonical);
    return key ? t(key) : canonical;
  };
}

/** Display label for activity / vibe filter tags. */
export function useActivityTypeLabel() {
  const t = useTranslations("activityType");
  return (canonical: string) => {
    const key = activityTypeMessageKey(canonical);
    return key ? t(key) : canonical;
  };
}

/** Neighborhood + district line for cards and profiles. */
export function useVenueLocationLine() {
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  return (borough: Borough, neighborhood: string) =>
    `${neighborhoodLabel(neighborhood)}, ${districtLabel(borough)}`;
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
