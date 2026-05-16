"use client";

import { AGE_RANGES, DAY_TIME_TAGS, ACTIVITY_TYPES } from "@/data/providers";
import type { AgeRange, DayTimeTag } from "@/types/provider";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useDayTimeLabel,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  ages: AgeRange[];
  times: DayTimeTag[];
  activity: string | null;
}

export const EMPTY_FILTERS: FilterState = {
  ages: [],
  times: [],
  activity: null,
};

export function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (v: FilterState) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("filters");
  const ageLabel = useAgeRangeLabel();
  const dayLabel = useDayTimeLabel();
  const activityLabel = useActivityTypeLabel();
  const has = value.ages.length + value.times.length + (value.activity ? 1 : 0);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div>
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t("title")}{" "}
          {has > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
              {has}
            </span>
          )}
        </Button>
        {has > 0 && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-4 rounded-2xl border border-border bg-card p-5 animate-fade-in">
          <FilterGroup label={t("crowd")}>
            {AGE_RANGES.map((a) => (
              <Chip
                key={a}
                active={value.ages.includes(a)}
                onClick={() =>
                  onChange({ ...value, ages: toggle(value.ages, a) })
                }
              >
                {ageLabel(a)}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label={t("dayTime")}>
            {DAY_TIME_TAGS.map((d) => (
              <Chip
                key={d}
                active={value.times.includes(d)}
                onClick={() =>
                  onChange({ ...value, times: toggle(value.times, d) })
                }
              >
                {dayLabel(d)}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label={t("vibe")}>
            <Chip
              active={value.activity === null}
              onClick={() => onChange({ ...value, activity: null })}
            >
              {t("any")}
            </Chip>
            {ACTIVITY_TYPES.map((act) => (
              <Chip
                key={act}
                active={value.activity === act}
                onClick={() => onChange({ ...value, activity: act })}
              >
                {activityLabel(act)}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-foreground bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
