"use client";

import type { Provider } from "@/types/provider";
import { useTranslations } from "next-intl";

/** Shown when OSM is linked but no published score tags exist yet. */
export function ProviderOsmAttribution({ provider }: { provider: Provider }) {
  const t = useTranslations("provider");
  if (provider.reviewsSource === "budapest-night" && provider.reviewCount > 0) return null;
  if (provider.reviewsSource !== "osm" || !provider.reviewsProfileUrl) return null;
  if (provider.rating > 0 || provider.reviewCount > 0) return null;

  return (
    <p className="text-xs text-muted-foreground">
      <a
        href={provider.reviewsProfileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:text-foreground hover:underline"
      >
        {t("listedOnOsm")}
      </a>
    </p>
  );
}
