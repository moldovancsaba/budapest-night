"use client";

import { Heart, Share2, Plus, Calendar } from "@/components/gds/icons";
import Image from "next/image";
import { ActionIcon, AspectRatio, Box, Group } from "@mantine/core";
import type { Provider } from "@/types/provider";
import { AppButton, PublicProductCard } from "@/components/gds";
import { useSaved, useCalculator } from "@/store/useScout";
import { notify } from "@/lib/notify";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useActivityTypeLabel,
  useBadgeLabel,
  useFormatVenuePrice,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import { ProviderRating } from "@/components/scout/ProviderRating";
import { useTranslations } from "next-intl";

interface Props {
  provider: Provider;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
}

export function ProviderCard({ provider, onOpen, onShare }: Props) {
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
  const t = useTranslations("venue");
  const activityLabel = useActivityTypeLabel();
  const badgeLabel = useBadgeLabel();
  const locationLine = useVenueLocationLine();
  const formatPrice = useFormatVenuePrice();
  const saved = isSaved(provider.id);
  const price = formatPrice(provider);
  const located = resolveProviderLocation(provider);
  const imageSrc = provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing;
  const cardBadge =
    provider.promotionLabel ??
    (provider.badges[0] ? badgeLabel(provider.badges[0]) : t("listed"));

  return (
    <PublicProductCard
      title={provider.name}
      description={provider.activityTypes.slice(0, 3).map(activityLabel).join(" · ")}
      image={
        <AspectRatio ratio={4 / 3}>
          <Box pos="relative" h="100%">
            <Image
              fill
              src={imageSrc}
              alt={provider.name}
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <ActionIcon
              onClick={(e) => {
                e.stopPropagation();
                toggle(provider.id);
                notify.success(saved ? t("removed") : t("saved"));
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
      price={price.main}
      helperText={price.suffix ?? undefined}
      state="available"
      stateLabels={{ available: cardBadge }}
      metadata={[
        {
          label: t("locationMeta"),
          value: locationLine(located.borough, located.neighborhood),
        },
        ...(located.address
          ? [{ label: t("addressMeta"), value: located.address }]
          : []),
        {
          label: t("ratingMeta"),
          value: <ProviderRating provider={provider} variant="card" />,
        },
      ]}
      primaryAction={
        provider.bookingEnabled ? (
          <AppButton
            onClick={() => onOpen(provider)}
            aria-label={t("reserveAt", { name: provider.name })}
            color="brand"
            size="sm"
          >
            <Calendar size={16} /> {t("reserve")}
          </AppButton>
        ) : (
          <AppButton onClick={() => onOpen(provider)} color="brand" size="sm">
            {t("viewDetails")}
          </AppButton>
        )
      }
      secondaryAction={
        <Group gap="xs" wrap="nowrap">
          <AppButton
            variant="outline"
            aria-label={t("addToBudget")}
            px="sm"
            size="sm"
            onClick={() => {
              add(provider.id);
              notify.success(t("addedToBudget", { name: provider.name }));
            }}
          >
            <Plus size={16} />
          </AppButton>
          <AppButton
            variant="outline"
            aria-label={t("share")}
            px="sm"
            size="sm"
            onClick={() => onShare(provider)}
          >
            <Share2 size={16} />
          </AppButton>
        </Group>
      }
    />
  );
}
