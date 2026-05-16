import { useMemo, useState } from "react";
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

interface Props {
  category: Category;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
  initialBorough?: BoroughChoice | null;
  initialNeighborhood?: string | null;
}

export function DiscoverView({ category, onOpen, onShare, initialBorough, initialNeighborhood }: Props) {
  const [borough, setBorough] = useState<BoroughChoice>(initialBorough ?? "All");
  const [neighborhood, setNeighborhood] = useState<string | null>(() => {
    const b = initialBorough ?? "All";
    return b === "All" ? null : (initialNeighborhood ?? null);
  });
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const { data: providers = [], isLoading: loadP, isError: errP } = useProvidersCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();
  const { data: site } = useSiteCatalog();

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
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading listings…</p>
      </div>
    );
  }

  if (errP) {
    return (
      <EmptyState
        icon={MapPin}
        title="Can't load listings"
        message="Check MONGODB_URI and your network. The API returned an error."
      />
    );
  }

  if (providers.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No listings in the database"
        message="Add listings in /admin or run npm run ingest:listing with a curator JSON payload. Ensure MONGODB_URI is set."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-card shadow-card">
        <div className="grid items-center gap-6 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">Your local class scout</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-5xl">
              Discover the best<br />kids activities in Budapest
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Find {category.toLowerCase()}, camps, birthday parties, and drop-in activities by borough and neighborhood. Curated. Local. Built by Parents.
            </p>
          </div>
          <CdnImage
            src={site?.discoverHeroUrl}
            alt="Budapest skyline at night"
            width={1024}
            height={640}
            className="ml-auto hidden h-44 w-full max-w-md rounded-2xl object-cover md:block"
          />
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
        <Filters value={filters} onChange={setFilters} />
      </section>

      {featured.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
              <Sparkles className="h-5 w-5 text-orange" />
              Featured providers
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((p) => (
              <ProviderCard key={p.id} provider={p} onOpen={onOpen} onShare={onShare} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {neighborhood
              ? `${category} in ${neighborhood}`
              : borough === "All"
                ? `${category} across Budapest`
                : `${category} in ${borough}`}
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} results</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No providers here yet"
            message="No providers found here yet. Try another nearby neighborhood or adjust your filters."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProviderCard key={p.id} provider={p} onOpen={onOpen} onShare={onShare} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
