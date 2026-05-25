"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { Link } from "@/i18n/routing";
import { buildProgramPath, type ProgramVerticalSlug } from "@/lib/appPaths";
import {
  getVertical,
  providerMatchesVertical,
  eventMatchesVertical,
} from "@/lib/programVerticals";
import { useProvidersCatalog, useEventsCatalog } from "@/hooks/useCatalog";
import { useProgramWeek } from "@/hooks/useProgramWeek";
import { AppButton } from "@/components/gds/AppButton";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { EventCard } from "@/components/scout/EventCard";
import { ProviderCard } from "@/components/scout/ProviderCard";
import { Anchor, SimpleGrid, Stack, Text, Title } from "@mantine/core";

type Props = {
  vertical: ProgramVerticalSlug;
  onOpenProvider: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  onShareProvider: (p: Provider) => void;
};

export function ProgramVerticalView({
  vertical,
  onOpenProvider,
  onOpenEvent,
  onShareProvider,
}: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("program");
  const def = getVertical(vertical);
  const { data: providers = [] } = useProvidersCatalog();
  const { data: events = [] } = useEventsCatalog();
  const { data: programWeek } = useProgramWeek();
  const verticalSponsor = programWeek?.verticalSponsors?.[vertical];

  const filteredProviders = useMemo(() => {
    if (!def) return [];
    return providers.filter((p) => providerMatchesVertical(p, def));
  }, [providers, def]);

  const filteredEvents = useMemo(() => {
    if (!def) return [];
    return events.filter((e) => eventMatchesVertical(e, def));
  }, [events, def]);

  if (!def) {
    return (
      <Text c="dimmed" size="sm">
        <Anchor component={Link} href={buildProgramPath(undefined, { locale })}>
          ← {t("weekTitle")}
        </Anchor>
      </Text>
    );
  }

  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <AppButton
          component={Link}
          href={buildProgramPath(undefined, { locale })}
          variant="subtle"
          size="sm"
          radius="xl"
        >
          ← {t("weekTitle")}
        </AppButton>
        <Title order={1} size="h2" tt="uppercase" lts="0.02em">
          {t(`vertical.${vertical}`)}
        </Title>
        <Text c="dimmed">{t("weekSubtitle")}</Text>
        {verticalSponsor && (
          <Text size="sm" c="dimmed">
            {t("sponsorLabel")}:{" "}
            {verticalSponsor.url ? (
              <Anchor
                href={verticalSponsor.url}
                fw={500}
                c="brand"
                target="_blank"
                rel="noopener noreferrer"
                underline="always"
              >
                {verticalSponsor.name}
              </Anchor>
            ) : (
              <Text span fw={500} c="dark">
                {verticalSponsor.name}
              </Text>
            )}
          </Text>
        )}
      </Stack>

      {filteredEvents.length > 0 && (
        <Stack gap="md">
          <Title order={2} size="h4" tt="uppercase" lts="0.04em">
            {t("featuredEvents")}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {filteredEvents.slice(0, 12).map((ev) => (
              <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
            ))}
          </SimpleGrid>
        </Stack>
      )}

      <Stack gap="md">
        <Title order={2} size="h4" tt="uppercase" lts="0.04em">
          {t("featuredVenues")}
        </Title>
        {filteredProviders.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t("emptyVertical")}
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {filteredProviders.slice(0, 18).map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onOpen={onOpenProvider}
                onShare={onShareProvider}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Stack>
  );
}
