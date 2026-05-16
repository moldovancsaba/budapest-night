/** ISO-style money codes used on providers, events, and menus. */
export type MoneyCurrency = "EUR" | "HUF" | "FREE";

/** Format a numeric amount with the correct symbol and grouping (never mix € with HUF). */
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

/** Default listing currency when omitted on a provider document. */
export function providerPriceCurrency(
  pricePerClass: number,
  priceCurrency?: MoneyCurrency | null,
): MoneyCurrency {
  if (priceCurrency === "HUF" || priceCurrency === "EUR") return priceCurrency;
  return "EUR";
}
