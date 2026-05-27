import { Heart, Share2 } from "@/components/gds/icons";
import Image from "next/image";
import { ActionIcon, AspectRatio, Box, Button } from "@mantine/core";
import { PublicProductCard } from "@/components/gds";
import { useSaved } from "@/store/useScout";
import { notify } from "@/lib/notify";
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
  const cardBadge = groupTypeLabel(group.groupType);
  const age = ageLabel(group.ageRange);
  const cadence = cadenceLabel(group.cadence);
  const location = locationLine(group.borough, group.neighborhood);

  return (
    <PublicProductCard
      title={group.name}
      description={`${group.description} ${cadence} · ${age}`.trim()}
      image={
        <AspectRatio ratio={16 / 9}>
          <Box pos="relative" h="100%">
            <Image
              fill
              src={group.coverImageUrl?.trim() ? group.coverImageUrl : CMS_MEDIA.fallbackMeetup}
              alt={group.name}
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
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
              style={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}
            >
              <Heart size={16} style={{ fill: saved ? "currentColor" : "none" }} />
            </ActionIcon>
          </Box>
        </AspectRatio>
      }
      state="available"
      stateLabels={{ available: cardBadge }}
      metadata={[
        { label: t("hostVenues"), value: location },
        ...(organizerParts.length > 0 ? [{ label: t("organizedEvents"), value: organizerParts.join(" · ") }] : []),
      ]}
      primaryAction={
        <Button size="sm" color="brand" onClick={() => onOpen(group)}>
          {t("viewDetails")}
        </Button>
      }
      secondaryAction={
        <ActionIcon variant="outline" radius="xl" aria-label={t("share")} onClick={() => onShare(group)}>
          <Share2 size={16} />
        </ActionIcon>
      }
    />
  );
}
