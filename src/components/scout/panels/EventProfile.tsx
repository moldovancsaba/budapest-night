"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { Provider } from "@/types/provider";
import { CalendarDays, ExternalLink, MapPin, Ticket, X } from "lucide-react";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import {
  useEventDisplayLabels,
  useEventFromPrice,
  useEventPlaceLine,
  useFormatDoorsOpen,
  useFormatEntryFee,
  useFormatEventSchedule,
} from "@/hooks/useEventDisplay";
import { useTranslations, useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { buildAbsoluteEventFullUrl } from "@/lib/appShareUrls";
import { eventJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { ProviderCard } from "../ProviderCard";
import { ResolvedCoverImage } from "../ResolvedCoverImage";

export function EventProfile({
  event,
  onClose,
  onOpenVenue,
  variant = "sheet",
}: {
  event: PublicNightEvent | null;
  onClose: () => void;
  onOpenVenue: (p: Provider) => void;
  variant?: "sheet" | "page";
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("event");
  const schedule = useFormatEventSchedule();
  const doors = useFormatDoorsOpen();
  const fromPrice = useEventFromPrice();
  const formatFee = useFormatEntryFee();
  const placeLine = useEventPlaceLine();
  const { activityLabel, ageLabel, badgeLabel } = useEventDisplayLabels();
  const { data: providers = [] } = useProvidersCatalog();

  if (!event) return null;

  const isPage = variant === "page";
  const { dateLine, timeLine } = schedule(event);
  const hostVenueRows = event.venues.map((link) => ({
    link,
    provider: providers.find((p) => p.id === link.id) ?? null,
  }));
  const primaryHost = hostVenueRows[0]?.provider ?? hostVenueRows[0]?.link ?? null;
  const missingVenueCount = event.venueIds.length - event.venues.length;

  const content = (
    <>
      <Box pos="relative" h={isPage ? 288 : 224} style={{ overflow: "hidden" }}>
        <ResolvedCoverImage
          src={event.image?.trim() ? event.image : CMS_MEDIA.fallbackListing}
          resolveBase={event.website}
          alt={event.title}
        />
        {!isPage ? (
          <ActionIcon
            variant="filled"
            color="gray"
            radius="xl"
            size="lg"
            onClick={onClose}
            aria-label={t("close")}
            style={{ position: "absolute", top: 16, right: 16 }}
          >
            <X size={16} />
          </ActionIcon>
        ) : null}
      </Box>

      <Stack gap="xl" p="lg" pb={48}>
        <Stack gap="xs">
          {event.badges[0] ? (
            <Badge radius="xl" variant="light" color="gray" w="fit-content">
              {badgeLabel(event.badges[0])}
            </Badge>
          ) : null}
          <Title order={isPage ? 1 : 2} size={isPage ? "h1" : "h2"}>
            {event.title}
          </Title>
          <Group gap="xs" wrap="nowrap">
            <CalendarDays size={16} />
            <Text size="sm" fw={500}>
              {dateLine} · {timeLine}
            </Text>
          </Group>
          {doors(event) ? (
            <Text size="xs" c="dimmed">
              {doors(event)}
            </Text>
          ) : null}
          <Group gap={6} align="flex-start" wrap="nowrap">
            <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <Stack gap={2}>
              <Text size="sm" c="dimmed">
                {placeLine(event, primaryHost)}
              </Text>
              {primaryHost?.address ? (
                <Text size="xs" c="dimmed">
                  {primaryHost.address}
                </Text>
              ) : null}
            </Stack>
          </Group>
          <Text size="lg" fw={600}>
            {fromPrice(event.entryFees)}
          </Text>
        </Stack>

        <Text size="sm" lh={1.6}>
          {event.longDescription}
        </Text>

        <Group gap="xs">
          {event.activityTypes.map((tag) => (
            <Badge key={tag} radius="xl" variant="light" color="gray">
              {activityLabel(tag)}
            </Badge>
          ))}
          {event.ageRanges.map((a) => (
            <Badge key={a} radius="xl" variant="outline" color="gray">
              {ageLabel(a)}
            </Badge>
          ))}
        </Group>

        {event.entryFees.length > 0 && (
          <Paper withBorder radius="xl" p="md">
            <Group gap="xs" mb="sm">
              <Ticket size={16} />
              <Text fw={600} size="sm">
                {t("entryFees")}
              </Text>
            </Group>
            <Stack gap="xs">
              {event.entryFees.map((fee) => (
                <Group key={fee.id} justify="space-between" gap="md">
                  <Text size="sm">{fee.label}</Text>
                  <Text size="sm" fw={600}>
                    {formatFee(fee)}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        )}

        <Group gap="sm">
          {event.bookingUrl ? (
            <AppButton
              component="a"
              href={event.bookingUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Group gap="xs" wrap="nowrap">
                {t("getTickets")}
                <ExternalLink size={16} />
              </Group>
            </AppButton>
          ) : null}
          {event.website ? (
            <AppButton
              variant="outline"
              component="a"
              href={event.website}
              target="_blank"
              rel="noreferrer"
            >
              {t("officialSite")}
            </AppButton>
          ) : null}
        </Group>

        {missingVenueCount > 0 ? (
          <Alert color="yellow" radius="md">
            {t("venueLinkMissing", { count: missingVenueCount })}
          </Alert>
        ) : null}

        {hostVenueRows.length > 0 && (
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={3} size="h4">
                {t("venues")}
              </Title>
              <Text size="xs" c="dimmed">
                {t("venuesHint")}
              </Text>
            </Stack>
            <Stack gap="md">
              {hostVenueRows.map(({ link, provider }) =>
                provider ? (
                  <ProviderCard
                    key={link.id}
                    provider={provider}
                    onOpen={onOpenVenue}
                    onShare={() => {}}
                  />
                ) : (
                  <Paper key={link.id} withBorder radius="xl" p="md">
                    <Text fw={600}>{link.name}</Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      {link.address}
                    </Text>
                  </Paper>
                ),
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </>
  );

  if (isPage) {
    const url = buildAbsoluteEventFullUrl(event, locale);
    const place = primaryHost && "name" in primaryHost ? primaryHost.name : placeLine(event);
    const address =
      primaryHost && "address" in primaryHost
        ? primaryHost.address
        : hostVenueRows[0]?.link.address;
    return (
      <>
        <JsonLd
          data={eventJsonLd({
            title: event.title,
            description: event.shortDescription || event.longDescription,
            startDate: event.startsAt,
            endDate: event.endsAt,
            url,
            locationName: place,
            address,
            offers: event.entryFees.map((f) => ({
              price: f.amount,
              currency: f.currency,
              name: f.label,
            })),
          })}
        />
        <Box style={{ overflowY: "auto" }}>{content}</Box>
      </>
    );
  }

  return (
    <Drawer
      opened={!!event}
      onClose={onClose}
      position="right"
      size="xl"
      padding={0}
      withCloseButton={false}
      styles={{ body: { padding: 0, height: "100%", overflowY: "auto" } }}
    >
      {content}
    </Drawer>
  );
}
