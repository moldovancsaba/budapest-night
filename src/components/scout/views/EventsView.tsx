"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "@/components/gds/icons";
import { BrowseSurface } from "@/components/gds";
import { Box, Group, SimpleGrid, Stack, Title } from "@mantine/core";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { EventCard } from "../EventCard";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import { BOROUGHS } from "@/data/locations";
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

  const activeFilters = useMemo(() => {
    const chips = [];
    if (borough !== "All") {
      chips.push({
        id: "borough",
        label: districtLabel(borough),
        onRemove: () => {
          setBorough("All");
          setNeighborhood(null);
        },
      });
    }
    if (neighborhood) {
      chips.push({
        id: "neighborhood",
        label: neighborhoodLabel(neighborhood),
        onRemove: () => setNeighborhood(null),
      });
    }
    return chips;
  }, [borough, neighborhood, districtLabel, neighborhoodLabel]);

  const scopeOptions = useMemo(
    () => [
      {
        id: "all",
        label: districtLabel("All"),
        active: borough === "All",
        onSelect: () => {
          setBorough("All");
          setNeighborhood(null);
        },
      },
      ...BOROUGHS.map((b) => ({
        id: b,
        label: districtLabel(b),
        active: borough === b,
        onSelect: () => {
          setBorough(b);
          setNeighborhood(null);
        },
      })),
    ],
    [borough, districtLabel],
  );

  return (
    <BrowseSurface
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("subtitle")}
      resultCount={filtered.length}
      resultLabel={t("eventsResultLabel")}
      activeFilters={activeFilters}
      scopeOptions={scopeOptions}
      scopeLabel={t("districtScope")}
      locationControls={
        borough !== "All" ? (
          <NeighborhoodChips
            options={hoodOptions}
            value={neighborhood}
            onChange={setNeighborhood}
          />
        ) : null
      }
      loading={isLoading}
      loadingTitle={t("loading")}
      error={isError ? t("loadErrorMessage") : undefined}
      errorTitle={t("loadErrorTitle")}
      empty={!isLoading && !isError && filtered.length === 0}
      emptyTitle={t("noMatches")}
      emptyDescription={t("noMatchesHint")}
      content={
        <Stack gap="xl">
          <Box
            pos="relative"
            h={176}
            maw={480}
            display={{ base: "block", md: "none" }}
            style={{ overflow: "hidden", borderRadius: "var(--mantine-radius-xl)" }}
          >
            <ResolvedCoverImage src={BAKED_EVENTS_LISTING_HERO} alt={t("heroAlt")} />
          </Box>

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

          {filtered.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {filtered.map((e) => (
                <EventCard key={e.id} event={e} onOpen={onOpen} />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      }
    />
  );
}
