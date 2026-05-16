import type { EntryFee, NightEvent } from "@/types/event";
import { amountToHuf, formatHufAsDisplay } from "@/lib/currency";
import type { CurrencyRates, DisplayCurrency } from "@/types/currency";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";

const TZ = "Europe/Budapest";

export function eventTimeZone(event: Pick<NightEvent, "timezone">): string {
  return event.timezone?.trim() || TZ;
}

export function formatEventDateRange(
  event: Pick<NightEvent, "startsAt" | "endsAt" | "timezone">,
  locale: string,
): { dateLine: string; timeLine: string } {
  const tz = eventTimeZone(event);
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const dateFmt = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  });
  const sameDay = dateFmt.format(start) === dateFmt.format(end);
  return {
    dateLine: sameDay ? dateFmt.format(start) : `${dateFmt.format(start)} – ${dateFmt.format(end)}`,
    timeLine: `${timeFmt.format(start)} – ${timeFmt.format(end)}`,
  };
}

export function formatDoorsOpen(
  doorsOpenAt: string | undefined,
  locale: string,
  timezone?: string,
): string | null {
  if (!doorsOpenAt) return null;
  const fmt = new Intl.DateTimeFormat(locale, {
    timeZone: timezone?.trim() || TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  return fmt.format(new Date(doorsOpenAt));
}

export function entryFeeHuf(fee: EntryFee, rates: CurrencyRates = DEFAULT_CURRENCY_RATES): number {
  if (fee.currency === "FREE" || fee.amount === 0) return 0;
  return amountToHuf(fee.amount, fee.currency, rates);
}

export function formatEntryFeeHuf(
  huf: number,
  display: DisplayCurrency,
  locale: string,
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
): string {
  if (huf <= 0) return "Free";
  return formatHufAsDisplay(huf, display, locale, rates);
}

/** @deprecated Prefer formatEntryFeeHuf with display currency. */
export function formatEntryFee(fee: EntryFee, locale: string): string {
  if (fee.currency === "FREE" || fee.amount === 0) return "Free";
  return formatEntryFeeHuf(entryFeeHuf(fee), "HUF", locale);
}

export function lowestEntryFeeHuf(
  fees: EntryFee[],
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
): number | null {
  const priced = fees
    .map((f) => entryFeeHuf(f, rates))
    .filter((h) => h > 0);
  if (!priced.length) {
    const hasFree = fees.some((f) => f.currency === "FREE" || f.amount === 0);
    return hasFree ? 0 : null;
  }
  return Math.min(...priced);
}

export function lowestEntryFee(fees: EntryFee[]): EntryFee | null {
  const priced = fees.filter((f) => f.currency !== "FREE" && f.amount > 0);
  if (!priced.length) return fees.find((f) => f.currency === "FREE") ?? null;
  return priced.reduce((a, b) => (a.amount <= b.amount ? a : b));
}

export function isUpcoming(event: Pick<NightEvent, "endsAt">, now = Date.now()): boolean {
  return new Date(event.endsAt).getTime() >= now;
}
