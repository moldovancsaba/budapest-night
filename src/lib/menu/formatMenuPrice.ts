import { amountToHuf, formatHufAsDisplay } from "@/lib/currency";
import type { CurrencyRates, DisplayCurrency } from "@/types/currency";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";
import type { MenuPrice } from "@/types/menu";

export function formatMenuPrice(
  price: MenuPrice,
  opts: {
    displayCurrency?: DisplayCurrency;
    rates?: CurrencyRates;
    locale?: string;
  } = {},
): { main: string; suffix?: string } {
  const display = opts.displayCurrency ?? "HUF";
  const rates = opts.rates ?? DEFAULT_CURRENCY_RATES;
  const locale = opts.locale ?? "en";
  const huf = amountToHuf(price.amount, price.currency, rates);
  const main = formatHufAsDisplay(huf, display, locale, rates);
  const unitLabels: Record<NonNullable<MenuPrice["unit"]>, string> = {
    each: "",
    glass: "/ glass",
    bottle: "/ bottle",
    portion: "/ portion",
    ticket: "/ ticket",
  };
  const suffix = price.unit ? unitLabels[price.unit] : undefined;
  return { main, suffix };
}
