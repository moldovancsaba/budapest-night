import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
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
import { MeetupGroupCard } from "../MeetupGroupCard";
import { EmptyState } from "../EmptyState";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { BoroughChoice } from "@/types/provider";
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import { MapPin, Users } from "@/components/gds/icons";
import {
  useMeetupGroupsCatalog,
  useNeighborhoodsCatalog,
  useSiteCatalog,
} from "@/hooks/useCatalog";
import {
  useDistrictLabel,
  useNeighborhoodLabel,
} from "@/hooks/useVenueDisplay";
import { cultureDiscoverHero } from "@/config/defaultMedia";

interface Props {
  onOpen: (g: PublicMeetupGroup) => void;
  onShare: (g: PublicMeetupGroup) => void;
}

export function MeetupGroupsView({ onOpen, onShare }: Props) {
  const t = useTranslations("meetup");
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const [borough, setBorough] = useState<BoroughChoice>("All");
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const { data: groups = [], isLoading, isError } = useMeetupGroupsCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();
  const { data: site } = useSiteCatalog();

  const hoodOptions = useMemo(() => {
    if (borough === "All") return [];
    if (neighborhoodsMap?.[borough]) return neighborhoodsMap[borough];
    return FALLBACK_HOODS[borough] ?? [];
  }, [borough, neighborhoodsMap]);

  const filtered = useMemo(
    () =>
      groups
        .filter((g) => (borough === "All" ? true : g.borough === borough))
        .filter((g) => (neighborhood ? g.neighborhood === neighborhood : true)),
    [groups, borough, neighborhood],
  );

  const listTitle = neighborhood
    ? t("listInNeighborhood", { place: neighborhoodLabel(neighborhood) })
    : borough === "All"
      ? t("listAll")
      : t("listInDistrict", { district: districtLabel(borough) });

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

  if (isError || groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("seedEmptyTitle")}
        message={t("seedEmptyMessage")}
      />
    );
  }

  return (
    <Stack gap="xl">
      <Paper radius="xl" withBorder style={{ overflow: "hidden" }}>
        <Grid gutter="xl" p={{ base: "xl", sm: 40 }}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.2em">
              {t("pageEyebrow")}
            </Text>
            <Title order={1} mt="sm" size="h1" tt="uppercase" lts="0.02em" lh={1.1}>
              {t("heroTitleLine1")}
              <br />
              {t("heroTitleLine2")}
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
              <ResolvedCoverImage
                src={cultureDiscoverHero(site?.cultureHeroUrl)}
                alt={t("heroImageAlt")}
              />
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

      <Stack gap="md">
        <Group justify="space-between" align="baseline">
          <Title order={2} size="h3" tt="uppercase" lts="0.04em">
            {listTitle}
          </Title>
          <Text size="sm" c="dimmed">
            {t("groupCount", { count: filtered.length })}
          </Text>
        </Group>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("filterEmptyTitle")}
            message={t("filterEmptyMessage")}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
            {filtered.map((g) => (
              <MeetupGroupCard
                key={g.id}
                group={g}
                onOpen={onOpen}
                onShare={onShare}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Stack>
  );
}
