"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { Provider } from "@/types/provider";
import { CalendarDays, ExternalLink, MapPin, Ticket, X } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import {
  useEventDisplayLabels,
  useEventFromPrice,
  useEventPlaceLine,
  useFormatDoorsOpen,
  useFormatEntryFee,
  useFormatEventSchedule,
} from "@/hooks/useEventDisplay";
import { useTranslations, useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { buildAbsoluteEventFullUrl } from "@/lib/appShareUrls";
import { eventJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { ProviderCard } from "../ProviderCard";

export function EventProfile({
  event,
  onClose,
  onOpenVenue,
  variant = "sheet",
}: {
  event: PublicNightEvent | null;
  onClose: () => void;
  onOpenVenue: (p: Provider) => void;
  variant?: "sheet" | "page";
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("event");
  const schedule = useFormatEventSchedule();
  const doors = useFormatDoorsOpen();
  const fromPrice = useEventFromPrice();
  const formatFee = useFormatEntryFee();
  const placeLine = useEventPlaceLine();
  const { activityLabel, ageLabel, badgeLabel } = useEventDisplayLabels();
  const { data: providers = [] } = useProvidersCatalog();

  if (!event) return null;

  const isPage = variant === "page";
  const { dateLine, timeLine } = schedule(event);
  const hostVenueRows = event.venues.map((link) => ({
    link,
    provider: providers.find((p) => p.id === link.id) ?? null,
  }));
  const primaryHost = hostVenueRows[0]?.provider ?? hostVenueRows[0]?.link ?? null;
  const missingVenueCount = event.venueIds.length - event.venues.length;

  const content = (
    <>
      <div
        className={
          isPage
            ? "relative h-72 w-full overflow-hidden"
            : "relative h-56 w-full overflow-hidden"
        }
      >
        <CdnImage
          fill
          resolveBase={event.website}
          src={event.image?.trim() ? event.image : CMS_MEDIA.fallbackListing}
          alt={event.title}
        />
        {!isPage ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-card"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-6 p-6 pb-12">
        <div>
          {event.badges[0] ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
              {badgeLabel(event.badges[0])}
            </span>
          ) : null}
          <h2
            className={
              isPage
                ? "mt-2 font-display text-3xl font-bold text-foreground"
                : "mt-2 font-display text-2xl font-bold text-foreground"
            }
          >
            {event.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarDays className="h-4 w-4" />
            {dateLine} · {timeLine}
          </p>
          {doors(event) ? (
            <p className="text-xs text-muted-foreground">{doors(event)}</p>
          ) : null}
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {placeLine(event, primaryHost)}
              {primaryHost?.address ? (
                <span className="mt-0.5 block text-xs">{primaryHost.address}</span>
              ) : null}
            </span>
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {fromPrice(event.entryFees)}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/90">{event.longDescription}</p>

        <div className="flex flex-wrap gap-2">
          {event.activityTypes.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium"
            >
              {activityLabel(tag)}
            </span>
          ))}
          {event.ageRanges.map((a) => (
            <span
              key={a}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {ageLabel(a)}
            </span>
          ))}
        </div>

        {event.entryFees.length > 0 && (
          <div className="rounded-2xl border border-border/70 bg-card/50 p-4">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
              <Ticket className="h-4 w-4 text-foreground" />
              {t("entryFees")}
            </h3>
            <ul className="mt-3 space-y-2">
              {event.entryFees.map((fee) => (
                <li key={fee.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-foreground">{fee.label}</span>
                  <span className="font-semibold text-foreground">{formatFee(fee)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {event.bookingUrl ? (
            <Button asChild className="bg-primary text-primary-foreground">
              <a href={event.bookingUrl} target="_blank" rel="noreferrer">
                {t("getTickets")} <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : null}
          {event.website ? (
            <Button variant="outline" asChild>
              <a href={event.website} target="_blank" rel="noreferrer">
                {t("officialSite")}
              </a>
            </Button>
          ) : null}
        </div>

        {missingVenueCount > 0 ? (
          <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
            {t("venueLinkMissing", { count: missingVenueCount })}
          </p>
        ) : null}

        {hostVenueRows.length > 0 && (
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              {t("venues")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{t("venuesHint")}</p>
            <div className="mt-4 grid gap-4">
              {hostVenueRows.map(({ link, provider }) =>
                provider ? (
                  <ProviderCard
                    key={link.id}
                    provider={provider}
                    onOpen={onOpenVenue}
                    onShare={() => {}}
                  />
                ) : (
                  <div
                    key={link.id}
                    className="rounded-2xl border border-border/70 bg-card/50 p-4"
                  >
                    <p className="font-display font-semibold text-foreground">{link.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{link.address}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (isPage) {
    const url = buildAbsoluteEventFullUrl(event, locale);
    const place = primaryHost && "name" in primaryHost ? primaryHost.name : placeLine(event);
    const address =
      primaryHost && "address" in primaryHost
        ? primaryHost.address
        : hostVenueRows[0]?.link.address;
    return (
      <>
        <JsonLd
          data={eventJsonLd({
            title: event.title,
            description: event.shortDescription || event.longDescription,
            startDate: event.startsAt,
            endDate: event.endsAt,
            url,
            locationName: place,
            address,
          })}
        />
        <div className="overflow-y-auto bg-background">{content}</div>
      </>
    );
  }

  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto bg-background p-0 sm:max-w-xl"
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}
