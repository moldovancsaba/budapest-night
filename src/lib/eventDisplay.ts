import type { EntryFee, NightEvent } from "@/types/event";
import { formatMoneyAmount } from "@/lib/formatMoney";

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

export function formatEntryFee(fee: EntryFee, locale: string): string {
  if (fee.currency === "FREE" || fee.amount === 0) return "Free";
  return formatMoneyAmount(fee.amount, fee.currency, locale);
}

export function lowestEntryFee(fees: EntryFee[]): EntryFee | null {
  const priced = fees.filter((f) => f.currency !== "FREE" && f.amount > 0);
  if (!priced.length) return fees.find((f) => f.currency === "FREE") ?? null;
  return priced.reduce((a, b) => (a.amount <= b.amount ? a : b));
}

export function isUpcoming(event: Pick<NightEvent, "endsAt">, now = Date.now()): boolean {
  return new Date(event.endsAt).getTime() >= now;
}
