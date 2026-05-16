"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
};

export function StarRatingInput({ value, onChange, label, disabled }: Props) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={cn(
            "rounded p-0.5 transition-colors",
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label={`${n}`}
          aria-pressed={value >= n}
        >
          <Star
            className={cn(
              "h-6 w-6",
              value >= n
                ? "fill-foreground text-foreground"
                : "fill-transparent text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}
