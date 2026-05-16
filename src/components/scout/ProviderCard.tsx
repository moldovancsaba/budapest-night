import {
  Heart,
  Share2,
  Plus,
  Star,
  MapPin,
  Calendar,
  Megaphone,
} from "lucide-react";
import type { Provider } from "@/types/provider";
import { CdnImage } from "@/components/ui/CdnImage";
import { Button } from "@/components/ui/button";
import { useSaved, useCalculator } from "@/store/useScout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useDayTimeLabel,
  useFormatVenuePrice,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";

interface Props {
  provider: Provider;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
}

export function ProviderCard({ provider, onOpen, onShare }: Props) {
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
  const t = useTranslations("venue");
  const ageLabel = useAgeRangeLabel();
  const dayLabel = useDayTimeLabel();
  const activityLabel = useActivityTypeLabel();
  const badgeLabel = useBadgeLabel();
  const locationLine = useVenueLocationLine();
  const formatPrice = useFormatVenuePrice();
  const saved = isSaved(provider.id);
  const price = formatPrice(provider);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card transition-all hover:-translate-y-0.5">
      <div className="relative h-44 overflow-hidden bg-muted">
        <CdnImage
          fill
          resolveBase={provider.website}
          src={
            provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing
          }
          alt={provider.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {provider.badges[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground ">
            {badgeLabel(provider.badges[0])}
          </span>
        )}
        {provider.announcementBadge && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background ">
            <Megaphone className="h-3 w-3" />
            {provider.announcementBadge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(provider.id);
            toast.success(saved ? t("removed") : t("saved"));
          }}
          aria-label={saved ? t("unsave") : t("save")}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card transition-colors hover:bg-card"
        >
          <Heart
            className={cn(
              "h-4 w-4",
              saved ? "fill-primary text-primary" : "text-foreground",
            )}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <button onClick={() => onOpen(provider)} className="text-left">
          <h3 className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {provider.name}
          </h3>
        </button>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {locationLine(provider.borough, provider.neighborhood)}
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          {provider.activityTypes.slice(0, 3).map(activityLabel).join(" · ")}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.ageRanges.slice(0, 2).map((a) => (
            <span
              key={a}
              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {ageLabel(a)}
            </span>
          ))}
          {provider.dayTimeTags.slice(0, 2).map((d) => (
            <span
              key={d}
              className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {dayLabel(d)}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-display text-lg font-bold text-foreground">
              {price.main}
            </span>
            {price.suffix && (
              <span className="text-xs text-muted-foreground">
                {price.suffix}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-foreground">
              {provider.rating}
            </span>
            <span className="text-muted-foreground">
              {t("reviewsShort", { count: provider.reviewCount })}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {provider.bookingEnabled ? (
            <Button
              onClick={() => onOpen(provider)}
              aria-label={t("reserveAt", { name: provider.name })}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Calendar className="h-4 w-4" /> {t("reserve")}
            </Button>
          ) : (
            <Button
              onClick={() => onOpen(provider)}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("viewDetails")}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            aria-label={t("addToBudget")}
            onClick={() => {
              add(provider.id);
              toast.success(t("addedToBudget", { name: provider.name }));
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("share")}
            onClick={() => onShare(provider)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
