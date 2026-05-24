import { useEffect, useMemo, useState } from "react";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { Filters, EMPTY_FILTERS, type FilterState } from "../Filters";
import { ProviderCard } from "../ProviderCard";
import { EmptyState } from "../EmptyState";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { BoroughChoice, Provider, Category } from "@/types/provider";
import { MapPin, Sparkles } from "lucide-react";
import {
  useProvidersCatalog,
  useNeighborhoodsCatalog,
  useSiteCatalog,
} from "@/hooks/useCatalog";
import { useTranslations } from "next-intl";
import {
  useCategoryLabel,
  useDistrictLabel,
  useNeighborhoodLabel,
} from "@/hooks/useVenueDisplay";
import { useDiscoverChrome } from "@/hooks/useLocalizedSiteCopy";
import { discoverHeroForCategory } from "@/config/defaultMedia";
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

interface Props {
  category: Category;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
  initialBorough?: BoroughChoice | null;
  initialNeighborhood?: string | null;
}

export function DiscoverView({
  category,
  onOpen,
  onShare,
  initialBorough,
  initialNeighborhood,
}: Props) {
  const t = useTranslations("discover");
  const categoryLabel = useCategoryLabel();
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const [borough, setBorough] = useState<BoroughChoice>(initialBorough ?? "All");
  const [neighborhood, setNeighborhood] = useState<string | null>(() => {
    const b = initialBorough ?? "All";
    return b === "All" ? null : (initialNeighborhood ?? null);
  });
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  useEffect(() => {
    const b = initialBorough ?? "All";
    setBorough(b);
    setNeighborhood(b === "All" ? null : (initialNeighborhood ?? null));
  }, [category, initialBorough, initialNeighborhood]);

  const {
    data: providers = [],
    isLoading: loadP,
    isError: errP,
  } = useProvidersCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();
  const { data: site } = useSiteCatalog();
  const discoverChrome = useDiscoverChrome();
  const heroSrc = discoverHeroForCategory(
    category,
    site?.discoverHeroByCategory?.[category],
  );

  const hoodOptions = useMemo(() => {
    if (borough === "All") return [];
    if (neighborhoodsMap?.[borough]) return neighborhoodsMap[borough];
    return FALLBACK_HOODS[borough] ?? [];
  }, [borough, neighborhoodsMap]);

  const filtered = useMemo(() => {
    return providers
      .filter((p) => p.category === category)
      .filter((p) => (borough === "All" ? true : p.borough === borough))
      .filter((p) => (neighborhood ? p.neighborhood === neighborhood : true))
      .filter((p) =>
        filters.ages.length ? p.ageRanges.some((a) => filters.ages.includes(a)) : true,
      )
      .filter((p) =>
        filters.times.length ? p.dayTimeTags.some((t) => filters.times.includes(t)) : true,
      )
      .filter((p) =>
        filters.activity ? p.activityTypes.includes(filters.activity) : true,
      )
      .filter((p) => (filters.englishFriendly ? Boolean(p.englishFriendly) : true))
      .sort((a, b) => {
        const ap = a.isPromoted ? 0 : 1;
        const bp = b.isPromoted ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return a.name.localeCompare(b.name);
      });
  }, [providers, category, borough, neighborhood, filters]);

  const featured = useMemo(
    () =>
      filtered
        .filter(
          (p) =>
            p.badges.includes("Featured") || p.badges.includes("Staff Pick"),
        )
        .slice(0, 3),
    [filtered],
  );

  if (loadP) {
    return (
      <Stack align="center" justify="center" gap="sm" py={96}>
        <Loader color="gray" />
        <Text size="sm" c="dimmed">
          {t("loading")}
        </Text>
      </Stack>
    );
  }

  if (errP) {
    return (
      <EmptyState
        icon={MapPin}
        title={t("loadErrorTitle")}
        message={t("loadErrorMessage")}
      />
    );
  }

  if (providers.length === 0) {
    return <EmptyState icon={MapPin} title={t("noDb")} message={t("noDbHint")} />;
  }

  return (
    <Stack gap="xl">
      <Paper radius="xl" withBorder style={{ overflow: "hidden" }}>
        <Grid gutter="xl" p={{ base: "xl", sm: 40 }}>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.2em">
              {discoverChrome.eyebrow}
            </Text>
            <Title order={1} mt="sm" size="h1" tt="uppercase" lts="0.02em" lh={1.1}>
              {t("title", { category: categoryLabel(category) })}
            </Title>
            <Text c="dimmed" mt="md" maw={420} size="sm">
              {t("findByArea", { blurb: t(`blurb.${category}`) })}{" "}
              {discoverChrome.tagline}
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
              <ResolvedCoverImage src={heroSrc} alt={t(`heroAlt.${category}`)} />
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
        <Filters value={filters} onChange={setFilters} />
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
            {featured.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onOpen={onOpen}
                onShare={onShare}
              />
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
            {filtered.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
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
