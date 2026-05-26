"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Drawer,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { AccentPanel, SectionPanel } from "@/components/gds";
import { VenueContactSection } from "@/components/scout/detail/VenueContactSection";
import { VenueProfileActions } from "@/components/scout/detail/VenueProfileActions";
import { VenueQrSection } from "@/components/scout/detail/VenueQrSection";
import type { Provider } from "@/types/provider";
import {
  MapPin,
  Megaphone,
  X,
  ChevronLeft,
  ChevronRight,
} from "@/components/gds/icons";
import { useMemo, useState } from "react";
import { useEventsCatalog, useProvidersCatalog } from "@/hooks/useCatalog";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { eventsForVenue } from "@/lib/eventsAtVenue";
import { EventCard } from "@/components/scout/EventCard";
import { ProviderCard } from "../ProviderCard";
import { ProviderMap } from "./ProviderMap";
import { VenueMenuPanel } from "@/components/scout/VenueMenuPanel";
import { ProviderRating } from "@/components/scout/ProviderRating";
import { ProviderOsmAttribution } from "@/components/scout/ProviderOsmAttribution";
import { VenueReviewsPanel } from "@/components/scout/VenueReviewsPanel";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useCategoryLabel,
  useDayTimeLabel,
  useFormatVenuePrice,
  useVenueShareSummary,
} from "@/hooks/useVenueDisplay";
import { useLocale, useTranslations } from "next-intl";
import { buildAbsoluteVenueUrl } from "@/lib/appShareUrls";
import { JsonLd, localBusinessJsonLd } from "@/components/seo/JsonLd";
import type { AppLocale } from "@/i18n/config";
import { ResolvedCoverImage } from "../ResolvedCoverImage";

export function ProviderProfile({
  provider,
  onClose,
  onShare,
  onOpenAnother,
  onOpenEvent,
  variant = "sheet",
}: {
  provider: Provider | null;
  onClose: () => void;
  onShare: (p: Provider) => void;
  onOpenAnother: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  variant?: "sheet" | "page";
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("venue");
  const tMenu = useTranslations("menu");
  const categoryLabel = useCategoryLabel();
  const activityLabel = useActivityTypeLabel();
  const ageLabel = useAgeRangeLabel();
  const dayLabel = useDayTimeLabel();
  const badgeLabel = useBadgeLabel();
  const formatPrice = useFormatVenuePrice();
  const shareSummary = useVenueShareSummary();
  const { data: allProviders = [] } = useProvidersCatalog();
  const { data: allEvents = [] } = useEventsCatalog();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [bannerOpen, setBannerOpen] = useState(true);
  const gallery = useMemo(() => {
    if (!provider) return [];
    const urls: string[] = [];
    const seen = new Set<string>();
    const addUrl = (raw?: string) => {
      const u = resolveImageUrl(raw, provider.website);
      if (!u || seen.has(u)) return;
      seen.add(u);
      urls.push(u);
    };
    addUrl(provider.image);
    for (const g of provider.galleryImages ?? []) addUrl(g);
    if (urls.length === 0) urls.push(CMS_MEDIA.fallbackListing);
    return urls;
  }, [provider]);

  const venueEvents = useMemo(() => {
    if (!provider) return [];
    return eventsForVenue(allEvents, provider.id);
  }, [allEvents, provider]);

  if (!provider) return null;

  const isPage = variant === "page";
  const price = formatPrice(provider);
  const current =
    gallery.length > 0
      ? gallery[Math.min(photoIdx, gallery.length - 1)]
      : undefined;

  const similarLimit = isPage ? 10 : 3;
  const similar = allProviders
    .filter(
      (p) =>
        p.id !== provider.id &&
        p.borough === provider.borough &&
        p.category === provider.category,
    )
    .slice(0, similarLimit);

  const shareUrl = buildAbsoluteVenueUrl(provider, locale);

  const pageCardCols = { base: 1, sm: 2, lg: 3, xl: 4 };

  const shareEmail = () => {
    const body = `${shareSummary(provider)}\n\n${shareUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(t("shareTitle", { name: provider.name }))}&body=${encodeURIComponent(body)}`,
    );
  };
  const shareWhatsapp = () => {
    const text = `${shareSummary(provider)} ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const content = (
    <>
      <Box pos="relative" h={isPage ? 320 : 256} style={{ overflow: "hidden" }}>
        <ResolvedCoverImage src={current} resolveBase={provider.website} alt={provider.name} />
        {provider.badges[0] && (
          <Badge
            radius="xl"
            variant="filled"
            color="dark"
            tt="uppercase"
            size="sm"
            style={{ position: "absolute", top: 20, left: 20 }}
          >
            {badgeLabel(provider.badges[0])}
          </Badge>
        )}
        {gallery.length > 1 && (
          <>
            <ActionIcon
              variant="filled"
              color="gray"
              radius="xl"
              size="lg"
              onClick={() =>
                setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length)
              }
              aria-label={t("prevPhoto")}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ChevronLeft size={16} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="gray"
              radius="xl"
              size="lg"
              onClick={() => setPhotoIdx((i) => (i + 1) % gallery.length)}
              aria-label={t("nextPhoto")}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <ChevronRight size={16} />
            </ActionIcon>
            <Badge
              radius="xl"
              variant="filled"
              color="dark"
              size="sm"
              style={{ position: "absolute", top: 12, right: 12, opacity: 0.85 }}
            >
              {t("photoCounter", {
                current: photoIdx + 1,
                total: gallery.length,
              })}
            </Badge>
            <Group
              gap={6}
              justify="center"
              style={{
                position: "absolute",
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {gallery.map((_, i) => (
                <Box
                  key={i}
                  component="button"
                  type="button"
                  onClick={() => setPhotoIdx(i)}
                  aria-label={t("goToPhoto", { n: i + 1 })}
                  style={{
                    height: 8,
                    borderRadius: 9999,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: i === photoIdx ? 24 : 8,
                    background:
                      i === photoIdx
                        ? "var(--mantine-color-dark-filled)"
                        : "var(--mantine-color-gray-3)",
                    transition: "width 150ms ease",
                  }}
                />
              ))}
            </Group>
          </>
        )}
      </Box>

      <Stack gap="xl" p="lg" pb={48}>
        {provider.announcementTitle && bannerOpen && (
          <AccentPanel tone="gray" variant="soft-outline" title={provider.announcementTitle}>
            <Group align="flex-start" gap="md" wrap="nowrap">
              <ActionIcon variant="light" color="gray" radius="xl" size="lg">
                <Megaphone size={16} />
              </ActionIcon>
              <Stack gap={4} style={{ flex: 1 }}>
                {provider.announcementDescription ? (
                  <Text size="xs" c="dimmed">
                    {provider.announcementDescription}
                  </Text>
                ) : null}
              </Stack>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => setBannerOpen(false)}
                aria-label={t("dismissAnnouncement")}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
          </AccentPanel>
        )}

        {gallery.length > 1 && (
          <Group gap="xs" style={{ overflowX: "auto" }}>
            {gallery.map((src, i) => (
              <Box
                key={i}
                component="button"
                type="button"
                onClick={() => setPhotoIdx(i)}
                aria-label={t("viewPhoto", { n: i + 1 })}
                style={{
                  position: "relative",
                  height: 64,
                  width: 96,
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: "var(--mantine-radius-md)",
                  border: `2px solid ${i === photoIdx ? "var(--mantine-color-dark-filled)" : "transparent"}`,
                  opacity: i === photoIdx ? 1 : 0.7,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <ResolvedCoverImage
                  src={src}
                  resolveBase={provider.website}
                  alt={`${provider.name} photo ${i + 1}`}
                />
              </Box>
            ))}
          </Group>
        )}

        <Stack gap="xs">
          <Text size="xs" fw={600} tt="uppercase" lts="0.18em" c="dimmed">
            {categoryLabel(provider.category)}
          </Text>
          <Title order={2} size="h2">
            {provider.name}
          </Title>
          <Group gap={6} wrap="nowrap">
            <MapPin size={16} style={{ flexShrink: 0 }} />
            <Text size="sm" c="dimmed">
              {provider.address}
            </Text>
          </Group>
          <Group gap="md" align="center">
            <ProviderRating provider={provider} variant="profile" />
            {provider.reviewCount > 0 ? (
              <Text c="dimmed" aria-hidden>
                |
              </Text>
            ) : null}
            <Text size="md">
              <Text component="span" fw={700}>
                {price.main}
              </Text>
              {price.suffix ? (
                <Text component="span" size="xs" c="dimmed">
                  {price.suffix}
                </Text>
              ) : null}
            </Text>
          </Group>
        </Stack>

        <Group gap="xs">
          {provider.activityTypes.map((tag) => (
            <Badge key={tag} radius="xl" variant="light" color="gray">
              {activityLabel(tag)}
            </Badge>
          ))}
          {provider.ageRanges.map((a) => (
            <Badge key={a} radius="xl" variant="light" color="gray">
              {ageLabel(a)}
            </Badge>
          ))}
          {provider.dayTimeTags.map((d) => (
            <Badge key={d} radius="xl" variant="outline" color="gray">
              {dayLabel(d)}
            </Badge>
          ))}
        </Group>

        <Text size="sm" lh={1.6}>
          {provider.longDescription}
        </Text>
        <ProviderOsmAttribution provider={provider} />

        <VenueReviewsPanel provider={provider} />

        {(provider.menu?.sections?.length ||
          (provider.eventOfferings?.length ?? 0) > 0) && (
          <SectionPanel title={tMenu("title")}>
            <VenueMenuPanel provider={provider} />
          </SectionPanel>
        )}

        {venueEvents.length > 0 && (
          <SectionPanel
            title={t("upcomingEvents")}
            description={t("upcomingEventsHint")}
          >
            <SimpleGrid cols={isPage ? pageCardCols : 1} spacing="md">
              {venueEvents.map((event) => (
                <EventCard key={event.id} event={event} onOpen={onOpenEvent} />
              ))}
            </SimpleGrid>
          </SectionPanel>
        )}

        <VenueProfileActions
          provider={provider}
          onShareEmail={shareEmail}
          onShareWhatsapp={shareWhatsapp}
        />

        <VenueContactSection provider={provider} />
        <VenueQrSection provider={provider} />
        <ProviderMap address={provider.address} borough={provider.borough} />

        {similar.length > 0 && (
          <SectionPanel title={t("moreNearby")}>
            <SimpleGrid cols={isPage ? pageCardCols : { base: 1, sm: 2 }} spacing="md">
              {similar.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  onOpen={onOpenAnother}
                  onShare={onShare}
                />
              ))}
            </SimpleGrid>
          </SectionPanel>
        )}
      </Stack>
    </>
  );

  if (isPage && provider) {
    const url = buildAbsoluteVenueUrl(provider, locale);
    return (
      <>
        <JsonLd
          data={localBusinessJsonLd({
            name: provider.name,
            description: provider.shortDescription,
            address: provider.address,
            url,
            telephone: provider.phone,
            activityTypes: provider.activityTypes,
          })}
        />
        <Box style={{ overflowY: "auto" }}>{content}</Box>
      </>
    );
  }

  return (
    <Drawer
      opened={!!provider}
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
