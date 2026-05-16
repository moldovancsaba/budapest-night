"use client";

import { useLocale, useTranslations } from "next-intl";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { formatMenuPrice } from "@/lib/menu/formatMenuPrice";
import type { MenuPrice } from "@/types/menu";

export function useFormatMenuPrice() {
  const t = useTranslations("menu");
  const locale = useLocale();
  const { displayCurrency, rates } = useDisplayCurrency();
  return (price: MenuPrice) => {
    const f = formatMenuPrice(price, { displayCurrency, rates, locale });
    if (price.source === "estimated") {
      return { ...f, suffix: `${f.suffix ?? ""} ${t("estimated")}`.trim() };
    }
    return f;
  };
}
