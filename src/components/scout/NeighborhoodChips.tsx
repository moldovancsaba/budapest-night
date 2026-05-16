"use client";

import { useNeighborhoodLabel } from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function NeighborhoodChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (n: string | null) => void;
}) {
  const t = useTranslations("neighborhood");
  const neighborhoodLabel = useNeighborhoodLabel();

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t("label")}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            value === null
              ? "border-foreground bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-foreground",
          )}
        >
          {t("all")}
        </button>
        {options.map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card/80 text-foreground hover:border-foreground/40 hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {neighborhoodLabel(n)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
