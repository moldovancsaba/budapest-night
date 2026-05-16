import { AGE_RANGES, DAY_TIME_TAGS, ACTIVITY_TYPES } from "@/data/providers";
import type { AgeRange, DayTimeTag } from "@/types/provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

export interface FilterState {
  ages: AgeRange[];
  times: DayTimeTag[];
  activity: string | null;
}

export const EMPTY_FILTERS: FilterState = { ages: [], times: [], activity: null };

export function Filters({ value, onChange }: { value: FilterState; onChange: (v: FilterState) => void }) {
  const [open, setOpen] = useState(false);
  const has = value.ages.length + value.times.length + (value.activity ? 1 : 0);

  const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

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
          Filters {has > 0 && <span className="rounded-full bg-teal px-1.5 text-[11px] text-teal-foreground">{has}</span>}
        </Button>
        {has > 0 && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card animate-fade-in">
          <FilterGroup label="Age">
            {AGE_RANGES.map((a) => (
              <Chip key={a} active={value.ages.includes(a)} onClick={() => onChange({ ...value, ages: toggle(value.ages, a) })}>
                {a}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Day & time">
            {DAY_TIME_TAGS.map((d) => (
              <Chip key={d} active={value.times.includes(d)} onClick={() => onChange({ ...value, times: toggle(value.times, d) })}>
                {d}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Activity">
            <Chip active={value.activity === null} onClick={() => onChange({ ...value, activity: null })}>
              Any
            </Chip>
            {ACTIVITY_TYPES.map((t) => (
              <Chip key={t} active={value.activity === t} onClick={() => onChange({ ...value, activity: t })}>
                {t}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-teal bg-teal text-teal-foreground" : "border-border bg-card text-foreground hover:border-teal hover:text-teal",
      )}
    >
      {children}
    </button>
  );
}
