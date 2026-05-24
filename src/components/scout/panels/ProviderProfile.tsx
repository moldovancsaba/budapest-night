"use client";

import {
  ActionIcon,
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
import { AppButton } from "@/components/mantine/AppButton";
import type { Provider } from "@/types/provider";
import {
  Heart,
  Plus,
  Mail,
  Globe,
  Phone,
  MapPin,
  MessageCircle,
  Megaphone,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSaved, useCalculator } from "@/store/useScout";
import { notify } from "@/lib/notify";
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
import { buildProgramPath } from "@/lib/appPaths";
import { Link } from "@/i18n/routing";
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
  const tProgram = useTranslations("program");
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
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
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
  const saved = isSaved(provider.id);
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
                        : "rgba(255,255,255,0.8)",
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
          <Paper withBorder radius="xl" p="md">
            <Group align="flex-start" gap="md" wrap="nowrap">
              <ActionIcon variant="light" color="gray" radius="xl" size="lg">
                <Megaphone size={16} />
              </ActionIcon>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text size="sm" fw={600}>
                  {provider.announcementTitle}
                </Text>
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
          </Paper>
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
          <Stack gap="sm">
            <Title order={3} size="h4">
              {tMenu("title")}
            </Title>
            <VenueMenuPanel provider={provider} />
          </Stack>
        )}

        {venueEvents.length > 0 && (
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={3} size="h4">
                {t("upcomingEvents")}
              </Title>
              <Text size="xs" c="dimmed">
                {t("upcomingEventsHint")}
              </Text>
            </Stack>
            <SimpleGrid cols={isPage ? pageCardCols : 1} spacing="md">
              {venueEvents.map((event) => (
                <EventCard key={event.id} event={event} onOpen={onOpenEvent} />
              ))}
            </SimpleGrid>
          </Stack>
        )}

        <SimpleGrid cols={2} spacing="xs">
          {provider.bookingEnabled && (
            <Box style={{ gridColumn: "1 / -1" }}>
              <AppButton
                w="100%"
                aria-label={t("reserveAt", { name: provider.name })}
                onClick={() => notify.success(t("bookingSoon"))}
              >
                <Group gap="xs" wrap="nowrap" justify="center">
                  <Calendar size={16} />
                  {t("reserve")}
                </Group>
              </AppButton>
            </Box>
          )}
          <AppButton
            onClick={() => {
              add(provider.id);
              notify.success(t("addedToBudget", { name: provider.name }));
            }}
          >
            <Group gap="xs" wrap="nowrap" justify="center">
              <Plus size={16} />
              {t("addToBudget")}
            </Group>
          </AppButton>
          <AppButton
            variant="outline"
            onClick={() => {
              toggle(provider.id);
              notify.success(saved ? t("removed") : t("saved"));
            }}
          >
            <Group gap="xs" wrap="nowrap" justify="center">
              <Heart size={16} fill={saved ? "currentColor" : "none"} />
              {saved ? t("saved") : t("save")}
            </Group>
          </AppButton>
          <AppButton variant="outline" onClick={shareEmail}>
            <Group gap="xs" wrap="nowrap" justify="center">
              <Mail size={16} />
              {t("shareEmail")}
            </Group>
          </AppButton>
          <AppButton variant="outline" onClick={shareWhatsapp}>
            <Group gap="xs" wrap="nowrap" justify="center">
              <MessageCircle size={16} />
              {t("shareWhatsapp")}
            </Group>
          </AppButton>
        </SimpleGrid>

        <Paper radius="xl" p="lg" bg="gray.1">
          <Title order={4} size="sm" fw={600}>
            {t("contactVenue")}
          </Title>
          <Stack gap="xs" mt="sm">
            <Anchor href={`mailto:${provider.email}`} size="sm">
              <Group gap="xs" wrap="nowrap">
                <Mail size={16} />
                {provider.email}
              </Group>
            </Anchor>
            <Anchor href={provider.website} target="_blank" rel="noreferrer" size="sm">
              <Group gap="xs" wrap="nowrap">
                <Globe size={16} />
                {provider.website}
              </Group>
            </Anchor>
            {provider.externalProgramUrl ? (
              <Anchor
                href={provider.externalProgramUrl}
                target="_blank"
                rel="noreferrer"
                size="sm"
              >
                <Group gap="xs" wrap="nowrap">
                  <Globe size={16} />
                  {tProgram("officialProgram")}
                </Group>
              </Anchor>
            ) : null}
            {provider.repertoireUrl ? (
              <Anchor href={provider.repertoireUrl} target="_blank" rel="noreferrer" size="sm">
                <Group gap="xs" wrap="nowrap">
                  <Globe size={16} />
                  {tProgram("repertoire")}
                </Group>
              </Anchor>
            ) : null}
            <Anchor component={Link} href={buildProgramPath(undefined, { locale })} size="sm" fw={500}>
              {tProgram("moreThisWeek")}
            </Anchor>
            <Anchor href={`tel:${provider.phone}`} size="sm">
              <Group gap="xs" wrap="nowrap">
                <Phone size={16} />
                {provider.phone}
              </Group>
            </Anchor>
          </Stack>
        </Paper>

        <Paper withBorder radius="xl" p="md">
          <Text size="sm" fw={600}>
            {tProgram("qrTitle")}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {tProgram("qrHint")}
          </Text>
          <Group gap="md" mt="sm" align="flex-start">
            <Box
              component="img"
              src={`/api/public/providers/${encodeURIComponent(provider.id)}/qr?locale=${locale}&size=200`}
              alt=""
              width={120}
              height={120}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                border: "1px solid var(--mantine-color-default-border)",
                background: "white",
                padding: 8,
              }}
            />
            <Anchor
              href={`/api/public/providers/${encodeURIComponent(provider.id)}/qr?locale=${locale}&size=400`}
              download={`pestiest-${provider.id}-qr.svg`}
              size="sm"
              fw={500}
            >
              {tProgram("qrDownload")}
            </Anchor>
          </Group>
          {(provider.partnerTier === "listed" ||
            provider.partnerTier === "partner" ||
            provider.isPromoted) && (
            <Text size="xs" fw={500} c="brand" mt="xs">
              {tProgram("partnerBadge")}
            </Text>
          )}
        </Paper>

        <ProviderMap address={provider.address} borough={provider.borough} />

        {similar.length > 0 && (
          <Stack gap="md">
            <Title order={3} size="h4">
              {t("moreNearby")}
            </Title>
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
          </Stack>
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
