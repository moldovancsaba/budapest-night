import { useMemo, useState } from "react";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { MeetupGroupCard } from "../MeetupGroupCard";
import { EmptyState } from "../EmptyState";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { BoroughChoice } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import { MapPin, Users, Loader2 } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import { useMeetupGroupsCatalog, useNeighborhoodsCatalog, useSiteCatalog } from "@/hooks/useCatalog";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";

interface Props {
  onOpen: (g: MeetupGroup) => void;
  onShare: (g: MeetupGroup) => void;
}

export function MeetupGroupsView({ onOpen, onShare }: Props) {
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm">Loading culture circles…</p>
      </div>
    );
  }

  if (isError || groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No culture circles yet"
        message="Add groups via /admin or seed with npm run db:restore-payloads."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className={cn("relative overflow-hidden neon-border", CYBER_PANEL)}>
        <div className="relative grid items-center gap-6 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Culture & community</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] sm:text-4xl md:text-5xl">
              <span className="neon-text">
                Find your
                <br />
                culture circle
              </span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Gallery walks, food clubs, live culture crews, and local creator meetups across Budapest districts.
            </p>
          </div>
          <CdnImage
            src={site?.discoverHeroUrl || CMS_MEDIA.fallbackMeetup}
            alt="Budapest culture and nightlife crowd"
            width={1024}
            height={640}
            className="ml-auto hidden h-44 w-full max-w-md rounded-2xl border border-accent/20 object-cover ring-1 ring-primary/20 md:block"
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
          <NeighborhoodChips options={hoodOptions} value={neighborhood} onChange={setNeighborhood} />
        )}
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {neighborhood
              ? `Culture circles in ${neighborhood}`
              : borough === "All"
                ? "Culture circles across Budapest"
                : `Culture circles in ${borough}`}
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} groups</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No circles here yet"
            message="Try another district or neighborhood."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((g) => (
              <MeetupGroupCard key={g.id} group={g} onOpen={onOpen} onShare={onShare} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
