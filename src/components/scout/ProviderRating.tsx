"use client";

import type { Provider } from "@/types/provider";
import { Star } from "@/components/gds/icons";
import { Anchor, Group, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

type Props = {
  provider: Provider;
  variant: "card" | "profile";
};

export function ProviderRating({ provider, variant }: Props) {
  const t = useTranslations("venue");
  const hasScore = provider.rating > 0 || provider.reviewCount > 0;
  if (!hasScore) return null;

  const countLabel =
    provider.reviewCount > 0
      ? variant === "card"
        ? t("reviewsShort", { count: provider.reviewCount })
        : t("reviewsCount", { count: provider.reviewCount })
      : null;

  return (
    <Group gap={6} align="center" wrap="nowrap">
      {provider.rating > 0 ? (
        <>
          <Star
            size={16}
            fill="var(--mantine-color-text)"
            color="var(--mantine-color-text)"
            aria-hidden
          />
          <Text component="span" size="sm" fw={600}>
            {provider.rating}
          </Text>
        </>
      ) : null}
      {countLabel ? (
        <Text component="span" size="sm" c="dimmed">
          {countLabel}
        </Text>
      ) : null}
      {provider.reviewsSource === "budapest-night" ? (
        <Text component="span" size="xs" c="dimmed">
          {t("reviewsSourceBn")}
        </Text>
      ) : null}
      {provider.reviewsSource === "osm" && provider.reviewsProfileUrl ? (
        <Anchor
          href={provider.reviewsProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          c="dimmed"
        >
          {t("reviewsSourceOsm")}
        </Anchor>
      ) : null}
    </Group>
  );
}
