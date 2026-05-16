import { amountToHuf, formatHufAsDisplay } from "@/lib/currency";
import { providerPriceCurrency } from "@/lib/formatMoney";
import type { DisplayCurrency, CurrencyRates } from "@/types/currency";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";
import type { Category, Provider } from "@/types/provider";

/** Crowd / age chip — values are already human-readable (e.g. "18+", "All ages"). */
export function formatCrowdLabel(age: string): string {
  return age;
}

/** Short unit after price on cards and profiles. */
export function venuePriceUnit(category: Category): "ticket" | "cover" | "person" {
  switch (category) {
    case "Venues":
      return "ticket";
    case "Parties":
      return "cover";
    case "Restaurants":
    case "Cafés":
    default:
      return "person";
  }
}

export type VenuePriceDisplay = {
  main: string;
  suffix?: string;
};

export type VenuePriceFormatOptions = {
  displayCurrency?: DisplayCurrency;
  rates?: CurrencyRates;
  locale?: string;
};

export function formatVenuePrice(
  provider: Pick<Provider, "category" | "pricePerClass" | "priceCurrency">,
  opts: VenuePriceFormatOptions = {},
): VenuePriceDisplay {
  const unit = venuePriceUnit(provider.category);
  const display = opts.displayCurrency ?? "HUF";
  const rates = opts.rates ?? DEFAULT_CURRENCY_RATES;
  const locale = opts.locale ?? "en";
  const stored = providerPriceCurrency(provider.pricePerClass, provider.priceCurrency);
  const huf = amountToHuf(provider.pricePerClass, stored, rates);

  if (huf === 0) {
    if (provider.category === "Parties") return { main: "Free entry" };
    return { main: "Price varies" };
  }

  const amount = formatHufAsDisplay(huf, display, locale, rates);
  return { main: `From ${amount}`, suffix: `/${unit}` };
}

export function venueSharePriceLine(
  provider: Pick<Provider, "category" | "pricePerClass" | "priceCurrency">,
  opts: VenuePriceFormatOptions = {},
): string {
  const p = formatVenuePrice(provider, opts);
  if (!p.suffix) return p.main;
  return `${p.main}${p.suffix}`;
}

export function venueBudgetUnit(category: Category): string {
  switch (category) {
    case "Venues":
      return "ticket";
    case "Parties":
      return "cover";
    case "Restaurants":
      return "table";
    case "Cafés":
      return "visit";
    default:
      return "person";
  }
}

/** Sum provider line items in canonical HUF for calculator totals. */
export function providerLineHuf(
  provider: Pick<Provider, "pricePerClass" | "priceCurrency">,
  classes: number,
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
): number {
  const stored = providerPriceCurrency(provider.pricePerClass, provider.priceCurrency);
  return amountToHuf(provider.pricePerClass, stored, rates) * classes;
}
