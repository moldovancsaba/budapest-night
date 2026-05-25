"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Sparkles } from "@/components/gds/icons";
import {
  Box,
  Grid,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { EventCard } from "../EventCard";
import { EmptyState } from "../EmptyState";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { Borough, BoroughChoice } from "@/types/provider";
import { useEventsCatalog, useNeighborhoodsCatalog } from "@/hooks/useCatalog";
import { BAKED_EVENTS_LISTING_HERO } from "@/config/defaultMedia";
import { useTranslations } from "next-intl";
import {
  useDistrictLabel,
  useNeighborhoodLabel,
} from "@/hooks/useVenueDisplay";

interface Props {
  onOpen: (e: PublicNightEvent) => void;
  initialBorough?: BoroughChoice | null;
  initialNeighborhood?: string | null;
}

export function EventsView({
  onOpen,
  initialBorough,
  initialNeighborhood,
}: Props) {
  const t = useTranslations("timedEvents");
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const [borough, setBorough] = useState<BoroughChoice>(initialBorough ?? "All");
  const [neighborhood, setNeighborhood] = useState<string | null>(() => {
    const b = initialBorough ?? "All";
    return b === "All" ? null : (initialNeighborhood ?? null);
  });

  useEffect(() => {
    const b = initialBorough ?? "All";
    setBorough(b);
    setNeighborhood(b === "All" ? null : (initialNeighborhood ?? null));
  }, [initialBorough, initialNeighborhood]);

  const { data: events = [], isLoading, isError } = useEventsCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();

  const hoodOptions = useMemo(() => {
    if (borough === "All") return [];
    if (neighborhoodsMap?.[borough as Borough])
      return neighborhoodsMap[borough as Borough]!;
    return FALLBACK_HOODS[borough as Borough] ?? [];
  }, [borough, neighborhoodsMap]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => (borough === "All" ? true : e.borough === borough))
      .filter((e) => (neighborhood ? e.neighborhood === neighborhood : true));
  }, [events, borough, neighborhood]);

  const featured = useMemo(
    () =>
      filtered
        .filter(
          (e) =>
            e.badges.includes("Featured") || e.badges.includes("Staff Pick"),
        )
        .slice(0, 3),
    [filtered],
  );

  if (isLoading) {
    return (
      <Stack align="center" justify="center" gap="sm" py={96}>
        <Loader color="gray" />
        <Text size="sm" c="dimmed">
          {t("loading")}
        </Text>
      </Stack>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={t("loadErrorTitle")}
        message={t("loadErrorMessage")}
      />
    );
  }

  return (
    <Stack gap="xl">
      <Paper radius="xl" withBorder style={{ overflow: "hidden" }}>
        <Grid gutter="xl" p={{ base: "xl", sm: 40 }}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.2em">
              {t("eyebrow")}
            </Text>
            <Title order={1} mt="sm" size="h1" tt="uppercase" lts="0.02em" lh={1.1}>
              {t("title")}
            </Title>
            <Text c="dimmed" mt="md" maw={420} size="sm">
              {t("subtitle")}
            </Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }} display={{ base: "none", md: "block" }}>
            <Box
              pos="relative"
              h={176}
              maw={400}
              ml="auto"
              style={{ overflow: "hidden", borderRadius: "var(--mantine-radius-xl)" }}
            >
              <ResolvedCoverImage src={BAKED_EVENTS_LISTING_HERO} alt={t("heroAlt")} />
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>

      <Stack gap="md">
        <BoroughBar
          value={borough}
          onChange={(b) => {
            setBorough(b);
            setNeighborhood(null);
          }}
        />
        {borough !== "All" && (
          <NeighborhoodChips
            options={hoodOptions}
            value={neighborhood}
            onChange={setNeighborhood}
          />
        )}
      </Stack>

      {featured.length > 0 && (
        <Stack gap="md">
          <Group gap="xs">
            <Sparkles size={16} />
            <Title order={2} size="h4" tt="uppercase" lts="0.04em">
              {t("featured")}
            </Title>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {featured.map((e) => (
              <EventCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </SimpleGrid>
        </Stack>
      )}

      <Stack gap="md">
        <Title order={2} size="h4" tt="uppercase" lts="0.04em">
          {borough !== "All"
            ? t("resultsIn", {
                count: filtered.length,
                district: districtLabel(borough),
              })
            : t("results", { count: filtered.length })}
          {neighborhood ? ` · ${neighborhoodLabel(neighborhood)}` : ""}
        </Title>
        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("noMatches")}
            message={t("noMatchesHint")}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Stack>
  );
}
