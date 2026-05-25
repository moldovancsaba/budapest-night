"use client";

import {
  Alert,
  Anchor,
  Badge,
  Box,
  Drawer,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { AppButton } from "@/components/gds/AppButton";
import {
  Heart,
  MapPin,
  Mail,
  MessageCircle,
  Instagram,
  Globe,
  CalendarClock,
} from "@/components/gds/icons";
import { useSaved } from "@/store/useScout";
import { notify } from "@/lib/notify";
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
  const tv = useTranslations("venue");
  const { isSaved, toggle } = useSaved();
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
  const saved = isSaved(group.id);

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
      <Box px="lg" pb="lg" pt="lg" bg="gray.1">
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

        <SimpleGrid cols={2} spacing="xs">
          <AppButton
            onClick={() => {
              toggle(group.id);
              notify.success(saved ? tv("removed") : tv("savedGroup"));
            }}
          >
            <Group gap="xs" wrap="nowrap" justify="center">
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
              {saved ? t("unsave") : t("save")}
            </Group>
          </AppButton>
          <AppButton
            variant="outline"
            component="a"
            href={websiteUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Group gap="xs" wrap="nowrap" justify="center">
              <Globe size={16} />
              {t("visitWebsite")}
            </Group>
          </AppButton>
          <AppButton variant="outline" onClick={shareEmail}>
            <Group gap="xs" wrap="nowrap" justify="center">
              <Mail size={16} />
              {tv("shareEmail")}
            </Group>
          </AppButton>
          <AppButton variant="outline" onClick={shareWhatsapp}>
            <Group gap="xs" wrap="nowrap" justify="center">
              <MessageCircle size={16} />
              {tv("shareWhatsapp")}
            </Group>
          </AppButton>
        </SimpleGrid>

        {(group.venueIds?.length ?? 0) > group.venues.length ? (
          <Alert color="yellow" radius="md">
            {t("venueLinkMissing", {
              count: (group.venueIds?.length ?? 0) - group.venues.length,
            })}
          </Alert>
        ) : null}

        {group.venues.length > 0 && (
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={3} size="h4">
                {t("hostVenues")}
              </Title>
              <Text size="xs" c="dimmed">
                {t("hostVenuesHint")}
              </Text>
            </Stack>
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
                  <Paper key={link.id} withBorder radius="xl" p="md">
                    <Text fw={600}>{link.name}</Text>
                    <Text size="sm" c="dimmed" mt={4}>
                      {link.address}
                    </Text>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        )}

        {(group.eventIds?.length ?? 0) > group.events.length ? (
          <Alert color="yellow" radius="md">
            {t("eventLinkMissing", {
              count: (group.eventIds?.length ?? 0) - group.events.length,
            })}
          </Alert>
        ) : null}

        {group.events.length > 0 && (
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={3} size="h4">
                {t("organizedEvents")}
              </Title>
              <Text size="xs" c="dimmed">
                {t("organizedEventsHint")}
              </Text>
            </Stack>
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
                    withBorder
                    radius="xl"
                    p="md"
                    w="100%"
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
          </Stack>
        )}

        <Paper radius="xl" p="lg" bg="gray.1">
          <Title order={4} size="sm" fw={600}>
            {t("connect")}
          </Title>
          <Stack gap="xs" mt="sm">
            <Anchor
              href={`https://instagram.com/${group.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              size="sm"
            >
              <Group gap="xs" wrap="nowrap">
                <Instagram size={16} />
                {group.instagram}
              </Group>
            </Anchor>
            <Anchor href={websiteUrl} target="_blank" rel="noreferrer" size="sm">
              <Group gap="xs" wrap="nowrap">
                <Globe size={16} />
                {group.website}
              </Group>
            </Anchor>
          </Stack>
        </Paper>

        {similar.length > 0 && (
          <Stack gap="md">
            <Title order={3} size="h4">
              {t("similarNearby")}
            </Title>
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
          </Stack>
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
