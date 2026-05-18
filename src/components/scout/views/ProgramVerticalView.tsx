"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { Link } from "@/i18n/routing";
import { buildProgramPath, type ProgramVerticalSlug } from "@/lib/appPaths";
import {
  getVertical,
  providerMatchesVertical,
  eventMatchesVertical,
} from "@/lib/programVerticals";
import { useProvidersCatalog, useEventsCatalog } from "@/hooks/useCatalog";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { EventCard } from "@/components/scout/EventCard";
import { ProviderCard } from "@/components/scout/ProviderCard";

type Props = {
  vertical: ProgramVerticalSlug;
  onOpenProvider: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  onShareProvider: (p: Provider) => void;
};

export function ProgramVerticalView({
  vertical,
  onOpenProvider,
  onOpenEvent,
  onShareProvider,
}: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("program");
  const def = getVertical(vertical);
  const { data: providers = [] } = useProvidersCatalog();
  const { data: events = [] } = useEventsCatalog();

  const filteredProviders = useMemo(() => {
    if (!def) return [];
    return providers.filter((p) => providerMatchesVertical(p, def));
  }, [providers, def]);

  const filteredEvents = useMemo(() => {
    if (!def) return [];
    return events.filter((e) => eventMatchesVertical(e, def));
  }, [events, def]);

  if (!def) {
    return (
      <p className="text-muted-foreground">
        <Link href={buildProgramPath(undefined, { locale })}>← {t("weekTitle")}</Link>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <Link href={buildProgramPath(undefined, { locale })}>
          <Button variant="ghost" size="sm" className="mb-4 rounded-full">
            ← {t("weekTitle")}
          </Button>
        </Link>
        <h1 className="font-display text-3xl font-bold">{t(`vertical.${vertical}`)}</h1>
        <p className="mt-2 text-muted-foreground">{t("weekSubtitle")}</p>
      </header>

      {filteredEvents.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">{t("featuredEvents")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEvents.slice(0, 12).map((ev) => (
              <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">{t("featuredVenues")}</h2>
        {filteredProviders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptyVertical")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.slice(0, 18).map((p) => (
              <ProviderCard
                key={p.id}
                provider={p}
                onOpen={onOpenProvider}
                onShare={onShareProvider}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
