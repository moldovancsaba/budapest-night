import { Heart, Share2, MapPin, Instagram, CalendarClock } from "lucide-react";
import Image from "next/image";
import { ActionIcon, Badge, Card, Group, Stack, Text } from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";
import { useSaved } from "@/store/useScout";
import { notify } from "@/lib/notify";
import { MeetupLogo } from "./MeetupLogo";
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import {
  useAgeRangeLabel,
  useMeetupCadenceLabel,
  useMeetupGroupTypeLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { CMS_MEDIA } from "@/config/defaultMedia";

interface Props {
  group: PublicMeetupGroup;
  onOpen: (g: PublicMeetupGroup) => void;
  onShare: (g: PublicMeetupGroup) => void;
}

export function MeetupGroupCard({ group, onOpen, onShare }: Props) {
  const t = useTranslations("meetup");
  const { isSaved, toggle } = useSaved();
  const locationLine = useVenueLocationLine();
  const groupTypeLabel = useMeetupGroupTypeLabel();
  const cadenceLabel = useMeetupCadenceLabel();
  const ageLabel = useAgeRangeLabel();
  const saved = isSaved(group.id);
  const venueCount = group.venueIds?.length ?? group.venues.length;
  const eventCount = group.eventIds?.length ?? group.events.length;
  const organizerParts = [
    venueCount > 0 ? t("linkedVenuesCount", { count: venueCount }) : null,
    eventCount > 0 ? t("linkedEventsCount", { count: eventCount }) : null,
  ].filter(Boolean);

  return (
    <Card radius="xl" p={0} withBorder style={{ overflow: "hidden" }}>
      <Card.Section>
        <div style={{ position: "relative", height: 144, overflow: "hidden" }}>
          <Image
            fill
            src={group.coverImageUrl?.trim() ? group.coverImageUrl : CMS_MEDIA.fallbackMeetup}
            alt={group.name}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Card.Section>
      <Group align="flex-start" justify="space-between" gap="md" p="lg" pb="sm">
        <Group align="flex-start" gap="md">
          <MeetupLogo group={group} />
          <Stack gap={4}>
            <Badge radius="xl" variant="light" color="gray" size="sm" tt="uppercase">
              {groupTypeLabel(group.groupType)}
            </Badge>
            <AppButton onClick={() => onOpen(group)} variant="subtle" px={0} justify="flex-start" color="gray">
              <Text fw={600} size="lg" lh={1.2} ta="left">
                {group.name}
              </Text>
            </AppButton>
            <Group gap={4}>
              <MapPin size={14} />
              <Text size="xs" c="dimmed">
              {locationLine(group.borough, group.neighborhood)}
              </Text>
            </Group>
          </Stack>
        </Group>
        <ActionIcon
          onClick={(e) => {
            e.stopPropagation();
            toggle(group.id);
            notify.success(saved ? t("unsave") : t("save"));
          }}
          aria-label={saved ? t("unsave") : t("save")}
          variant="light"
          color="gray"
          radius="xl"
        >
          <Heart size={16} style={{ fill: saved ? "currentColor" : "none" }} />
        </ActionIcon>
      </Group>

      <Stack gap="sm" px="lg" style={{ flex: 1 }}>
        <Text size="sm" lh={1.6} c="dimmed">
          {group.description}
        </Text>

        <Group gap={6}>
          <Badge radius="xl" variant="light" color="gray" size="sm">
            {ageLabel(group.ageRange)}
          </Badge>
          <Badge radius="xl" variant="outline" color="gray" size="sm" leftSection={<CalendarClock size={12} />}>
            {cadenceLabel(group.cadence)}
          </Badge>
          {organizerParts.length > 0 && (
            <Badge radius="xl" variant="outline" color="gray" size="sm">
              {organizerParts.join(" · ")}
            </Badge>
          )}
        </Group>
      </Stack>

      {group.instagram ? (
        <Group
          px="lg"
          py="sm"
          style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}
        >
          <a
            href={`https://instagram.com/${group.instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12 }}
          >
            <Instagram size={14} />
            {group.instagram}
          </a>
        </Group>
      ) : null}

      <Group gap="xs" px="lg" pb="lg">
        <AppButton
          onClick={() => onOpen(group)}
          color="brand"
          style={{ flex: 1 }}
        >
          {t("viewDetails")}
        </AppButton>
        <AppButton
          variant="outline"
          aria-label={t("share")}
          px="sm"
          onClick={() => onShare(group)}
        >
          <Share2 size={16} />
        </AppButton>
      </Group>
    </Card>
  );
}
