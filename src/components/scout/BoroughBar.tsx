"use client";

import { BOROUGHS } from "@/data/locations";
import type { BoroughChoice } from "@/types/provider";
import { useDistrictLabel } from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function BoroughBar({
  value,
  onChange,
}: {
  value: BoroughChoice;
  onChange: (b: BoroughChoice) => void;
}) {
  const t = useTranslations("district");
  const districtLabel = useDistrictLabel();
  const choices: BoroughChoice[] = ["All", ...BOROUGHS];

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t("label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {choices.map((b) => {
          const active = value === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => onChange(b)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-foreground/40 hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {districtLabel(b)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
