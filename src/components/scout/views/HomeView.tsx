import { useState } from "react";
import {
  CalendarDays,
  PartyPopper,
  UtensilsCrossed,
  Coffee,
  Palette,
  Sparkles,
  Users,
  ArrowRight,
  Star,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { BoroughChoice, Category, Provider } from "@/types/provider";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { PROGRAM_VERTICALS } from "@/lib/programVerticals";
import {
  useCategoryLabel,
  useDistrictLabel,
  useNeighborhoodLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import {
  useHomeCopy,
  useTrustPillars,
  type HomeCopy,
} from "@/hooks/useLocalizedSiteCopy";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useFormatVenuePrice,
} from "@/hooks/useVenueDisplay";
import type { MeetupGroup } from "@/types/meetup";
import type { SiteDoc, SiteGuide, SiteGuideNavigateTo } from "@/types/site";
import { DEFAULT_SITE } from "@/types/site";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { Link } from "@/i18n/routing";
import { buildProgramPath } from "@/lib/appPaths";
import { cacheBustMediaUrl } from "@/lib/siteMedia";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { SiteLucideIcon } from "@/lib/siteLucideIcon";
import {
  useProvidersCatalog,
  useMeetupGroupsCatalog,
  useSiteCatalog,
  useNeighborhoodsCatalog,
  useEventsCatalog,
} from "@/hooks/useCatalog";
import { EventCard } from "@/components/scout/EventCard";
import { isUpcoming } from "@/lib/eventDisplay";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { BOROUGHS, NEIGHBORHOODS } from "@/data/locations";
import { AppButton } from "@/components/mantine/AppButton";
import {
  Badge,
  Box,
  Card,
  Chip,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
} from "@mantine/core";

const HOME_BOROUGH_CHOICES: BoroughChoice[] = ["All", ...BOROUGHS];

function openMarketingLink(href: string | undefined, inApp: () => void) {
  const h = (href ?? "").trim();
  if (!h) {
    inApp();
    return;
  }
  if (h.startsWith("http://") || h.startsWith("https://")) {
    window.open(h, "_blank", "noopener,noreferrer");
    return;
  }
  if (h.startsWith("#")) {
    window.location.hash = h;
    return;
  }
  window.location.assign(h.startsWith("/") ? h : `/${h}`);
}

const CATEGORY_TILES: {
  key: Category | "Events" | "Meet-Up Groups";
  icon: LucideIcon;
  descKey: keyof HomeCopy["categories"];
}[] = [
  { key: "Events", icon: CalendarDays, descKey: "events" },
  { key: "Venues", icon: Building2, descKey: "venues" },
  { key: "Parties", icon: PartyPopper, descKey: "parties" },
  { key: "Restaurants", icon: UtensilsCrossed, descKey: "restaurants" },
  { key: "Cafés", icon: Coffee, descKey: "cafes" },
  { key: "Meet-Up Groups", icon: Palette, descKey: "culture" },
];

const GUIDE_NAV_BY_ID: Record<string, SiteGuideNavigateTo> = {
  "guide-belvaros": "Eat & Drink",
  "guide-jewish-quarter": "Parties",
  "guide-andrassy": "Cafés",
  "guide-buda": "Venues",
};

function resolveGuideNavigateTo(g: SiteGuide): SiteGuideNavigateTo {
  if (g.navigateTo) return g.navigateTo;
  if (g.id && GUIDE_NAV_BY_ID[g.id]) return GUIDE_NAV_BY_ID[g.id];
  return "Venues";
}

type HomeNavigateView =
  | Category
  | "Events"
  | "Saved"
  | "Calculator"
  | "Meet-Up Groups"
  | "Eat & Drink"
  | "Program";

interface Props {
  onNavigate: (
    view: HomeNavigateView,
    location?: { borough?: BoroughChoice; neighborhood?: string },
  ) => void;
  onOpenProvider: (p: Provider) => void;
  onOpenGroup: (g: MeetupGroup) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
}

export function HomeView({ onNavigate, onOpenProvider, onOpenGroup, onOpenEvent }: Props) {
  const locale = useLocale() as AppLocale;
  const tProgram = useTranslations("program");
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const locationLine = useVenueLocationLine();
  const tNav = useTranslations("nav");
  const categoryLabel = useCategoryLabel();
  const home = useHomeCopy();
  const trustPillars = useTrustPillars();
  const [borough, setBorough] = useState<BoroughChoice>("All");
  const { data: providers = [] } = useProvidersCatalog();
  const { data: events = [] } = useEventsCatalog();
  const { data: meetups = [] } = useMeetupGroupsCatalog();
  const { data: siteData } = useSiteCatalog();
  const { data: locationsByBorough } = useNeighborhoodsCatalog();
  const s = siteData ?? ({ _id: "main", ...DEFAULT_SITE } as SiteDoc);
  const hoodList =
    borough === "All"
      ? []
      : (locationsByBorough?.[borough] ?? NEIGHBORHOODS[borough]);

  const popularPicks = s.homePopularPickProviderNames
    .map((name) => providers.find((p) => p.name === name))
    .filter((p): p is Provider => !!p);

  const promotedPartners = providers.filter((p) => p.isPromoted).slice(0, 6);
  const featuredHomeEvents = events
    .filter((e) => e.isFeatured && isUpcoming(e))
    .slice(0, 8);

  const popularGroup = s.homePopularMeetupGroupId.trim()
    ? meetups.find((g) => g.id === s.homePopularMeetupGroupId.trim())
    : undefined;

  const scrollToNeighborhoods = () => {
    document
      .getElementById("home-neighborhoods")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Stack gap={64}>
      <Paper radius="xl" withBorder style={{ overflow: "hidden" }}>
        <Grid gutter="xl" p={{ base: "xl", sm: 48, md: 64 }} align="center">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Title order={1} size="h1" lh={1.05} tt="uppercase" lts="0.02em">
              {home.heroTitle}
            </Title>
            <Text mt="lg" maw={480} size="lg" c="dimmed" lh={1.6}>
              {home.heroSubtitle}
            </Text>
            <Group mt="xl" gap="sm" wrap="wrap">
              <AppButton
                size="lg"
                radius="xl"
                onClick={() => onNavigate("Events")}
                rightSection={<ArrowRight size={16} />}
              >
                {home.heroPrimaryCta}
              </AppButton>
              <AppButton size="lg" variant="outline" radius="xl" onClick={scrollToNeighborhoods}>
                {home.heroSecondaryCta}
              </AppButton>
              <AppButton
                component={Link}
                href={buildProgramPath(undefined, { locale })}
                size="lg"
                variant="outline"
                radius="xl"
              >
                {tProgram("heroCta")}
              </AppButton>
            </Group>
            <Text mt="md" size="sm" fw={500} c="brand">
              {tProgram("thuNote")}
            </Text>
            <Group mt="md" gap="xs">
              <ThemeIcon radius="xl" size="md" variant="light" color="gray">
                <Sparkles size={14} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                {home.heroTagline}
              </Text>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box
              pos="relative"
              style={{ aspectRatio: "5/4", overflow: "hidden", borderRadius: "var(--mantine-radius-xl)" }}
            >
              <ResolvedCoverImage src={cacheBustMediaUrl(s.homeHeroUrl)} alt={home.heroImageAlt} />
            </Box>
          </Grid.Col>
        </Grid>
      </Paper>

      <Stack gap="md" align="center">
        <Title order={2} size="h2" ta="center" tt="uppercase" lts="0.04em">
          {tProgram("verticalsTitle")}
        </Title>
        <Group gap="xs" justify="center">
          {PROGRAM_VERTICALS.map((v) => (
            <AppButton
              key={v.id}
              component={Link}
              href={buildProgramPath(v.id, { locale })}
              variant="outline"
              radius="xl"
            >
              {tProgram(`vertical.${v.id}`)}
            </AppButton>
          ))}
        </Group>
      </Stack>

      {featuredHomeEvents.length > 0 && (
        <Stack gap="md">
          <Title order={2} size="h2" ta="center" tt="uppercase" lts="0.04em">
            {tProgram("featuredEvents")}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {featuredHomeEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
            ))}
          </SimpleGrid>
        </Stack>
      )}

      {promotedPartners.length > 0 && (
        <Stack gap="md">
          <Title order={2} size="h2" ta="center" tt="uppercase" lts="0.04em">
            {tProgram("promotedTitle")}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {promotedPartners.map((p) => (
              <UnstyledButton key={p.id} onClick={() => onOpenProvider(p)} w="100%">
                <Paper radius="xl" withBorder p="md" style={{ borderColor: "var(--mantine-color-brand-4)" }}>
                  <Text fw={600}>{p.name}</Text>
                  {p.promotionLabel ? (
                    <Stack gap={2} mt={4}>
                      <Text size="xs" fw={500} c="brand">
                        {p.promotionLabel}
                      </Text>
                      <Text size="10px" c="dimmed">
                        {tProgram("adDisclosure")}
                      </Text>
                    </Stack>
                  ) : null}
                </Paper>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </Stack>
      )}

      <Stack gap="lg">
        <Title order={2} size="h1" ta="center" tt="uppercase" lts="0.04em">
          {home.categoriesTitle}
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md">
          {CATEGORY_TILES.map(({ key, icon: Icon, descKey }) => (
            <UnstyledButton
              key={key}
              onClick={() =>
                onNavigate(
                  key === "Meet-Up Groups"
                    ? "Meet-Up Groups"
                    : key === "Events"
                      ? "Events"
                      : (key as Category),
                )
              }
              w="100%"
            >
              <Paper radius="xl" withBorder p="xl" ta="center">
                <ThemeIcon size={64} radius="xl" variant="light" color="gray" mx="auto">
                  <Icon size={28} />
                </ThemeIcon>
                <Title order={3} size="h5" mt="md">
                  {key === "Meet-Up Groups"
                    ? tNav("culture")
                    : key === "Events"
                      ? tNav("events")
                      : categoryLabel(key as Category)}
                </Title>
                <Text size="sm" c="dimmed" mt="sm" lh={1.5}>
                  {home.categories[descKey].description}
                </Text>
                <Group gap={4} justify="center" mt="md">
                  <Text size="sm" fw={600} c="brand">
                    {home.exploreCta}
                  </Text>
                  <ArrowRight size={14} />
                </Group>
              </Paper>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </Stack>

      <Paper
        id="home-neighborhoods"
        radius="xl"
        withBorder
        px={{ base: "lg", sm: 48 }}
        py={{ base: "xl", sm: 56 }}
        pos="relative"
        style={{ overflow: "hidden" }}
      >
        <Building2
          size={128}
          style={{
            position: "absolute",
            left: -16,
            top: 24,
            opacity: 0.04,
            pointerEvents: "none",
          }}
          aria-hidden
        />
        <Building2
          size={128}
          style={{
            position: "absolute",
            right: -16,
            bottom: 24,
            opacity: 0.04,
            pointerEvents: "none",
          }}
          aria-hidden
        />
        <Stack gap="md" align="center">
          <Title order={2} size="h2" ta="center" tt="uppercase" lts="0.04em">
            {home.neighborhoodSectionTitle}
          </Title>
          <Group gap="xs" justify="center">
            {HOME_BOROUGH_CHOICES.map((b) => (
              <Chip
                key={b}
                checked={b === borough}
                onChange={() => setBorough(b)}
                radius="xl"
                color="brand"
                variant="filled"
                size="md"
              >
                {districtLabel(b)}
              </Chip>
            ))}
          </Group>
          <Text size="sm" fw={500} c="dimmed" ta="center">
            {borough === "All"
              ? home.allDistrictsHint
              : home.popularNeighborhoodsCaption
                  .replace(/\{district\}/g, districtLabel(borough))
                  .replace(/\{borough\}/g, districtLabel(borough))}
          </Text>
          <Group gap="xs" justify="center">
            {borough === "All" ? (
              <AppButton
                size="sm"
                variant="outline"
                radius="xl"
                onClick={() => onNavigate("Events", { borough: "All" })}
              >
                {home.openDiscoverAll}
              </AppButton>
            ) : (
              <>
                {hoodList.map((n) => (
                  <AppButton
                    key={n}
                    size="sm"
                    variant="outline"
                    radius="xl"
                    onClick={() => onNavigate("Events", { borough, neighborhood: n })}
                  >
                    {neighborhoodLabel(n)}
                  </AppButton>
                ))}
                <AppButton
                  size="sm"
                  variant="outline"
                  radius="xl"
                  onClick={() => onNavigate("Events", { borough })}
                >
                  {home.viewAllNeighborhoods}
                </AppButton>
              </>
            )}
          </Group>
        </Stack>
      </Paper>

      {home.guides.length > 0 && (
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <Title order={2} size="h2" tt="uppercase" lts="0.04em">
              {home.guidesSectionTitle}
            </Title>
            <Box visibleFrom="sm">
              <UnstyledButton
                onClick={() =>
                  openMarketingLink(s.guidesViewAllHref, () => {
                    onNavigate("Venues");
                  })
                }
              >
                <Group gap={4}>
                  <Text size="sm" fw={600}>
                    {home.guidesViewAllLabel}
                  </Text>
                  <ArrowRight size={14} />
                </Group>
              </UnstyledButton>
            </Box>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {home.guides.map((g) => (
              <UnstyledButton
                key={g.id ?? g.title}
                onClick={() =>
                  openMarketingLink(g.ctaHref, () => {
                    const target = resolveGuideNavigateTo(g);
                    const location =
                      target === "Eat & Drink" || target === "Meet-Up Groups"
                        ? undefined
                        : { borough: g.borough, neighborhood: g.neighborhood };
                    onNavigate(target, location);
                  })
                }
                w="100%"
              >
                <Card radius="xl" p={0} withBorder>
                  <Card.Section>
                    <Box pos="relative" h={144}>
                      <ResolvedCoverImage src={g.imageUrl} alt={g.title} />
                      <ThemeIcon
                        pos="absolute"
                        bottom={-16}
                        left={16}
                        size="lg"
                        radius="xl"
                        variant="light"
                        color="gray"
                        style={{ border: "2px solid var(--mantine-color-body)" }}
                      >
                        <Building2 size={16} />
                      </ThemeIcon>
                    </Box>
                  </Card.Section>
                  <Stack gap="xs" p="lg" pt={28}>
                    <Title order={3} size="h5" lh={1.3}>
                      {g.title}
                    </Title>
                    <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                      {g.desc}
                    </Text>
                    <Group gap={4}>
                      <Text size="sm" fw={600} c="brand">
                        {g.ctaLabel?.trim() || home.guideCtaDefault}
                      </Text>
                      <ArrowRight size={14} />
                    </Group>
                  </Stack>
                </Card>
              </UnstyledButton>
            ))}
          </SimpleGrid>
        </Stack>
      )}

      <Stack gap="lg">
        <Title order={2} size="h2" ta="center" tt="uppercase" lts="0.04em">
          {home.howItWorksSectionTitle}
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {home.howItWorksSteps.map((step) => (
            <Paper key={step.step} radius="xl" withBorder p="lg">
              <Group align="flex-start" wrap="nowrap" gap="md">
                <ThemeIcon size="lg" radius="xl" variant="light" color="gray">
                  <Text size="sm" fw={700}>
                    {step.step}
                  </Text>
                </ThemeIcon>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group justify="space-between" wrap="nowrap">
                    <Title order={3} size="h6">
                      {step.title}
                    </Title>
                    <SiteLucideIcon name={step.icon} />
                  </Group>
                  <Text size="sm" c="dimmed">
                    {step.desc}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>

      <Paper radius="xl" withBorder px={{ base: "lg", sm: 40 }} py="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {trustPillars.map((pillar) => (
            <Group key={pillar.title} align="flex-start" wrap="nowrap" gap="sm">
              <ThemeIcon size="lg" radius="xl" variant="light" color="gray">
                <SiteLucideIcon name={pillar.icon} />
              </ThemeIcon>
              <Stack gap={4}>
                <Text size="sm" fw={600}>
                  {pillar.title}
                </Text>
                <Text size="xs" c="dimmed" lh={1.5}>
                  {pillar.desc}
                </Text>
              </Stack>
            </Group>
          ))}
        </SimpleGrid>
      </Paper>

      {(popularPicks.length > 0 || popularGroup) && (
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <Title order={2} size="h2" tt="uppercase" lts="0.04em">
              {home.popularPicksSectionTitle}
            </Title>
            <UnstyledButton onClick={() => onNavigate("Events")}>
              <Group gap={4}>
                <Text size="sm" fw={600}>
                  {home.popularPicksViewAllLabel}
                </Text>
                <ArrowRight size={14} />
              </Group>
            </UnstyledButton>
          </Group>
          <ScrollArea type="auto" offsetScrollbars>
            <Group gap="md" wrap="nowrap" pb="xs">
              {popularPicks.map((p) => (
                <PreviewCard key={p.id} provider={p} onOpen={onOpenProvider} />
              ))}
              {popularGroup && (
                <UnstyledButton onClick={() => onOpenGroup(popularGroup)} style={{ width: 256, flexShrink: 0 }}>
                  <Card radius="xl" p={0} withBorder w={256}>
                    <Card.Section>
                      <Box pos="relative" h={128} bg="gray.1">
                        <Group justify="center" align="center" h="100%">
                          <Users size={40} />
                        </Group>
                        <Badge
                          pos="absolute"
                          top={8}
                          left={8}
                          radius="xl"
                          color="brand"
                          tt="uppercase"
                          size="xs"
                        >
                          {home.culturePickBadge}
                        </Badge>
                      </Box>
                    </Card.Section>
                    <Stack gap={4} p="sm">
                      <Text fw={600} size="sm" lineClamp={1}>
                        {popularGroup.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {locationLine(popularGroup.borough, popularGroup.neighborhood)}
                      </Text>
                      <Text size="11px" c="dimmed">
                        {popularGroup.ageRange} · {home.cultureCircleLabel}
                      </Text>
                      <Text size="sm" fw={600} mt={4}>
                        {home.freeToJoin}
                      </Text>
                    </Stack>
                  </Card>
                </UnstyledButton>
              )}
            </Group>
          </ScrollArea>
        </Stack>
      )}
    </Stack>
  );
}

function PreviewCard({
  provider,
  onOpen,
}: {
  provider: Provider;
  onOpen: (p: Provider) => void;
}) {
  const locationLine = useVenueLocationLine();
  const badgeLabel = useBadgeLabel();
  const ageLabel = useAgeRangeLabel();
  const activityLabel = useActivityTypeLabel();
  const formatPrice = useFormatVenuePrice();
  const price = formatPrice(provider);
  const badge = provider.badges[0];

  return (
    <UnstyledButton onClick={() => onOpen(provider)} style={{ width: 256, flexShrink: 0 }}>
      <Card radius="xl" p={0} withBorder w={256}>
        <Card.Section>
          <Box pos="relative" h={128}>
            <ResolvedCoverImage
              resolveBase={provider.website}
              src={provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing}
              alt={provider.name}
            />
            {badge && (
              <Badge
                pos="absolute"
                top={8}
                left={8}
                radius="xl"
                tt="uppercase"
                variant="filled"
                color="dark"
                size="xs"
              >
                {badgeLabel(badge)}
              </Badge>
            )}
          </Box>
        </Card.Section>
        <Stack gap={4} p="sm">
          <Text fw={600} size="sm" lineClamp={1}>
            {provider.name}
          </Text>
          <Text size="xs" c="dimmed">
            {locationLine(provider.borough, provider.neighborhood)}
          </Text>
          <Text size="11px" c="dimmed">
            {ageLabel(provider.ageRanges[0])} · {activityLabel(provider.activityTypes[0])}
          </Text>
          <Group justify="space-between" mt={4}>
            <Text size="sm" fw={600}>
              {price.main}
              {price.suffix && (
                <Text component="span" size="10px" fw={400} c="dimmed">
                  {price.suffix}
                </Text>
              )}
            </Text>
            <Star size={14} fill="currentColor" />
          </Group>
        </Stack>
      </Card>
    </UnstyledButton>
  );
}
