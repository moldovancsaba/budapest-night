"use client";

import { useLocale, useTranslations } from "next-intl";
import type { EntryFee, EventVenueLink, NightEvent } from "@/types/event";
import { formatHufAsDisplay } from "@/lib/currency";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import {
  entryFeeHuf,
  formatDoorsOpen,
  formatEventDateRange,
  lowestEntryFeeHuf,
} from "@/lib/eventDisplay";
import type { Provider } from "@/types/provider";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { resolveProviderLocation } from "@/lib/budapestLocation";

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
  const t = useTranslations("event");
  const { displayCurrency, rates } = useDisplayCurrency();
  return (fee: EntryFee) => {
    const huf = entryFeeHuf(fee, rates);
    if (huf === 0) return t("freeEntry");
    return formatHufAsDisplay(huf, displayCurrency, locale, rates);
  };
}

export function useEventFromPrice() {
  const locale = useLocale();
  const t = useTranslations("event");
  const { displayCurrency, rates } = useDisplayCurrency();
  return (fees: EntryFee[]) => {
    const lowHuf = lowestEntryFeeHuf(fees, rates);
    if (lowHuf === null) return t("priceTba");
    if (lowHuf === 0) return t("freeEntry");
    const price = formatHufAsDisplay(lowHuf, displayCurrency, locale, rates);
    return t("fromPrice", { price });
  };
}

export function useEventLocationLine() {
  const locationLine = useVenueLocationLine();
  return (
    event: Pick<NightEvent, "borough" | "neighborhood">,
    host?: Pick<Provider, "id" | "borough" | "neighborhood" | "address"> | null,
  ) => {
    const located = host ? resolveProviderLocation(host) : null;
    const borough = located?.borough ?? event.borough;
    const neighborhood = located?.neighborhood ?? event.neighborhood;
    return locationLine(borough, neighborhood);
  };
}

type EventHostPlace = Pick<
  Provider,
  "id" | "name" | "borough" | "neighborhood" | "address"
> | EventVenueLink;

/** Venue name + district line when a host venue is linked (falls back to event fields). */
export function useEventPlaceLine() {
  const locationLine = useVenueLocationLine();
  const t = useTranslations("event");
  return (
    event: Pick<NightEvent, "borough" | "neighborhood">,
    host?: EventHostPlace | null,
  ) => {
    if (host?.name) {
      const loc = resolveProviderLocation(host);
      const place = locationLine(loc.borough, loc.neighborhood);
      return t("hostAt", { venue: host.name, place });
    }
    return locationLine(event.borough, event.neighborhood);
  };
}

export function primaryHostFromEvent(
  event: Pick<NightEvent, "venueIds" | "venueLinks"> & { venues?: EventVenueLink[] },
  providers: Provider[],
): EventHostPlace | null {
  if (event.venues?.[0]) return event.venues[0];
  const live = providers.find((p) => p.id === event.venueIds[0]);
  if (live) return live;
  return event.venueLinks?.[0] ?? null;
}

export function useEventDisplayLabels() {
  const activityLabel = useActivityTypeLabel();
  const ageLabel = useAgeRangeLabel();
  const badgeLabel = useBadgeLabel();
  return { activityLabel, ageLabel, badgeLabel };
}
