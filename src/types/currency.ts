/** User-selected display currency (stored in localStorage). */
export type DisplayCurrency = "HUF" | "EUR" | "USD";

/** Fixed conversion rates configured in admin site settings (HUF is canonical). */
export interface CurrencyRates {
  /** How many forints per 1 euro (e.g. 350). */
  hufPerEur: number;
  /** How many forints per 1 US dollar (e.g. 300). */
  hufPerUsd: number;
}

export const DEFAULT_CURRENCY_RATES: CurrencyRates = {
  hufPerEur: 350,
  hufPerUsd: 300,
};
