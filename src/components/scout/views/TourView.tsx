"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { buildSectionPath, buildTourPath } from "@/lib/appPaths";
import type { Provider } from "@/types/provider";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { CdnImage } from "@/components/ui/CdnImage";
import { Button } from "@/components/ui/button";
import { CMS_MEDIA } from "@/config/defaultMedia";

type TourStop = {
  providerId: string;
  providerName: string;
  category: string;
  borough: string;
  neighborhood: string;
  address: string;
  website: string;
  image: string;
  highlightItems: { name: string; priceLabel?: string }[];
};

interface Props {
  tourId: string;
  seed: string | null;
  onOpen: (p: Provider) => void;
}

export function TourView({ tourId, seed, onOpen }: Props) {
  const t = useTranslations("tours");
  const router = useRouter();
  const { data: providers = [] } = useProvidersCatalog();
  const [stops, setStops] = useState<TourStop[]>([]);
  const [activeSeed, setActiveSeed] = useState(seed ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (useSeed: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = useSeed ? `?seed=${encodeURIComponent(useSeed)}` : "";
        const res = await fetch(
          `/api/public/tours/${encodeURIComponent(tourId)}${params}`,
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "error");
          setStops([]);
          return;
        }
        setActiveSeed(data.seed);
        setStops(data.stops ?? []);
      } catch {
        setError("error");
        setStops([]);
      } finally {
        setLoading(false);
      }
    },
    [tourId],
  );

  useEffect(() => {
    void load(seed ?? `${tourId}-${Date.now()}`);
  }, [load, seed, tourId]);

  const reshuffle = () => {
    const next = `${tourId}-${Date.now()}`;
    router.replace(buildTourPath(tourId, next));
    void load(next);
  };

  const title = t(`${tourId}.title`);
  const description = t(`${tourId}.description`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={buildSectionPath("eat-drink")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToEatDrink")}
        </Link>
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={reshuffle}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("reshuffle")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          {t(`errors.${error}`)}
        </p>
      ) : (
        <ol className="space-y-6">
          {stops.map((stop, idx) => {
            const provider = providers.find((p) => p.id === stop.providerId);
            return (
              <li
                key={`${stop.providerId}-${idx}`}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card/50"
              >
                <div className="relative h-40 w-full">
                  <CdnImage
                    fill
                    resolveBase={stop.website}
                    src={stop.image || CMS_MEDIA.fallbackListing}
                    alt={stop.providerName}
                  />
                  <span className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {stop.providerName}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {stop.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stop.borough} · {stop.neighborhood}
                    </p>
                  </div>
                  {stop.highlightItems.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {stop.highlightItems.map((item) => (
                        <li
                          key={item.name}
                          className="flex justify-between gap-2"
                        >
                          <span className="text-foreground">{item.name}</span>
                          {item.priceLabel ? (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {item.priceLabel}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                  {provider ? (
                    <Button size="sm" onClick={() => onOpen(provider)}>
                      {t("openVenue")}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {activeSeed ? (
        <p className="text-center text-[10px] text-muted-foreground">
          {t("shareHint")}
        </p>
      ) : null}
    </div>
  );
}
