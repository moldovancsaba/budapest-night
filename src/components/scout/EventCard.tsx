"use client";

import { CalendarDays, MapPin, Ticket } from "lucide-react";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { CdnImage } from "@/components/ui/CdnImage";
import { Button } from "@/components/ui/button";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useEventDisplayLabels,
  useEventFromPrice,
  primaryHostFromEvent,
  useEventPlaceLine,
  useFormatDoorsOpen,
  useFormatEventSchedule,
} from "@/hooks/useEventDisplay";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import { useTranslations } from "next-intl";

interface Props {
  event: PublicNightEvent;
  onOpen: (e: PublicNightEvent) => void;
}

export function EventCard({ event, onOpen }: Props) {
  const t = useTranslations("event");
  const tProgram = useTranslations("program");
  const schedule = useFormatEventSchedule();
  const doors = useFormatDoorsOpen();
  const fromPrice = useEventFromPrice();
  const placeLine = useEventPlaceLine();
  const { data: providers = [] } = useProvidersCatalog();
  const { badgeLabel } = useEventDisplayLabels();
  const { dateLine, timeLine } = schedule(event);
  const primaryHostRaw = primaryHostFromEvent(event, providers);
  const primaryHost = primaryHostRaw
    ? { ...primaryHostRaw, ...resolveProviderLocation(primaryHostRaw) }
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all hover:-translate-y-0.5">
      <div className="relative h-44 overflow-hidden bg-muted">
        <CdnImage
          fill
          resolveBase={event.website}
          src={event.image?.trim() ? event.image : CMS_MEDIA.fallbackListing}
          alt={event.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {event.promotionLabel || event.isFeatured ? (
          <div className="absolute left-3 top-3 flex max-w-[85%] flex-col gap-1">
            <span className="w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
              {event.promotionLabel ?? badgeLabel("Featured")}
            </span>
            {event.promotionLabel ? (
              <span className="rounded bg-background/90 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {tProgram("adDisclosure")}
              </span>
            ) : null}
          </div>
        ) : event.badges[0] ? (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-background">
            {badgeLabel(event.badges[0])}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <button
          type="button"
          onClick={() => onOpen(event)}
          className="text-left"
        >
          <h3 className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-foreground">
            {event.title}
          </h3>
        </button>
        <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>
            {dateLine} · {timeLine}
          </span>
        </p>
        {doors(event) ? (
          <p className="mt-1 text-xs text-muted-foreground">{doors(event)}</p>
        ) : null}
        <p className="mt-2 flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="block text-foreground">{placeLine(event, primaryHost)}</span>
            {primaryHost?.address ? (
              <span className="mt-0.5 block text-xs">{primaryHost.address}</span>
            ) : null}
          </span>
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {event.shortDescription}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Ticket className="h-4 w-4 text-foreground" />
            {fromPrice(event.entryFees)}
          </span>
          <Button size="sm" variant="secondary" onClick={() => onOpen(event)}>
            {t("viewEvent")}
          </Button>
        </div>
      </div>
    </article>
  );
}
