"use client";

import { CalendarDays } from "@/components/gds/icons";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { buildProgramPath, buildSectionPath } from "@/lib/appPaths";
import { PROGRAM_VERTICALS } from "@/lib/programVerticals";
import { useProgramWeek } from "@/hooks/useProgramWeek";
import { AccentPanel, AppButton, BrowseSurface } from "@/components/gds";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { EventCard } from "@/components/scout/EventCard";
import { ProviderCard } from "@/components/scout/ProviderCard";
import { BOROUGHS } from "@/data/locations";
import { useDistrictLabel } from "@/hooks/useVenueDisplay";
import { ProgramWeekJsonLd } from "@/components/seo/ProgramWeekJsonLd";
import type { AppLocale } from "@/i18n/config";
import { Anchor, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";

type Props = {
  onOpenProvider: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  onShareProvider: (p: Provider) => void;
};

export function ProgramWeekView({ onOpenProvider, onOpenEvent, onShareProvider }: Props) {
  const t = useTranslations("program");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const format = useFormatter();
  const districtLabel = useDistrictLabel();
  const { data, isLoading, isError } = useProgramWeek();

  const week = data?.week;
  const featuredEvents = data?.featuredEvents ?? [];
  const spotlightEvents = data?.spotlightEvents ?? [];
  const featuredProviders = data?.featuredProviders ?? [];
  const fallbackEventCount = data?.fallbackEventCount ?? 0;
  const suggestedEvents = data?.suggestedEvents ?? [];

  const weekRange =
    week &&
    t("weekRange", {
      start: format.dateTime(new Date(week.weekStartsAt), { dateStyle: "medium" }),
      end: format.dateTime(new Date(week.weekEndsAt), { dateStyle: "medium" }),
    });

  const hasProgramEvents = featuredEvents.length > 0 || spotlightEvents.length > 0;

  const verticalScope = PROGRAM_VERTICALS.map((v) => ({
    id: v.id,
    label: t(`vertical.${v.id}`),
    active: false,
    onSelect: () => router.push(buildProgramPath(v.id, { locale })),
  }));

  const districtScope = BOROUGHS.map((b) => ({
    id: b,
    label: districtLabel(b),
    active: false,
    onSelect: () =>
      router.push(buildSectionPath("events", { location: { borough: b } })),
  }));

  return (
    <>
      {week ? (
        <ProgramWeekJsonLd week={week} events={[...featuredEvents, ...spotlightEvents]} />
      ) : null}
      <BrowseSurface
        eyebrow={t("thuNote")}
        title={week?.headline || t("weekTitle")}
        description={
          week
            ? [week.intro || t("weekSubtitle"), weekRange].filter(Boolean).join(" · ")
            : t("weekSubtitle")
        }
        resultCount={fallbackEventCount > 0 ? fallbackEventCount : undefined}
        resultLabel={t("eventsResultLabel")}
        scopeOptions={verticalScope}
        scopeLabel={t("verticalsTitle")}
        loading={isLoading}
        loadingTitle={t("loading")}
        error={isError || (!isLoading && !week) ? t("weekSubtitle") : undefined}
        empty={!isLoading && !isError && !!week && !hasProgramEvents && suggestedEvents.length === 0}
        emptyTitle={t("emptyWeekTitle")}
        emptyDescription={t("emptyWeekMessage")}
        emptyAction={
          <AppButton component={Link} href={buildSectionPath("events")} radius="xl">
            {t("browseAllEvents")}
          </AppButton>
        }
        primaryControls={
          week?.sponsorName ? (
            <Stack gap={4} align="flex-end" maw={280}>
              <Text size="sm" c="dimmed" ta="right">
                <Text span fw={500}>
                  {t("sponsorLabel")}:{" "}
                </Text>
                {week.sponsorUrl ? (
                  <Anchor
                    href={week.sponsorUrl}
                    target="_blank"
                    rel="noreferrer"
                    underline="always"
                  >
                    {week.sponsorName}
                  </Anchor>
                ) : (
                  week.sponsorName
                )}
              </Text>
              <Text size="xs" c="dimmed" ta="right">
                {t("adDisclosure")}
              </Text>
            </Stack>
          ) : undefined
        }
        content={
          week ? (
            <Stack gap={48}>
              <AccentPanel tone="gray" title={t("editorialTitle")} variant="soft-outline">
                <Text size="sm" lh={1.65}>
                  {t("editorialBody")}
                </Text>
              </AccentPanel>

              {featuredEvents.length > 0 && (
                <Stack gap="md">
                  <Group justify="space-between" align="flex-end" wrap="wrap">
                    <Group gap="xs">
                      <CalendarDays size={20} />
                      <Title order={2} size="h3" tt="uppercase" lts="0.04em">
                        {t("featuredEvents")}
                      </Title>
                    </Group>
                    <AppButton
                      component={Link}
                      href={buildSectionPath("events")}
                      variant="subtle"
                      size="sm"
                      radius="xl"
                    >
                      {t("browseAllEvents")} →
                    </AppButton>
                  </Group>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {featuredEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {!hasProgramEvents && suggestedEvents.length > 0 && (
                <Stack gap="md">
                  <Stack gap={4}>
                    <Title order={2} size="h3" tt="uppercase" lts="0.04em">
                      {t("upcomingFallback")}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {t("emptyWeekMessage")}
                    </Text>
                  </Stack>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {suggestedEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {spotlightEvents.length > 0 && (
                <Stack gap="md">
                  <Stack gap={4}>
                    <Title order={2} size="h3" tt="uppercase" lts="0.04em">
                      {t("spotlightEvents")}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {t("spotlightEventsHint")}
                    </Text>
                  </Stack>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {spotlightEvents.map((ev) => (
                      <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              {featuredProviders.length > 0 && (
                <Stack gap="md">
                  <Title order={2} size="h3" tt="uppercase" lts="0.04em">
                    {t("featuredVenues")}
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {featuredProviders.map((p) => (
                      <ProviderCard
                        key={p.id}
                        provider={p}
                        onOpen={onOpenProvider}
                        onShare={onShareProvider}
                      />
                    ))}
                  </SimpleGrid>
                </Stack>
              )}

              <Stack gap="md">
                <Title order={2} size="h3" tt="uppercase" lts="0.04em">
                  {t("boroughTitle")}
                </Title>
                <Group gap="xs">
                  {districtScope.map((option) => (
                    <AppButton
                      key={option.id}
                      variant="outline"
                      radius="xl"
                      onClick={option.onSelect}
                    >
                      {option.label}
                    </AppButton>
                  ))}
                </Group>
              </Stack>
            </Stack>
          ) : null
        }
      />
    </>
  );
}
