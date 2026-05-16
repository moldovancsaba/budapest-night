import { useEffect, useMemo, useState } from "react";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { Filters, EMPTY_FILTERS, type FilterState } from "../Filters";
import { ProviderCard } from "../ProviderCard";
import { EmptyState } from "../EmptyState";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { BoroughChoice, Provider, Category } from "@/types/provider";
import { MapPin, Sparkles, Loader2 } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import { useProvidersCatalog, useNeighborhoodsCatalog, useSiteCatalog } from "@/hooks/useCatalog";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCategoryLabel, useDistrictLabel, useNeighborhoodLabel } from "@/hooks/useVenueDisplay";
import { useDiscoverChrome } from "@/hooks/useLocalizedSiteCopy";
import { discoverHeroForCategory } from "@/config/defaultMedia";

interface Props {
  category: Category;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
  initialBorough?: BoroughChoice | null;
  initialNeighborhood?: string | null;
}

export function DiscoverView({ category, onOpen, onShare, initialBorough, initialNeighborhood }: Props) {
  const t = useTranslations("discover");
  const categoryLabel = useCategoryLabel();
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const [borough, setBorough] = useState<BoroughChoice>(initialBorough ?? "All");
  const [neighborhood, setNeighborhood] = useState<string | null>(() => {
    const b = initialBorough ?? "All";
    return b === "All" ? null : (initialNeighborhood ?? null);
  });
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  useEffect(() => {
    const b = initialBorough ?? "All";
    setBorough(b);
    setNeighborhood(b === "All" ? null : (initialNeighborhood ?? null));
  }, [category, initialBorough, initialNeighborhood]);

  const { data: providers = [], isLoading: loadP, isError: errP } = useProvidersCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();
  const { data: site } = useSiteCatalog();
  const discoverChrome = useDiscoverChrome();
  const heroSrc = discoverHeroForCategory(category, site?.discoverHeroByCategory?.[category]);

  const hoodOptions = useMemo(() => {
    if (borough === "All") return [];
    if (neighborhoodsMap?.[borough]) return neighborhoodsMap[borough];
    return FALLBACK_HOODS[borough] ?? [];
  }, [borough, neighborhoodsMap]);

  const filtered = useMemo(() => {
    return providers
      .filter((p) => p.category === category)
      .filter((p) => (borough === "All" ? true : p.borough === borough))
      .filter((p) => (neighborhood ? p.neighborhood === neighborhood : true))
      .filter((p) => (filters.ages.length ? p.ageRanges.some((a) => filters.ages.includes(a)) : true))
      .filter((p) => (filters.times.length ? p.dayTimeTags.some((t) => filters.times.includes(t)) : true))
      .filter((p) => (filters.activity ? p.activityTypes.includes(filters.activity) : true));
  }, [providers, category, borough, neighborhood, filters]);

  const featured = useMemo(
    () => filtered.filter((p) => p.badges.includes("Featured") || p.badges.includes("Staff Pick")).slice(0, 3),
    [filtered],
  );

  if (loadP) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (errP) {
    return (
      <EmptyState
        icon={MapPin}
        title={t("loadErrorTitle")}
        message={t("loadErrorMessage")}
      />
    );
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title={t("noDb")}
        message={t("noDbHint")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className={cn("relative overflow-hidden neon-border", CYBER_PANEL)}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(310_100%_50%_/_0.1),transparent_55%)]" />
        <div className="relative grid items-center gap-6 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {discoverChrome.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
              <span className="neon-text">{t("title", { category: categoryLabel(category) })}</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("findByArea", { blurb: t(`blurb.${category}`) })} {discoverChrome.tagline}
            </p>
          </div>
          <div className="relative ml-auto hidden h-44 w-full max-w-md overflow-hidden rounded-2xl border border-accent/20 ring-1 ring-primary/20 md:block">
            <CdnImage fill src={heroSrc} alt={t(`heroAlt.${category}`)} />
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
          <NeighborhoodChips options={hoodOptions} value={neighborhood} onChange={setNeighborhood} />
        )}
        <Filters value={filters} onChange={setFilters} />
      </section>

      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">{t("featured")}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProviderCard key={p.id} provider={p} onOpen={onOpen} onShare={onShare} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
          {borough !== "All"
            ? t("resultsIn", { count: filtered.length, district: districtLabel(borough) })
            : t("results", { count: filtered.length })}
          {neighborhood ? ` · ${neighborhoodLabel(neighborhood)}` : ""}
        </h2>
        {filtered.length === 0 ? (
          <EmptyState icon={MapPin} title={t("noMatches")} message={t("noMatchesHint")} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProviderCard key={p.id} provider={p} onOpen={onOpen} onShare={onShare} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
