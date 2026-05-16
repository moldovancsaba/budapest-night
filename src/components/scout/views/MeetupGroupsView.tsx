import { useMemo, useState } from "react";
import { BoroughBar } from "../BoroughBar";
import { NeighborhoodChips } from "../NeighborhoodChips";
import { MeetupGroupCard } from "../MeetupGroupCard";
import { EmptyState } from "../EmptyState";
import { NEIGHBORHOODS as FALLBACK_HOODS } from "@/data/locations";
import type { BoroughChoice } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import { MapPin, Users, Loader2 } from "lucide-react";
import { useMeetupGroupsCatalog, useNeighborhoodsCatalog } from "@/hooks/useCatalog";

interface Props {
  onOpen: (g: MeetupGroup) => void;
  onShare: (g: MeetupGroup) => void;
}

export function MeetupGroupsView({ onOpen, onShare }: Props) {
  const [borough, setBorough] = useState<BoroughChoice>("All");
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const { data: groups = [], isLoading, isError } = useMeetupGroupsCatalog();
  const { data: neighborhoodsMap } = useNeighborhoodsCatalog();

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
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading meet-up groups…</p>
      </div>
    );
  }

  if (isError || groups.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No meet-up groups in the database"
        message="Seed MongoDB (npm run db:seed) or add groups in /admin."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-card shadow-card">
        <div className="grid items-center gap-6 p-8 sm:p-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">Local parent community</p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl md:text-5xl">
              Find your local<br />parent meet-up group
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Discover mom groups, playdate circles, and neighborhood family meetups across NYC. Curated. Local. Built by Parents.
            </p>
          </div>
          <div className="ml-auto hidden h-44 w-full max-w-md place-items-center rounded-2xl bg-teal-soft md:grid">
            <Users className="h-16 w-16 text-teal" strokeWidth={1.5} />
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
            {neighborhood
              ? `Meet-up groups in ${neighborhood}`
              : borough === "All"
                ? "Meet-up groups across NYC"
                : `Meet-up groups in ${borough}`}
          </h2>
          <span className="text-sm text-muted-foreground">{filtered.length} groups</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No meet-up groups yet"
            message="No meet-up groups added here yet. Try another nearby neighborhood."
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
