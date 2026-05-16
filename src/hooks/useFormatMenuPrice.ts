"use client";

import { useTranslations } from "next-intl";
import { formatMenuPrice } from "@/lib/menu/formatMenuPrice";
import type { MenuPrice } from "@/types/menu";

export function useFormatMenuPrice() {
  const t = useTranslations("menu");
  return (price: MenuPrice) => {
    const f = formatMenuPrice(price);
    if (price.source === "estimated") {
      return { ...f, suffix: `${f.suffix ?? ""} ${t("estimated")}`.trim() };
    }
    return f;
  };
}
