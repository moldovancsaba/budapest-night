"use client";

import { AGE_RANGES, DAY_TIME_TAGS, ACTIVITY_TYPES } from "@/data/providers";
import type { AgeRange, DayTimeTag } from "@/types/provider";
import { Badge, Chip, Group, Paper, Stack, Text } from "@mantine/core";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useDayTimeLabel,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { AppButton } from "@/components/gds/AppButton";
import { SlidersHorizontal } from "@/components/gds/icons";
import { useState } from "react";

export interface FilterState {
  ages: AgeRange[];
  times: DayTimeTag[];
  activity: string | null;
  englishFriendly: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  ages: [],
  times: [],
  activity: null,
  englishFriendly: false,
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
  const has =
    value.ages.length +
    value.times.length +
    (value.activity ? 1 : 0) +
    (value.englishFriendly ? 1 : 0);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <AppButton
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          leftSection={<SlidersHorizontal size={16} />}
        >
          {t("title")}
          {has > 0 && (
            <Badge radius="xl" variant="filled" color="brand" size="sm">
              {has}
            </Badge>
          )}
        </AppButton>
        {has > 0 && (
          <AppButton
            variant="subtle"
            size="compact-xs"
            color="gray"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            {t("clearAll")}
          </AppButton>
        )}
      </Group>

      {open && (
        <Paper withBorder radius="xl" p="lg">
          <Stack gap="md">
          <FilterGroup label={t("crowd")}>
            {AGE_RANGES.map((a) => (
              <Chip
                key={a}
                checked={value.ages.includes(a)}
                onChange={() => onChange({ ...value, ages: toggle(value.ages, a) })}
                radius="xl"
                color="brand"
                variant="filled"
                size="sm"
              >
                {ageLabel(a)}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label={t("dayTime")}>
            {DAY_TIME_TAGS.map((d) => (
              <Chip
                key={d}
                checked={value.times.includes(d)}
                onChange={() => onChange({ ...value, times: toggle(value.times, d) })}
                radius="xl"
                color="brand"
                variant="filled"
                size="sm"
              >
                {dayLabel(d)}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label={t("vibe")}>
            <Chip
              checked={value.activity === null}
              onChange={() => onChange({ ...value, activity: null })}
              radius="xl"
              color="brand"
              variant="filled"
              size="sm"
            >
              {t("any")}
            </Chip>
            {ACTIVITY_TYPES.map((act) => (
              <Chip
                key={act}
                checked={value.activity === act}
                onChange={() => onChange({ ...value, activity: act })}
                radius="xl"
                color="brand"
                variant="filled"
                size="sm"
              >
                {activityLabel(act)}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup label={t("access")}>
            <Chip
              checked={value.englishFriendly}
              onChange={() => onChange({ ...value, englishFriendly: !value.englishFriendly })}
              radius="xl"
              color="brand"
              variant="filled"
              size="sm"
            >
              {t("englishFriendly")}
            </Chip>
          </FilterGroup>
          </Stack>
        </Paper>
      )}
    </Stack>
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
    <Stack gap={8}>
      <Text size="10px" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.18em" }}>
        {label}
      </Text>
      <Group gap={6}>{children}</Group>
    </Stack>
  );
}
