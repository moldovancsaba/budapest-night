import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MapPin,
  Mail,
  MessageCircle,
  Instagram,
  Globe,
  CalendarClock,
} from "lucide-react";
import { useSaved } from "@/store/useScout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEventsCatalog, useMeetupGroupsCatalog, useProvidersCatalog } from "@/hooks/useCatalog";
import { useFormatEventSchedule } from "@/hooks/useEventDisplay";
import { eventStubFromMeetupLink, type PublicMeetupGroup } from "@/lib/publicMeetup";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { Provider } from "@/types/provider";
import { MeetupLogo } from "../MeetupLogo";
import { MeetupGroupCard } from "../MeetupGroupCard";
import { ProviderCard } from "../ProviderCard";
import { EventCard } from "../EventCard";
import { CdnImage } from "@/components/ui/CdnImage";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useAgeRangeLabel,
  useMeetupCadenceLabel,
  useMeetupGroupTypeLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";

export function MeetupGroupProfile({
  group,
  onClose,
  onShare,
  onOpenAnother,
  onOpenVenue,
  onOpenEvent,
  variant = "sheet",
}: {
  group: PublicMeetupGroup | null;
  onClose: () => void;
  onShare: (g: PublicMeetupGroup) => void;
  onOpenAnother: (g: PublicMeetupGroup) => void;
  onOpenVenue: (p: Provider) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
  variant?: "sheet" | "page";
}) {
  const t = useTranslations("meetup");
  const tv = useTranslations("venue");
  const { isSaved, toggle } = useSaved();
  const { data: allGroups = [] } = useMeetupGroupsCatalog();
  const { data: providers = [] } = useProvidersCatalog();
  const { data: allEvents = [] } = useEventsCatalog();
  const formatSchedule = useFormatEventSchedule();
  const locationLine = useVenueLocationLine();
  const groupTypeLabel = useMeetupGroupTypeLabel();
  const cadenceLabel = useMeetupCadenceLabel();
  const ageLabel = useAgeRangeLabel();
  if (!group) return null;
  const isPage = variant === "page";
  const saved = isSaved(group.id);

  const similar = allGroups
    .filter((g) => g.id !== group.id && g.borough === group.borough)
    .slice(0, 3);

  const websiteUrl = `https://${group.website.replace(/^https?:\/\//, "")}`;

  const shareEmail = () => {
    const body = `${group.name} — ${locationLine(group.borough, group.neighborhood)}.\n\n${group.description}\n\nInstagram: ${group.instagram}\n${websiteUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(t("shareTitle", { name: group.name }))}&body=${encodeURIComponent(body)}`,
    );
  };
  const shareWhatsapp = () => {
    const text = `${group.name} — ${locationLine(group.borough, group.neighborhood)}. ${group.description} ${group.instagram} ${websiteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const content = (
    <>
        <div className={isPage ? "relative h-56 w-full overflow-hidden" : "relative h-44 w-full overflow-hidden"}>
          <CdnImage
            fill
            resolveBase={
              group.coverImageUrl?.trim() ? group.website : undefined
            }
            src={
              group.coverImageUrl?.trim()
                ? group.coverImageUrl
                : CMS_MEDIA.fallbackMeetup
            }
            alt={group.name}
          />
        </div>
        <div className="bg-secondary px-6 pb-6 pt-6">
          <div className="flex items-start gap-5">
            <MeetupLogo group={group} size="lg" />
            <div className="min-w-0 flex-1">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
                {groupTypeLabel(group.groupType)}
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-foreground">
                {group.name}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {locationLine(group.borough, group.neighborhood)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 pb-12">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {ageLabel(group.ageRange)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              {cadenceLabel(group.cadence)}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
              {groupTypeLabel(group.groupType)}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground/85">
            {group.description}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={() => {
                toggle(group.id);
                toast.success(saved ? tv("removed") : tv("savedGroup"));
              }}
            >
              <Heart
                className={cn("h-4 w-4", saved && "fill-foreground text-foreground")}
              />
              {saved ? t("unsave") : t("save")}
            </Button>
            <Button variant="outline" asChild>
              <a href={websiteUrl} target="_blank" rel="noreferrer">
                <Globe className="h-4 w-4" /> {t("visitWebsite")}
              </a>
            </Button>
            <Button variant="outline" onClick={shareEmail}>
              <Mail className="h-4 w-4" /> {tv("shareEmail")}
            </Button>
            <Button variant="outline" onClick={shareWhatsapp}>
              <MessageCircle className="h-4 w-4" /> {tv("shareWhatsapp")}
            </Button>
          </div>

          {(group.venueIds?.length ?? 0) > group.venues.length ? (
            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
              {t("venueLinkMissing", {
                count: (group.venueIds?.length ?? 0) - group.venues.length,
              })}
            </p>
          ) : null}

          {group.venues.length > 0 && (
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {t("hostVenues")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("hostVenuesHint")}</p>
              <div className="mt-4 grid gap-4">
                {group.venues.map((link) => {
                  const provider = providers.find((p) => p.id === link.id) ?? null;
                  return provider ? (
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
                  );
                })}
              </div>
            </div>
          )}

          {(group.eventIds?.length ?? 0) > group.events.length ? (
            <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
              {t("eventLinkMissing", {
                count: (group.eventIds?.length ?? 0) - group.events.length,
              })}
            </p>
          ) : null}

          {group.events.length > 0 && (
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {t("organizedEvents")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("organizedEventsHint")}</p>
              <div className="mt-4 grid gap-4">
                {group.events.map((link) => {
                  const full = allEvents.find((e) => e.id === link.id);
                  if (full) {
                    return <EventCard key={link.id} event={full} onOpen={onOpenEvent} />;
                  }
                  const stub = eventStubFromMeetupLink(link, group);
                  const { dateLine, timeLine } = formatSchedule(stub);
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => onOpenEvent(stub)}
                      className="w-full rounded-2xl border border-border/70 bg-card/50 p-4 text-left"
                    >
                      <p className="font-display font-semibold text-foreground">{link.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dateLine} · {timeLine}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {link.borough} · {link.neighborhood}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-secondary p-5">
            <h3 className="font-display text-sm font-semibold text-foreground">
              {t("connect")}
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <a
                href={`https://instagram.com/${group.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-foreground"
              >
                <Instagram className="h-4 w-4 text-muted-foreground" />{" "}
                {group.instagram}
              </a>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />{" "}
                {group.website}
              </a>
            </div>
          </div>

          {similar.length > 0 && (
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                {t("similarNearby")}
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-4">
                {similar.map((g) => (
                  <MeetupGroupCard
                    key={g.id}
                    group={g}
                    onOpen={onOpenAnother}
                    onShare={onShare}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
    </>
  );

  if (isPage) {
    return <div className="overflow-y-auto bg-background">{content}</div>;
  }

  return (
    <Sheet open={!!group} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-xl bg-background"
      >
        {content}
      </SheetContent>
    </Sheet>
  );
}
