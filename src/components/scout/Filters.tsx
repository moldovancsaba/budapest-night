"use client";

import { AGE_RANGES, DAY_TIME_TAGS, ACTIVITY_TYPES } from "@/data/providers";
import type { AgeRange, DayTimeTag } from "@/types/provider";
import { Badge, Chip, Group, Stack, Text } from "@mantine/core";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useDayTimeLabel,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { DataToolbar, FilterDrawer, SemanticButton } from "@/components/gds";
import { useMemo, useState } from "react";
import type { DataToolbarFilterChip } from "@gds/core/client";

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
  const activeCount =
    value.ages.length +
    value.times.length +
    (value.activity ? 1 : 0) +
    (value.englishFriendly ? 1 : 0);

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const activeFilters: DataToolbarFilterChip[] = useMemo(() => {
    const chips: DataToolbarFilterChip[] = [];
    for (const age of value.ages) {
      chips.push({
        label: ageLabel(age),
        onRemove: () => onChange({ ...value, ages: value.ages.filter((a) => a !== age) }),
      });
    }
    for (const time of value.times) {
      chips.push({
        label: dayLabel(time),
        onRemove: () => onChange({ ...value, times: value.times.filter((d) => d !== time) }),
      });
    }
    if (value.activity) {
      chips.push({
        label: activityLabel(value.activity),
        onRemove: () => onChange({ ...value, activity: null }),
      });
    }
    if (value.englishFriendly) {
      chips.push({
        label: t("englishFriendly"),
        onRemove: () => onChange({ ...value, englishFriendly: false }),
      });
    }
    return chips;
  }, [value, onChange, ageLabel, dayLabel, activityLabel, t]);

  const filterBody = (
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
  );

  return (
    <>
      <DataToolbar
        filterSlot={
          <SemanticButton
            action="filter"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            rightSection={
              activeCount > 0 ? (
                <Badge radius="xl" variant="filled" color="brand" size="sm">
                  {activeCount}
                </Badge>
              ) : undefined
            }
          />
        }
        resetAction={
          activeCount > 0 ? (
            <SemanticButton
              action="clear"
              variant="subtle"
              size="compact-xs"
              color="gray"
              onClick={() => onChange(EMPTY_FILTERS)}
            />
          ) : undefined
        }
        activeFilters={activeFilters}
      />

      <FilterDrawer
        opened={open}
        onClose={() => setOpen(false)}
        title={t("title")}
        secondaryAction={
          activeCount > 0 ? (
            <SemanticButton
              action="clear"
              variant="subtle"
              onClick={() => onChange(EMPTY_FILTERS)}
            />
          ) : undefined
        }
        primaryAction={
          <SemanticButton action="confirm" onClick={() => setOpen(false)} />
        }
      >
        {filterBody}
      </FilterDrawer>
    </>
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
