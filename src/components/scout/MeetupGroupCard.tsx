import { Heart, Share2, MapPin, Instagram, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaved } from "@/store/useScout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MeetupLogo } from "./MeetupLogo";
import type { MeetupGroup } from "@/types/meetup";
import {
  useAgeRangeLabel,
  useMeetupCadenceLabel,
  useMeetupGroupTypeLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { CdnImage } from "@/components/ui/CdnImage";
import { CMS_MEDIA } from "@/config/defaultMedia";

interface Props {
  group: MeetupGroup;
  onOpen: (g: MeetupGroup) => void;
  onShare: (g: MeetupGroup) => void;
}

export function MeetupGroupCard({ group, onOpen, onShare }: Props) {
  const t = useTranslations("meetup");
  const { isSaved, toggle } = useSaved();
  const locationLine = useVenueLocationLine();
  const groupTypeLabel = useMeetupGroupTypeLabel();
  const cadenceLabel = useMeetupCadenceLabel();
  const ageLabel = useAgeRangeLabel();
  const saved = isSaved(group.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all hover:-translate-y-0.5">
      <div className="relative h-36 overflow-hidden bg-muted">
        <CdnImage
          fill
          resolveBase={group.coverImageUrl?.trim() ? group.website : undefined}
          src={
            group.coverImageUrl?.trim()
              ? group.coverImageUrl
              : CMS_MEDIA.fallbackMeetup
          }
          alt={group.name}
        />
      </div>
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div className="flex items-start gap-4">
          <MeetupLogo group={group} />
          <div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {groupTypeLabel(group.groupType)}
            </span>
            <button
              onClick={() => onOpen(group)}
              className="mt-1.5 block text-left"
            >
              <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {group.name}
              </h3>
            </button>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {locationLine(group.borough, group.neighborhood)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(group.id);
            toast.success(saved ? t("unsave") : t("save"));
          }}
          aria-label={saved ? t("unsave") : t("save")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground transition-colors hover:bg-muted"
        >
          <Heart
            className={cn("h-4 w-4", saved ? "fill-primary text-primary" : "")}
          />
        </button>
      </div>

      <div className="flex-1 px-5">
        <p className="text-sm leading-relaxed text-foreground/80">
          {group.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {ageLabel(group.ageRange)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            {cadenceLabel(group.cadence)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
        <a
          href={`https://instagram.com/${group.instagram.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <Instagram className="h-3.5 w-3.5" />
          {group.instagram}
        </a>
      </div>

      <div className="flex gap-2 px-5 pb-5">
        <Button
          onClick={() => onOpen(group)}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t("viewDetails")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("share")}
          onClick={() => onShare(group)}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
