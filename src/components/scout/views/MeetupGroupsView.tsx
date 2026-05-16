import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { MeetupGroupCard } from "../MeetupGroupCard";
import { EmptyState } from "../EmptyState";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { BoroughChoice } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import { MapPin, Users, Loader2 } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import {
  useMeetupGroupsCatalog,
  useNeighborhoodsCatalog,
  useSiteCatalog,
} from "@/hooks/useCatalog";
import {
  useDistrictLabel,
  useNeighborhoodLabel,
} from "@/hooks/useVenueDisplay";
import { cultureDiscoverHero } from "@/config/defaultMedia";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";

interface Props {
  onOpen: (g: MeetupGroup) => void;
  onShare: (g: MeetupGroup) => void;
}

export function MeetupGroupsView({ onOpen, onShare }: Props) {
  const t = useTranslations("meetup");
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const [borough, setBorough] = useState<BoroughChoice>("All");
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const { data: groups = [], isLoading, isError } = useMeetupGroupsCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();
  const { data: site } = useSiteCatalog();

  const hoodOptions = useMemo(() => {
    if (borough === "All") return [];
    if (neighborhoodsMap?.[borough]) return neighborhoodsMap[borough];
    return FALLBACK_HOODS[borough] ?? [];
  }, [borough, neighborhoodsMap]);

  const filtered = useMemo(
    () =>
      groups
        .filter((g) => (borough === "All" ? true : g.borough === borough))
        .filter((g) => (neighborhood ? g.neighborhood === neighborhood : true)),
    [groups, borough, neighborhood],
  );

  const listTitle = neighborhood
    ? t("listInNeighborhood", { place: neighborhoodLabel(neighborhood) })
    : borough === "All"
      ? t("listAll")
      : t("listInDistrict", { district: districtLabel(borough) });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (isError || groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t("seedEmptyTitle")}
        message={t("seedEmptyMessage")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className={cn("relative overflow-hidden", CYBER_PANEL)}>
        <div className="relative grid items-center gap-6 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("pageEyebrow")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
              <span className="text-foreground">
                {t("heroTitleLine1")}
                <br />
                {t("heroTitleLine2")}
              </span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>
          </div>
          <div className="relative ml-auto hidden h-44 w-full max-w-md overflow-hidden rounded-2xl border border-primary/20 md:block">
            <CdnImage
              fill
              src={cultureDiscoverHero(site?.cultureHeroUrl)}
              alt={t("heroImageAlt")}
            />
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

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {listTitle}
          </h2>
          <span className="text-sm text-muted-foreground">
            {t("groupCount", { count: filtered.length })}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t("filterEmptyTitle")}
            message={t("filterEmptyMessage")}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((g) => (
              <MeetupGroupCard
                key={g.id}
                group={g}
                onOpen={onOpen}
                onShare={onShare}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
