/** ISO-style money codes used on providers, events, and menus (storage). */
export type MoneyCurrency = "EUR" | "HUF" | "FREE";

/** @deprecated Use formatHufAsDisplay from @/lib/currency with display currency context. */
export function formatMoneyAmount(
  amount: number,
  currency: MoneyCurrency,
  locale = "en",
): string {
  if (currency === "FREE") return "";
  const n = Math.round(amount);
  if (currency === "HUF") {
    return `${n.toLocaleString(locale)} Ft`;
  }
  if (Number.isInteger(amount)) return `€${n}`;
  return `€${amount.toFixed(2)}`;
}

/** Canonical storage currency for provider pricePerClass. */
export function providerPriceCurrency(
  _pricePerClass: number,
  priceCurrency?: MoneyCurrency | null,
): MoneyCurrency {
  if (priceCurrency === "EUR") return "EUR";
  return "HUF";
}
