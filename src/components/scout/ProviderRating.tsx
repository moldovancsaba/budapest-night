"use client";

import type { Provider } from "@/types/provider";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  provider: Provider;
  variant: "card" | "profile";
  className?: string;
};

export function ProviderRating({ provider, variant, className }: Props) {
  const t = useTranslations("provider");
  const hasScore = provider.rating > 0 || provider.reviewCount > 0;
  if (!hasScore) return null;

  const countLabel =
    provider.reviewCount > 0
      ? variant === "card"
        ? t("reviewsShort", { count: provider.reviewCount })
        : t("reviewsCount", { count: provider.reviewCount })
      : null;

  return (
    <span className={className ?? "flex items-center gap-1 text-sm"}>
      {provider.rating > 0 ? (
        <>
          <Star className="h-4 w-4 fill-foreground text-foreground" aria-hidden />
          <span className="font-semibold text-foreground">{provider.rating}</span>
        </>
      ) : null}
      {countLabel ? (
        <span className="text-muted-foreground">{countLabel}</span>
      ) : null}
      {provider.reviewsSource === "budapest-night" ? (
        <span className="text-xs text-muted-foreground">{t("reviewsSourceBn")}</span>
      ) : null}
      {provider.reviewsSource === "osm" && provider.reviewsProfileUrl ? (
        <a
          href={provider.reviewsProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          {t("reviewsSourceOsm")}
        </a>
      ) : null}
    </span>
  );
}
