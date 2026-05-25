"use client";

import { CalendarDays } from "@/components/gds/icons";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildProgramPath, buildSectionPath } from "@/lib/appPaths";
import { PROGRAM_VERTICALS } from "@/lib/programVerticals";
import { useProgramWeek } from "@/hooks/useProgramWeek";
import { AppButton } from "@/components/gds/AppButton";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { EventCard } from "@/components/scout/EventCard";
import { ProviderCard } from "@/components/scout/ProviderCard";
import { BOROUGHS } from "@/data/locations";
import { useDistrictLabel } from "@/hooks/useVenueDisplay";
import { ProgramWeekJsonLd } from "@/components/seo/ProgramWeekJsonLd";
import type { AppLocale } from "@/i18n/config";
import {
  Anchor,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

type Props = {
  onOpenProvider: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  onShareProvider: (p: Provider) => void;
};

export function ProgramWeekView({ onOpenProvider, onOpenEvent, onShareProvider }: Props) {
  const t = useTranslations("program");
  const locale = useLocale() as AppLocale;
  const format = useFormatter();
  const districtLabel = useDistrictLabel();
  const { data, isLoading, isError } = useProgramWeek();

  if (isLoading) {
    return (
      <Text c="dimmed" size="sm">
        {t("loading")}
      </Text>
    );
  }
  if (isError || !data) {
    return (
      <Text c="dimmed" size="sm">
        {t("weekSubtitle")}
      </Text>
    );
  }

  const { week, featuredEvents, spotlightEvents = [], featuredProviders, fallbackEventCount } =
    data;
  const weekRange = t("weekRange", {
    start: format.dateTime(new Date(week.weekStartsAt), { dateStyle: "medium" }),
    end: format.dateTime(new Date(week.weekEndsAt), { dateStyle: "medium" }),
  });

  return (
    <>
      <ProgramWeekJsonLd week={week} events={[...featuredEvents, ...spotlightEvents]} />
      <Stack gap={40}>
        <Paper radius="xl" withBorder px={{ base: "lg", sm: 40 }} py={40}>
          <Text size="xs" fw={600} tt="uppercase" c="brand" lts="0.12em">
            {t("thuNote")}
          </Text>
          <Title order={1} mt="sm" size="h2" tt="uppercase" lts="0.02em">
            {week.headline || t("weekTitle")}
          </Title>
          <Text size="sm" c="dimmed" mt="xs">
            {weekRange}
          </Text>
          {week.intro ? (
            <Text c="dimmed" mt="md" maw={640}>
              {week.intro}
            </Text>
          ) : (
            <Text c="dimmed" mt="md" maw={640}>
              {t("weekSubtitle")}
            </Text>
          )}
          {week.sponsorName ? (
            <Text size="sm" c="dimmed" mt="md">
              <Text span fw={500}>
                {t("sponsorLabel")}:{" "}
              </Text>
              {week.sponsorUrl ? (
                <Anchor href={week.sponsorUrl} target="_blank" rel="noreferrer" underline="always">
                  {week.sponsorName}
                </Anchor>
              ) : (
                week.sponsorName
              )}
              <Text component="span" display="block" size="xs" c="dimmed" mt={4}>
                {t("adDisclosure")}
              </Text>
            </Text>
          ) : null}
          <Text size="xs" c="dimmed" mt="xs">
            {t("eventsThisWeek", { count: fallbackEventCount })}
          </Text>
        </Paper>

        <Paper radius="xl" withBorder px="lg" py="xl" bg="gray.0">
          <Title order={2} size="h4" tt="uppercase" lts="0.04em">
            {t("editorialTitle")}
          </Title>
          <Text size="sm" c="dimmed" mt="sm" maw={720} lh={1.6}>
            {t("editorialBody")}
          </Text>
        </Paper>

        <Stack gap="md">
          <Title order={2} size="h3" tt="uppercase" lts="0.04em">
            {t("verticalsTitle")}
          </Title>
          <Group gap="xs">
            {PROGRAM_VERTICALS.map((v) => (
              <AppButton
                key={v.id}
                component={Link}
                href={buildProgramPath(v.id, { locale })}
                variant="outline"
                radius="xl"
              >
                {t(`vertical.${v.id}`)}
              </AppButton>
            ))}
          </Group>
        </Stack>

        {featuredEvents.length > 0 && (
          <Stack gap="md">
            <Group justify="space-between" align="flex-end" wrap="wrap">
              <Group gap="xs">
                <CalendarDays size={20} />
                <Title order={2} size="h3" tt="uppercase" lts="0.04em">
                  {t("featuredEvents")}
                </Title>
              </Group>
              <AppButton component={Link} href={buildSectionPath("events")} variant="subtle" size="sm" radius="xl">
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
            {BOROUGHS.map((b) => (
              <AppButton
                key={b}
                component={Link}
                href={buildSectionPath("events", { location: { borough: b } })}
                variant="outline"
                radius="xl"
              >
                {districtLabel(b)}
              </AppButton>
            ))}
          </Group>
        </Stack>
      </Stack>
    </>
  );
}
