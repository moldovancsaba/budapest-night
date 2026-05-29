"use client";

import {
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
import { SectionPanel } from "@/components/gds";
import { MapPin, CalendarClock } from "@/components/gds/icons";
import { MeetupConnectSection } from "@/components/scout/detail/MeetupConnectSection";
import { MeetupProfileActions } from "@/components/scout/detail/MeetupProfileActions";
import { useEventsCatalog, useMeetupGroupsCatalog, useProvidersCatalog } from "@/hooks/useCatalog";
import { useFormatEventSchedule } from "@/hooks/useEventDisplay";
import { eventStubFromMeetupLink, type PublicMeetupGroup } from "@/lib/publicMeetup";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { Provider } from "@/types/provider";
import { MeetupLogo } from "../MeetupLogo";
import { MeetupGroupCard } from "../MeetupGroupCard";
import { ProviderCard } from "../ProviderCard";
import { EventCard } from "../EventCard";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useAgeRangeLabel,
  useMeetupCadenceLabel,
  useMeetupGroupTypeLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { ResolvedCoverImage } from "../ResolvedCoverImage";

export function MeetupGroupProfile({
  group,
  onClose,
  onShare,
  onOpenAnother,
  onOpenVenue,
  onOpenEvent,
  variant = "sheet",
}: {
  group: PublicMeetupGroup | null;
  onClose: () => void;
  onShare: (g: PublicMeetupGroup) => void;
  onOpenAnother: (g: PublicMeetupGroup) => void;
  onOpenVenue: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  variant?: "sheet" | "page";
}) {
  const t = useTranslations("meetup");
  const { data: allGroups = [] } = useMeetupGroupsCatalog();
  const { data: providers = [] } = useProvidersCatalog();
  const { data: allEvents = [] } = useEventsCatalog();
  const formatSchedule = useFormatEventSchedule();
  const locationLine = useVenueLocationLine();
  const groupTypeLabel = useMeetupGroupTypeLabel();
  const cadenceLabel = useMeetupCadenceLabel();
  const ageLabel = useAgeRangeLabel();
  if (!group) return null;
  const isPage = variant === "page";

  const similar = allGroups
    .filter((g) => g.id !== group.id && g.borough === group.borough)
    .slice(0, 3);

  const websiteUrl = `https://${group.website.replace(/^https?:\/\//, "")}`;

  const shareEmail = () => {
    const body = `${group.name} — ${locationLine(group.borough, group.neighborhood)}.\n\n${group.description}\n\nInstagram: ${group.instagram}\n${websiteUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(t("shareTitle", { name: group.name }))}&body=${encodeURIComponent(body)}`,
    );
  };
  const shareWhatsapp = () => {
    const text = `${group.name} — ${locationLine(group.borough, group.neighborhood)}. ${group.description} ${group.instagram} ${websiteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const content = (
    <>
      <Box pos="relative" h={isPage ? 224 : 176} style={{ overflow: "hidden" }}>
        <ResolvedCoverImage
          src={
            group.coverImageUrl?.trim()
              ? group.coverImageUrl
              : CMS_MEDIA.fallbackMeetup
          }
          resolveBase={group.coverImageUrl?.trim() ? group.website : undefined}
          alt={group.name}
        />
      </Box>
      <Box
        px="lg"
        pb="lg"
        pt="lg"
        style={{ backgroundColor: "var(--mantine-color-default)" }}
      >
        <Group align="flex-start" gap="lg" wrap="nowrap">
          <MeetupLogo group={group} size="lg" />
          <Stack gap="xs" style={{ minWidth: 0, flex: 1 }}>
            <Badge radius="xl" variant="light" color="gray" w="fit-content" tt="uppercase" size="xs">
              {groupTypeLabel(group.groupType)}
            </Badge>
            <Title order={2} size="h2" lh={1.2}>
              {group.name}
            </Title>
            <Group gap={6} wrap="nowrap">
              <MapPin size={16} style={{ flexShrink: 0 }} />
              <Text size="sm" c="dimmed">
                {locationLine(group.borough, group.neighborhood)}
              </Text>
            </Group>
          </Stack>
        </Group>
      </Box>

      <Stack gap="xl" p="lg" pb={48}>
        <Group gap="xs">
          <Badge radius="xl" variant="light" color="gray">
            {ageLabel(group.ageRange)}
          </Badge>
          <Badge
            radius="xl"
            variant="outline"
            color="gray"
            leftSection={<CalendarClock size={14} />}
          >
            {cadenceLabel(group.cadence)}
          </Badge>
          <Badge radius="xl" variant="light" color="gray">
            {groupTypeLabel(group.groupType)}
          </Badge>
        </Group>

        <Text size="sm" lh={1.6}>
          {group.description}
        </Text>

        <MeetupProfileActions
          group={group}
          websiteUrl={websiteUrl}
          onShareEmail={shareEmail}
          onShareWhatsapp={shareWhatsapp}
        />

        {(group.venueIds?.length ?? 0) > group.venues.length ? (
          <Alert color="yellow" radius="md">
            {t("venueLinkMissing", {
              count: (group.venueIds?.length ?? 0) - group.venues.length,
            })}
          </Alert>
        ) : null}

        {group.venues.length > 0 && (
          <SectionPanel title={t("hostVenues")} description={t("hostVenuesHint")}>
            <Stack gap="md">
              {group.venues.map((link) => {
                const provider = providers.find((p) => p.id === link.id) ?? null;
                return provider ? (
                  <ProviderCard
                    key={link.id}
                    provider={provider}
                    onOpen={onOpenVenue}
                    onShare={() => {}}
                  />
                ) : (
                  <Paper key={link.id} radius="xl" p="md" bg="dark.6">
                    <Text fw={600}>{link.name}</Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      {link.address}
                    </Text>
                  </Paper>
                );
              })}
            </Stack>
          </SectionPanel>
        )}

        {(group.eventIds?.length ?? 0) > group.events.length ? (
          <Alert color="yellow" radius="md">
            {t("eventLinkMissing", {
              count: (group.eventIds?.length ?? 0) - group.events.length,
            })}
          </Alert>
        ) : null}

        {group.events.length > 0 && (
          <SectionPanel title={t("organizedEvents")} description={t("organizedEventsHint")}>
            <Stack gap="md">
              {group.events.map((link) => {
                const full = allEvents.find((e) => e.id === link.id);
                if (full) {
                  return <EventCard key={link.id} event={full} onOpen={onOpenEvent} />;
                }
                const stub = eventStubFromMeetupLink(link, group);
                const { dateLine, timeLine } = formatSchedule(stub);
                return (
                  <Paper
                    key={link.id}
                    component="button"
                    type="button"
                    radius="xl"
                    p="md"
                    w="100%"
                    bg="dark.6"
                    onClick={() => onOpenEvent(stub)}
                    style={{ cursor: "pointer", textAlign: "left" }}
                  >
                    <Text fw={600}>{link.title}</Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {dateLine} · {timeLine}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {link.borough} · {link.neighborhood}
                    </Text>
                  </Paper>
                );
              })}
            </Stack>
          </SectionPanel>
        )}

        <MeetupConnectSection group={group} websiteUrl={websiteUrl} />

        {similar.length > 0 && (
          <SectionPanel title={t("similarNearby")}>
            <Stack gap="md">
              {similar.map((g) => (
                <MeetupGroupCard
                  key={g.id}
                  group={g}
                  onOpen={onOpenAnother}
                  onShare={onShare}
                />
              ))}
            </Stack>
          </SectionPanel>
        )}
      </Stack>
    </>
  );

  if (isPage) {
    return <Box style={{ overflowY: "auto" }}>{content}</Box>;
  }

  return (
    <Drawer
      opened={!!group}
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
