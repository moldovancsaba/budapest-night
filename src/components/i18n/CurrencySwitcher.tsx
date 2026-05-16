"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import type { DisplayCurrency } from "@/types/currency";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS: DisplayCurrency[] = ["HUF", "EUR", "USD"];

export function CurrencySwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "header";
}) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();
  const t = useTranslations("currency");
  const isHeader = variant === "header";

  return (
    <Select
      value={displayCurrency}
      onValueChange={(next) => setDisplayCurrency(next as DisplayCurrency)}
    >
      <SelectTrigger
        className={cn(
          isHeader
            ? "h-10 w-10 shrink-0 gap-0 rounded-full border-border bg-card p-0 text-foreground shadow-none hover:border-foreground/40 focus:ring-foreground/30 sm:w-auto sm:gap-1.5 sm:px-3 [&>svg]:hidden sm:[&>svg]:block"
            : "h-10 w-[120px] gap-2 border-border bg-card text-sm",
          className,
        )}
        aria-label={t("label")}
      >
        <Coins className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wide sm:hidden">
          {displayCurrency}
        </span>
        <SelectValue className="hidden whitespace-nowrap text-xs sm:inline sm:text-sm" />
      </SelectTrigger>
      <SelectContent align="end" className="border-border bg-card">
        {OPTIONS.map((code) => (
          <SelectItem key={code} value={code}>
            {t(`option.${code}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
