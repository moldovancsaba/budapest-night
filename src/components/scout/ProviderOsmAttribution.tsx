"use client";

import type { Provider } from "@/types/provider";
import { Anchor, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

/** Shown when OSM is linked but no published score tags exist yet. */
export function ProviderOsmAttribution({ provider }: { provider: Provider }) {
  const t = useTranslations("venue");
  if (provider.reviewsSource === "budapest-night" && provider.reviewCount > 0) return null;
  if (provider.reviewsSource !== "osm" || !provider.reviewsProfileUrl) return null;
  if (provider.rating > 0 || provider.reviewCount > 0) return null;

  return (
    <Text size="xs" c="dimmed">
      <Anchor
        href={provider.reviewsProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        size="xs"
        c="dimmed"
      >
        {t("listedOnOsm")}
      </Anchor>
    </Text>
  );
}
