"use client";

import { CalendarDays, MapPin, Ticket } from "@/components/gds/icons";
import Image from "next/image";
import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { AppButton } from "@/components/gds/AppButton";
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

  return (
    <Card radius="xl" p={0} withBorder style={{ overflow: "hidden" }}>
      <Card.Section>
        <div style={{ position: "relative", height: 176, overflow: "hidden" }}>
          <Image
            fill
            src={event.image?.trim() ? event.image : CMS_MEDIA.fallbackListing}
            alt={event.title}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        {event.promotionLabel || event.isFeatured ? (
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
        ) : null}
      </Card.Section>

      <Stack gap="sm" p="lg" style={{ flex: 1 }}>
        <AppButton type="button" variant="subtle" onClick={() => onOpen(event)} px={0} justify="flex-start" color="gray">
          <Text fw={600} size="lg" ta="left">
            {event.title}
          </Text>
        </AppButton>
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
        <Group justify="space-between" gap="xs" mt="xs">
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
      </Stack>
    </Card>
  );
}
