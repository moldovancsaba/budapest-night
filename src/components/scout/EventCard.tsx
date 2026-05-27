"use client";

import { CalendarDays, Ticket } from "@/components/gds/icons";
import Image from "next/image";
import { ActionIcon, AspectRatio, Box, Button, Group } from "@mantine/core";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { PublicProductCard } from "@/components/gds";
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
  const cardBadge =
    event.promotionLabel ??
    (event.isFeatured ? badgeLabel("Featured") : event.badges[0] ? badgeLabel(event.badges[0]) : t("viewEvent"));
  const location = placeLine(event, primaryHost);
  const price = fromPrice(event.entryFees);

  return (
    <PublicProductCard
      title={event.title}
      description={event.shortDescription}
      image={
        <AspectRatio ratio={16 / 10}>
          <Box pos="relative" h="100%">
            <Image
              fill
              src={event.image?.trim() ? event.image : CMS_MEDIA.fallbackListing}
              alt={event.title}
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </Box>
        </AspectRatio>
      }
      price={price}
      state="available"
      stateLabels={{ available: cardBadge }}
      metadata={[
        { label: t("venues"), value: location },
        { label: t("entryFees"), value: `${dateLine} · ${timeLine}` },
        ...(doors(event) ? [{ label: t("doorsOpen", { time: "" }).trim(), value: doors(event) as string }] : []),
      ]}
      primaryAction={
        <Button size="sm" color="brand" onClick={() => onOpen(event)}>
          <Group gap="xs" wrap="nowrap">
            <Ticket size={16} />
            {t("viewEvent")}
          </Group>
        </Button>
      }
      secondaryAction={
        <ActionIcon variant="outline" radius="xl" aria-label={t("viewEvent")} onClick={() => onOpen(event)}>
          <CalendarDays size={16} />
        </ActionIcon>
      }
    />
  );
}
