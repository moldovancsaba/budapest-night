import { formatMoneyAmount, providerPriceCurrency } from "@/lib/formatMoney";
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
  /** Main line, e.g. "€25" or "Free entry" */
  main: string;
  /** Optional suffix, e.g. "/cover" — omitted when main already explains pricing */
  suffix?: string;
};

export function formatVenuePrice(
  provider: Pick<Provider, "category" | "pricePerClass" | "priceCurrency">,
  locale = "en",
): VenuePriceDisplay {
  const unit = venuePriceUnit(provider.category);
  const n = provider.pricePerClass;

  if (n === 0) {
    if (provider.category === "Parties") return { main: "Free entry" };
    return { main: "Price varies" };
  }

  const currency = providerPriceCurrency(n, provider.priceCurrency);
  const amount = formatMoneyAmount(n, currency, locale);
  return { main: `From ${amount}`, suffix: `/${unit}` };
}

/** Budget / saved row unit word (no slash). */
/** One-line price for share / email copy. */
export function venueSharePriceLine(provider: Pick<Provider, "category" | "pricePerClass">): string {
  const p = formatVenuePrice(provider);
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
