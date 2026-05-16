"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeLabels, type AppLocale } from "@/i18n/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "header";
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");
  const isHeader = variant === "header";

  return (
    <Select
      value={locale}
      onValueChange={(next) => {
        router.replace(pathname, { locale: next as AppLocale });
      }}
    >
      <SelectTrigger
        className={cn(
          isHeader
            ? "h-10 w-[4.75rem] shrink-0 gap-1 rounded-full border-border bg-card px-2 text-foreground shadow-none hover:border-primary focus:ring-primary/40 sm:w-[7.25rem] sm:gap-1.5 sm:px-2.5"
            : "h-10 w-[148px] gap-2 border-border bg-card text-sm",
          className,
        )}
        aria-label={t("label")}
      >
        <Languages className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-[11px] font-semibold uppercase tracking-wide sm:hidden">{locale}</span>
        <SelectValue className="hidden truncate text-xs sm:inline sm:text-sm" />
      </SelectTrigger>
      <SelectContent align="end" className="border-border bg-card">
        {locales.map((code) => (
          <SelectItem key={code} value={code}>
            {localeLabels[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
