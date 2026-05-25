import { Heart, Share2, MapPin, Instagram, CalendarClock } from "@/components/gds/icons";
import { ListingCardMedia, ProductCard } from "@/components/gds";
import { AppButton } from "@/components/gds/AppButton";
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
import { ActionIcon, Badge, Group, Stack, Text } from "@mantine/core";

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
    <ProductCard
      icon={<MeetupLogo group={group} />}
      title={group.name}
      status={
        <Badge radius="xl" variant="light" color="gray" size="sm" tt="uppercase">
          {groupTypeLabel(group.groupType)}
        </Badge>
      }
      description={
        <Stack gap="xs">
          <Group gap={4}>
            <MapPin size={14} />
            <Text size="xs" c="dimmed">
              {locationLine(group.borough, group.neighborhood)}
            </Text>
          </Group>
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
            {organizerParts.length > 0 ? (
              <Badge radius="xl" variant="outline" color="gray" size="sm">
                {organizerParts.join(" · ")}
              </Badge>
            ) : null}
          </Group>
        </Stack>
      }
      media={
        <ListingCardMedia
          src={group.coverImageUrl?.trim() ? group.coverImageUrl : CMS_MEDIA.fallbackMeetup}
          alt={group.name}
          height={144}
          overlays={
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                toggle(group.id);
                notify.success(saved ? t("unsave") : t("save"));
              }}
              aria-label={saved ? t("unsave") : t("save")}
              variant="filled"
              color="dark"
              radius="xl"
              style={{ position: "absolute", top: 12, right: 12 }}
            >
              <Heart size={16} style={{ fill: saved ? "currentColor" : "none" }} />
            </ActionIcon>
          }
        />
      }
      secondaryActions={[{ label: t("share"), onClick: () => onShare(group) }]}
      footer={
        <Stack gap="sm" w="100%">
          {group.instagram ? (
            <Group
              py="xs"
              style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
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
          <Group gap="xs" w="100%">
            <AppButton onClick={() => onOpen(group)} color="brand" style={{ flex: 1 }}>
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
        </Stack>
      }
    />
  );
}
