import { BOROUGHS } from "@/data/locations";
import type { Borough, BoroughChoice } from "@/types/provider";
import { cn } from "@/lib/utils";

export function BoroughBar({ value, onChange }: { value: BoroughChoice; onChange: (b: BoroughChoice) => void }) {
  const choices: BoroughChoice[] = ["All", ...BOROUGHS];
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">District</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((b) => {
          const active = value === b;
          const label = b === "All" ? "All" : b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => onChange(b)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-accent bg-accent text-accent-foreground neon-border"
                  : "border-border bg-card text-foreground hover:border-accent hover:text-accent",
              )}
              aria-pressed={active}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
