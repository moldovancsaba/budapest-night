"use client";

import { CalendarDays, MapPin, Ticket } from "@/components/gds/icons";
import { ListingCardMedia, ProductCard } from "@/components/gds";
import { AppButton } from "@/components/gds/AppButton";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useEventDisplayLabels,
  useEventFromPrice,
  primaryHostFromEvent,
  useEventPlaceLine,
  useFormatDoorsOpen,
  useFormatEventSchedule,
} from "@/hooks/useEventDisplay";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import { useTranslations } from "next-intl";
import { Badge, Group, Stack, Text } from "@mantine/core";

interface Props {
  event: PublicNightEvent;
  onOpen: (e: PublicNightEvent) => void;
}

export function EventCard({ event, onOpen }: Props) {
  const t = useTranslations("event");
  const tProgram = useTranslations("program");
  const schedule = useFormatEventSchedule();
  const doors = useFormatDoorsOpen();
  const fromPrice = useEventFromPrice();
  const placeLine = useEventPlaceLine();
  const { data: providers = [] } = useProvidersCatalog();
  const { badgeLabel } = useEventDisplayLabels();
  const { dateLine, timeLine } = schedule(event);
  const primaryHostRaw = primaryHostFromEvent(event, providers);
  const primaryHost = primaryHostRaw
    ? { ...primaryHostRaw, ...resolveProviderLocation(primaryHostRaw) }
    : null;

  const promoBadge =
    event.promotionLabel || event.isFeatured ? (
      <Stack gap={4} style={{ position: "absolute", top: 12, left: 12, maxWidth: "85%" }}>
        <Badge radius="xl" tt="uppercase" variant="filled" color="brand" size="sm">
          {event.promotionLabel ?? badgeLabel("Featured")}
        </Badge>
        {event.promotionLabel ? (
          <Badge radius="sm" variant="light" color="gray" size="xs">
            {tProgram("adDisclosure")}
          </Badge>
        ) : null}
      </Stack>
    ) : event.badges[0] ? (
      <Badge
        radius="xl"
        tt="uppercase"
        variant="filled"
        color="dark"
        size="sm"
        style={{ position: "absolute", top: 12, left: 12 }}
      >
        {badgeLabel(event.badges[0])}
      </Badge>
    ) : null;

  return (
    <ProductCard
      title={event.title}
      description={
        <Stack gap="xs">
          <Group gap={6} wrap="nowrap">
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
          <Group align="flex-start" gap={6} wrap="nowrap">
            <MapPin size={16} style={{ marginTop: 2 }} />
            <Stack gap={2}>
              <Text size="sm">{placeLine(event, primaryHost)}</Text>
              {primaryHost?.address ? (
                <Text size="xs" c="dimmed">
                  {primaryHost.address}
                </Text>
              ) : null}
            </Stack>
          </Group>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {event.shortDescription}
          </Text>
        </Stack>
      }
      media={
        <ListingCardMedia
          src={event.image?.trim() ? event.image : CMS_MEDIA.fallbackListing}
          alt={event.title}
          overlays={promoBadge}
        />
      }
      footer={
        <Group justify="space-between" gap="xs" w="100%">
          <Group gap={4}>
            <Ticket size={16} />
            <Text size="sm" fw={600}>
              {fromPrice(event.entryFees)}
            </Text>
          </Group>
          <AppButton size="sm" variant="secondary" onClick={() => onOpen(event)}>
            {t("viewEvent")}
          </AppButton>
        </Group>
      }
    />
  );
}
