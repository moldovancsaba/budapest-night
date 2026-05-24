"use client";

import { Chip, Group, Text } from "@mantine/core";
import { useNeighborhoodLabel } from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";

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
      <Text mb={8} size="10px" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.18em" }}>
        {t("label")}
      </Text>
      <Group gap={8}>
        <Chip
          checked={value === null}
          onChange={() => onChange(null)}
          radius="xl"
          color="brand"
          variant="filled"
          size="md"
        >
          {t("all")}
        </Chip>
        {options.map((n) => {
          return (
            <Chip
              key={n}
              checked={value === n}
              onChange={() => onChange(n)}
              radius="xl"
              color="brand"
              variant="filled"
              size="md"
            >
              {neighborhoodLabel(n)}
            </Chip>
          );
        })}
      </Group>
    </div>
  );
}
