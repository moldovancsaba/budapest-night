"use client";

import { useLocale, useTranslations } from "next-intl";
import type { EntryFee, NightEvent } from "@/types/event";
import {
  formatDoorsOpen,
  formatEntryFee,
  formatEventDateRange,
  lowestEntryFee,
} from "@/lib/eventDisplay";
import { useActivityTypeLabel, useAgeRangeLabel, useBadgeLabel, useVenueLocationLine } from "@/hooks/useVenueDisplay";

export function useFormatEventSchedule() {
  const locale = useLocale();
  return (event: Pick<NightEvent, "startsAt" | "endsAt" | "timezone">) =>
    formatEventDateRange(event, locale);
}

export function useFormatDoorsOpen() {
  const locale = useLocale();
  const t = useTranslations("event");
  return (event: Pick<NightEvent, "doorsOpenAt" | "timezone">) => {
    const time = formatDoorsOpen(event.doorsOpenAt, locale, event.timezone);
    return time ? t("doorsOpen", { time }) : null;
  };
}

export function useFormatEntryFee() {
  const locale = useLocale();
  return (fee: EntryFee) => formatEntryFee(fee, locale);
}

export function useEventFromPrice() {
  const formatFee = useFormatEntryFee();
  const t = useTranslations("event");
  return (fees: EntryFee[]) => {
    const low = lowestEntryFee(fees);
    if (!low) return t("priceTba");
    if (low.currency === "FREE" || low.amount === 0) return t("freeEntry");
    return t("fromPrice", { price: formatFee(low) });
  };
}

export function useEventLocationLine() {
  const locationLine = useVenueLocationLine();
  return (event: Pick<NightEvent, "borough" | "neighborhood">) =>
    locationLine(event.borough, event.neighborhood);
}

export function useEventDisplayLabels() {
  const activityLabel = useActivityTypeLabel();
  const ageLabel = useAgeRangeLabel();
  const badgeLabel = useBadgeLabel();
  return { activityLabel, ageLabel, badgeLabel };
}
