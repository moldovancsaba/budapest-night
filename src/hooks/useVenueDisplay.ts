"use client";

import { useLocale, useTranslations } from "next-intl";
import { activityTypeMessageKey } from "@/data/activityTypeKeys";
import { badgeMessageKey } from "@/data/badgeKeys";
import { MEETUP_CADENCE_KEY, MEETUP_GROUP_TYPE_KEY } from "@/data/meetupKeys";
import { neighborhoodMessageKey } from "@/data/neighborhoodKeys";
import { amountToHuf, formatHufAsDisplay } from "@/lib/currency";
import { providerPriceCurrency } from "@/lib/formatMoney";
import { venuePriceUnit } from "@/lib/venueDisplay";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import type { Category, Provider, AgeRange, DayTimeTag } from "@/types/provider";
import type { Borough, BoroughChoice } from "@/types/provider";
import type { MeetupCadence, MeetupGroupType } from "@/types/meetup";

const DISTRICT_KEY: Record<Exclude<Borough, never>, string> = {
  Belváros: "belvaros",
  Terézváros: "terezvaros",
  Erzsébetváros: "erzsebetvaros",
  Ferencváros: "ferencvaros",
  Buda: "buda",
  Óbuda: "obuda",
  Újbuda: "ujbuda",
};

const CATEGORY_KEY: Record<Category, "venues" | "parties" | "restaurants" | "cafes"> = {
  Venues: "venues",
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
  const locale = useLocale();
  const { displayCurrency, rates } = useDisplayCurrency();
  return (provider: Pick<Provider, "category" | "pricePerClass" | "priceCurrency">): VenuePriceDisplay => {
    const stored = providerPriceCurrency(provider.pricePerClass, provider.priceCurrency);
    const huf = amountToHuf(provider.pricePerClass, stored, rates);
    if (huf === 0) {
      if (provider.category === "Parties") return { main: t("freeEntry") };
      return { main: t("priceVaries") };
    }
    const amount = formatHufAsDisplay(huf, displayCurrency, locale, rates);
    const suffix =
      provider.category === "Venues"
        ? t("perTicket")
        : provider.category === "Parties"
          ? t("perCover")
          : t("perPerson");
    return { main: t("fromPrice", { price: amount }), suffix };
  };
}

export function useVenueSharePriceLine() {
  const format = useFormatVenuePrice();
  return (provider: Pick<Provider, "category" | "pricePerClass">) => {
    const p = format(provider);
    if (!p.suffix) return p.main;
    return `${p.main}${p.suffix}`;
  };
}

export function useBadgeLabel() {
  const t = useTranslations("badge");
  return (canonical: string) => {
    const key = badgeMessageKey(canonical);
    return key ? t(key) : canonical;
  };
}

export function useMeetupGroupTypeLabel() {
  const t = useTranslations("meetup.groupType");
  return (type: MeetupGroupType | string) => {
    const key = MEETUP_GROUP_TYPE_KEY[type as MeetupGroupType];
    return key ? t(key) : type;
  };
}

export function useMeetupCadenceLabel() {
  const t = useTranslations("meetup.cadence");
  return (cadence: MeetupCadence | string) => {
    const key = MEETUP_CADENCE_KEY[cadence as MeetupCadence];
    return key ? t(key) : cadence;
  };
}

/** Translate account preference chips (canonical English values in JSON). */
export function usePreferenceOptionLabel() {
  const ageLabel = useAgeRangeLabel();
  const dayLabel = useDayTimeLabel();
  const activityLabel = useActivityTypeLabel();
  const categoryLabel = useCategoryLabel();
  const tNav = useTranslations("nav");

  return (option: string) => {
    if (option === "Culture") return tNav("culture");
    if (activityTypeMessageKey(option)) return activityLabel(option);
    const categories: Category[] = ["Venues", "Parties", "Restaurants", "Cafés"];
    if (categories.includes(option as Category)) return categoryLabel(option as Category);
    const ages: AgeRange[] = ["All ages", "Family", "18+", "21+", "Late night"];
    if (ages.includes(option as AgeRange)) return ageLabel(option as AgeRange);
    const days: DayTimeTag[] = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"];
    if (days.includes(option as DayTimeTag)) return dayLabel(option as DayTimeTag);
    return option;
  };
}

export function useVenueShareSummary() {
  const t = useTranslations("venue");
  const categoryLabel = useCategoryLabel();
  const sharePrice = useVenueSharePriceLine();
  const neighborhoodLabel = useNeighborhoodLabel();
  const districtLabel = useDistrictLabel();

  return (provider: Pick<Provider, "name" | "category" | "borough" | "neighborhood" | "shortDescription" | "pricePerClass">) =>
    t("shareSummary", {
      name: provider.name,
      category: categoryLabel(provider.category),
      neighborhood: neighborhoodLabel(provider.neighborhood),
      borough: districtLabel(provider.borough),
      price: sharePrice(provider),
      description: provider.shortDescription,
    });
}
