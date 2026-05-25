"use client";

import { Group, UnstyledButton } from "@mantine/core";
import { Star } from "@/components/gds/icons";

type Props = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  disabled?: boolean;
};

export function StarRatingInput({ value, onChange, label, disabled }: Props) {
  return (
    <Group gap={4} role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <UnstyledButton
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          aria-label={`${n}`}
          aria-pressed={value >= n}
          style={{ opacity: disabled ? 0.5 : 1, lineHeight: 0 }}
        >
          <Star
            size={24}
            stroke={1.5}
            fill={value >= n ? "var(--mantine-color-text)" : "transparent"}
            color={value >= n ? "var(--mantine-color-text)" : "var(--mantine-color-dimmed)"}
          />
        </UnstyledButton>
      ))}
    </Group>
  );
}
