"use client";

import { BOROUGHS } from "@/data/locations";
import type { BoroughChoice } from "@/types/provider";
import { Chip, Group, Text } from "@mantine/core";
import { useDistrictLabel } from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";

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
      <Text mb={8} size="10px" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.18em" }}>
        {t("label")}
      </Text>
      <Group gap={8}>
        {choices.map((b) => {
          return (
            <Chip
              key={b}
              checked={value === b}
              onChange={() => onChange(b)}
              radius="xl"
              color="brand"
              variant="filled"
              size="md"
            >
              {districtLabel(b)}
            </Chip>
          );
        })}
      </Group>
    </div>
  );
}
