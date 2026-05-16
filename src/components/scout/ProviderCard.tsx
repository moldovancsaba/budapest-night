import { Heart, Share2, Plus, Star, MapPin, Calendar, Megaphone } from "lucide-react";
import type { Provider } from "@/types/provider";
import { CdnImage } from "@/components/ui/CdnImage";
import { Button } from "@/components/ui/button";
import { useSaved, useCalculator } from "@/store/useScout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CMS_MEDIA } from "@/config/defaultMedia";

interface Props {
  provider: Provider;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
}

export function ProviderCard({ provider, onOpen, onShare }: Props) {
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
  const saved = isSaved(provider.id);

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="relative h-44 overflow-hidden">
        <CdnImage
          resolveBase={provider.website}
          src={provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing}
          alt={provider.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {provider.badges[0] && (
          <span className="absolute left-3 top-3 rounded-full bg-teal px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-foreground shadow-sm">
            {provider.badges[0]}
          </span>
        )}
        {provider.announcementBadge && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-orange px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Megaphone className="h-3 w-3" />
            {provider.announcementBadge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(provider.id);
            toast.success(saved ? "Removed from saved" : "Saved");
          }}
          aria-label={saved ? "Remove from saved" : "Save provider"}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/95 backdrop-blur transition-colors hover:bg-card"
        >
          <Heart className={cn("h-4 w-4", saved ? "fill-orange text-orange" : "text-foreground")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <button onClick={() => onOpen(provider)} className="text-left">
          <h3 className="font-display text-lg font-semibold text-foreground transition-colors group-hover:text-teal">
            {provider.name}
          </h3>
        </button>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {provider.neighborhood}, {provider.borough}
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          {provider.activityTypes.slice(0, 3).join(" · ")}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.ageRanges.slice(0, 2).map((a) => (
            <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              Ages {a}
            </span>
          ))}
          {provider.dayTimeTags.slice(0, 2).map((d) => (
            <span key={d} className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-display text-lg font-bold text-orange">${provider.pricePerClass}</span>
            <span className="text-xs text-muted-foreground">/class</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-orange text-orange" />
            <span className="font-semibold text-foreground">{provider.rating}</span>
            <span className="text-muted-foreground">({provider.reviewCount})</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {provider.bookingEnabled ? (
            <Button
              onClick={() => onOpen(provider)}
              aria-label={`Book now with ${provider.name}`}
              className="flex-1 bg-teal text-teal-foreground hover:bg-teal/90"
            >
              <Calendar className="h-4 w-4" /> Book Now
            </Button>
          ) : (
            <Button onClick={() => onOpen(provider)} className="flex-1 bg-foreground text-background hover:bg-foreground/90">
              View details
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            aria-label="Add to calculator"
            onClick={() => {
              add(provider.id);
              toast.success(`${provider.name} added to calculator`);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Share provider" onClick={() => onShare(provider)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
