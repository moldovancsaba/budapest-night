"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildProgramPath, buildSectionPath } from "@/lib/appPaths";
import { PROGRAM_VERTICALS } from "@/lib/programVerticals";
import { useProgramWeek } from "@/hooks/useProgramWeek";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { EventCard } from "@/components/scout/EventCard";
import { ProviderCard } from "@/components/scout/ProviderCard";
import { BOROUGHS } from "@/data/locations";
import { useDistrictLabel } from "@/hooks/useVenueDisplay";

type Props = {
  onOpenProvider: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  onShareProvider: (p: Provider) => void;
};

export function ProgramWeekView({ onOpenProvider, onOpenEvent, onShareProvider }: Props) {
  const t = useTranslations("program");
  const districtLabel = useDistrictLabel();
  const { data, isLoading, isError } = useProgramWeek();

  if (isLoading) {
    return <p className="text-muted-foreground">…</p>;
  }
  if (isError || !data) {
    return <p className="text-muted-foreground">{t("weekSubtitle")}</p>;
  }

  const { week, featuredEvents, featuredProviders, fallbackEventCount } = data;

  return (
    <div className="space-y-10">
      <header className="rounded-[2rem] border border-border bg-card px-6 py-10 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("thuNote")}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
          {week.headline || t("weekTitle")}
        </h1>
        {week.intro ? (
          <p className="mt-4 max-w-2xl text-muted-foreground">{week.intro}</p>
        ) : (
          <p className="mt-4 max-w-2xl text-muted-foreground">{t("weekSubtitle")}</p>
        )}
        {week.sponsorName ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {week.sponsorUrl ? (
              <a href={week.sponsorUrl} className="underline" target="_blank" rel="noreferrer">
                {week.sponsorName}
              </a>
            ) : (
              week.sponsorName
            )}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-muted-foreground">
          {t("eventsThisWeek", { count: fallbackEventCount })}
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">{t("verticalsTitle")}</h2>
        <div className="flex flex-wrap gap-2">
          {PROGRAM_VERTICALS.map((v) => (
            <Link key={v.id} href={buildProgramPath(v.id)}>
              <Button variant="outline" className="rounded-full">
                {t(`vertical.${v.id}`)}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {featuredEvents.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold">
              <CalendarDays className="h-5 w-5" />
              {t("featuredEvents")}
            </h2>
            <Link href={buildSectionPath("events")}>
              <Button variant="ghost" size="sm" className="rounded-full">
                {t("browseAllEvents")} →
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
            ))}
          </div>
        </section>
      )}

      {featuredProviders.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold">{t("featuredVenues")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProviders.map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onOpen={onOpenProvider}
                onShare={onShareProvider}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">{t("boroughTitle")}</h2>
        <div className="flex flex-wrap gap-2">
          {BOROUGHS.map((b) => (
            <Link key={b} href={buildSectionPath("events", { location: { borough: b } })}>
              <Button variant="outline" className="rounded-full">
                {districtLabel(b)}
              </Button>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
