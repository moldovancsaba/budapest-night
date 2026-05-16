import type { DisplayCurrency, CurrencyRates } from "@/types/currency";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";
import type { EventCurrency } from "@/types/event";
import type { MenuCurrency } from "@/types/menu";

export type StoredMoneyCurrency = "HUF" | "EUR" | "FREE";

export function normalizeRates(rates?: Partial<CurrencyRates> | null): CurrencyRates {
  const hufPerEur = rates?.hufPerEur;
  const hufPerUsd = rates?.hufPerUsd;
  return {
    hufPerEur: typeof hufPerEur === "number" && hufPerEur > 0 ? hufPerEur : DEFAULT_CURRENCY_RATES.hufPerEur,
    hufPerUsd: typeof hufPerUsd === "number" && hufPerUsd > 0 ? hufPerUsd : DEFAULT_CURRENCY_RATES.hufPerUsd,
  };
}

/**
 * Convert a stored provider/menu amount to canonical HUF.
 * Legacy rows may still be EUR (small amounts ≤500 without priceCurrency).
 */
export function amountToHuf(
  amount: number,
  stored?: StoredMoneyCurrency | MenuCurrency | EventCurrency | null,
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
): number {
  if (!amount || stored === "FREE") return 0;
  if (stored === "HUF") return Math.round(amount);
  if (stored === "EUR") return Math.round(amount * rates.hufPerEur);
  if (amount > 500) return Math.round(amount);
  return Math.round(amount * rates.hufPerEur);
}

export function hufToDisplayAmount(
  huf: number,
  display: DisplayCurrency,
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
): number {
  if (display === "HUF") return Math.round(huf);
  if (display === "EUR") return huf / rates.hufPerEur;
  return huf / rates.hufPerUsd;
}

/** Format a HUF canonical amount in the user's display currency. */
export function formatHufAsDisplay(
  huf: number,
  display: DisplayCurrency,
  locale = "en",
  rates: CurrencyRates = DEFAULT_CURRENCY_RATES,
): string {
  if (huf <= 0) return "";
  const value = hufToDisplayAmount(huf, display, rates);
  if (display === "HUF") {
    return `${Math.round(value).toLocaleString(locale)} Ft`;
  }
  if (display === "EUR") {
    const rounded = Math.round(value * 100) / 100;
    return Number.isInteger(rounded) ? `€${rounded.toLocaleString(locale)}` : `€${rounded.toFixed(2)}`;
  }
  const rounded = Math.round(value * 100) / 100;
  return `$${rounded.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
