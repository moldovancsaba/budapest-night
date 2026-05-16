"use client";

import { useLocale } from "next-intl";
import { formatHufAsDisplay } from "@/lib/currency";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";

/** Format a canonical HUF amount in the user's selected display currency. */
export function useFormatHuf() {
  const locale = useLocale();
  const { displayCurrency, rates } = useDisplayCurrency();
  return (huf: number) => formatHufAsDisplay(huf, displayCurrency, locale, rates);
}
