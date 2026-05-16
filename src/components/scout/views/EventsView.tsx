"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, MapPin, Sparkles } from "lucide-react";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { EventCard } from "../EventCard";
import { EmptyState } from "../EmptyState";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { NightEvent } from "@/types/event";
import type { Borough, BoroughChoice } from "@/types/provider";
import { CdnImage } from "@/components/ui/CdnImage";
import { useEventsCatalog, useNeighborhoodsCatalog } from "@/hooks/useCatalog";
import { BAKED_EVENTS_LISTING_HERO } from "@/config/defaultMedia";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  useDistrictLabel,
  useNeighborhoodLabel,
} from "@/hooks/useVenueDisplay";

interface Props {
  onOpen: (e: NightEvent) => void;
  initialBorough?: BoroughChoice | null;
  initialNeighborhood?: string | null;
}

export function EventsView({
  onOpen,
  initialBorough,
  initialNeighborhood,
}: Props) {
  const t = useTranslations("timedEvents");
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const [borough, setBorough] = useState<BoroughChoice>(
    initialBorough ?? "All",
  );
  const [neighborhood, setNeighborhood] = useState<string | null>(() => {
    const b = initialBorough ?? "All";
    return b === "All" ? null : (initialNeighborhood ?? null);
  });

  useEffect(() => {
    const b = initialBorough ?? "All";
    setBorough(b);
    setNeighborhood(b === "All" ? null : (initialNeighborhood ?? null));
  }, [initialBorough, initialNeighborhood]);

  const { data: events = [], isLoading, isError } = useEventsCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();

  const hoodOptions = useMemo(() => {
    if (borough === "All") return [];
    if (neighborhoodsMap?.[borough as Borough])
      return neighborhoodsMap[borough as Borough]!;
    return FALLBACK_HOODS[borough as Borough] ?? [];
  }, [borough, neighborhoodsMap]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => (borough === "All" ? true : e.borough === borough))
      .filter((e) => (neighborhood ? e.neighborhood === neighborhood : true));
  }, [events, borough, neighborhood]);

  const featured = useMemo(
    () =>
      filtered
        .filter(
          (e) =>
            e.badges.includes("Featured") || e.badges.includes("Staff Pick"),
        )
        .slice(0, 3),
    [filtered],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={t("loadErrorTitle")}
        message={t("loadErrorMessage")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className={cn("relative overflow-hidden", CYBER_PANEL)}>
        <div className="relative grid items-center gap-6 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
              <span className="text-foreground">{t("title")}</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>
          </div>
          <div className="relative ml-auto hidden h-44 w-full max-w-md overflow-hidden rounded-2xl border border-primary/20 md:block">
            <CdnImage fill src={BAKED_EVENTS_LISTING_HERO} alt={t("heroAlt")} />
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <BoroughBar
          value={borough}
          onChange={(b) => {
            setBorough(b);
            setNeighborhood(null);
          }}
        />
        {borough !== "All" && (
          <NeighborhoodChips
            options={hoodOptions}
            value={neighborhood}
            onChange={setNeighborhood}
          />
        )}
      </section>

      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("featured")}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <EventCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          {borough !== "All"
            ? t("resultsIn", {
                count: filtered.length,
                district: districtLabel(borough),
              })
            : t("results", { count: filtered.length })}
          {neighborhood ? ` · ${neighborhoodLabel(neighborhood)}` : ""}
        </h2>
        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("noMatches")}
            message={t("noMatchesHint")}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} onOpen={onOpen} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
