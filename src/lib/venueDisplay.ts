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

export function formatVenuePrice(provider: Pick<Provider, "category" | "pricePerClass">): VenuePriceDisplay {
  const unit = venuePriceUnit(provider.category);
  const n = provider.pricePerClass;

  if (n === 0) {
    if (provider.category === "Parties") return { main: "Free entry" };
    if (provider.category === "Venues") return { main: "Free", suffix: "/ticket" };
    return { main: "Price varies" };
  }

  return { main: `€${n}`, suffix: `/${unit}` };
}

/** Budget / saved row unit word (no slash). */
/** One-line price for share / email copy. */
export function venueSharePriceLine(provider: Pick<Provider, "category" | "pricePerClass">): string {
  const p = formatVenuePrice(provider);
  if (!p.suffix) return p.main;
  if (p.main.startsWith("€")) return `From ${p.main}${p.suffix}`;
  return p.main;
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
