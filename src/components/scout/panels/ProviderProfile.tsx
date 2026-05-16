import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Provider } from "@/types/provider";
import { Heart, Plus, Mail, Globe, Phone, MapPin, Star, MessageCircle, Megaphone, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useSaved, useCalculator } from "@/store/useScout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { CdnImage } from "@/components/ui/CdnImage";
import { ProviderCard } from "../ProviderCard";
import { ProviderMap } from "./ProviderMap";
import { VenueMenuPanel } from "@/components/scout/VenueMenuPanel";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useCategoryLabel,
  useDayTimeLabel,
  useFormatVenuePrice,
  useVenueShareSummary,
} from "@/hooks/useVenueDisplay";
import { useLocale, useTranslations } from "next-intl";
import { buildAbsoluteVenueUrl } from "@/lib/appShareUrls";
import type { AppLocale } from "@/i18n/config";

export function ProviderProfile({
  provider,
  onClose,
  onShare,
  onOpenAnother,
}: {
  provider: Provider | null;
  onClose: () => void;
  onShare: (p: Provider) => void;
  onOpenAnother: (p: Provider) => void;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("venue");
  const tMenu = useTranslations("menu");
  const categoryLabel = useCategoryLabel();
  const activityLabel = useActivityTypeLabel();
  const ageLabel = useAgeRangeLabel();
  const dayLabel = useDayTimeLabel();
  const badgeLabel = useBadgeLabel();
  const formatPrice = useFormatVenuePrice();
  const shareSummary = useVenueShareSummary();
  const { data: allProviders = [] } = useProvidersCatalog();
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [bannerOpen, setBannerOpen] = useState(true);
  const gallery = useMemo(() => {
    if (!provider) return [];
    const urls: string[] = [];
    const seen = new Set<string>();
    const add = (raw?: string) => {
      const u = resolveImageUrl(raw, provider.website);
      if (!u || seen.has(u)) return;
      seen.add(u);
      urls.push(u);
    };
    add(provider.image);
    for (const g of provider.galleryImages ?? []) add(g);
    if (urls.length === 0) urls.push(CMS_MEDIA.fallbackListing);
    return urls;
  }, [provider]);

  if (!provider) return null;

  const saved = isSaved(provider.id);
  const price = formatPrice(provider);
  const current = gallery.length > 0 ? gallery[Math.min(photoIdx, gallery.length - 1)] : undefined;

  const similar = allProviders.filter(
    (p) => p.id !== provider.id && p.borough === provider.borough && p.category === provider.category,
  ).slice(0, 3);

  const shareUrl = buildAbsoluteVenueUrl(provider, locale);

  const shareEmail = () => {
    const body = `${shareSummary(provider)}\n\n${shareUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(t("shareTitle", { name: provider.name }))}&body=${encodeURIComponent(body)}`,
    );
  };
  const shareWhatsapp = () => {
    const text = `${shareSummary(provider)} ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <Sheet open={!!provider} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl bg-background">
        <div className="relative h-64 w-full overflow-hidden">
          <CdnImage fill resolveBase={provider.website} src={current} alt={provider.name} />
          {provider.badges[0] && (
            <span className="absolute left-5 top-5 rounded-full bg-teal px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-foreground">
              {badgeLabel(provider.badges[0])}
            </span>
          )}
          {gallery.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx((i) => (i - 1 + gallery.length) % gallery.length)}
                aria-label={t("prevPhoto")}
                className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-card/95 shadow-sm backdrop-blur hover:bg-card"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPhotoIdx((i) => (i + 1) % gallery.length)}
                aria-label={t("nextPhoto")}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-card/95 shadow-sm backdrop-blur hover:bg-card"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute right-3 top-3 rounded-full bg-foreground/70 px-2.5 py-1 text-[11px] font-semibold text-background">
                {t("photoCounter", { current: photoIdx + 1, total: gallery.length })}
              </span>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIdx(i)}
                    aria-label={t("goToPhoto", { n: i + 1 })}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === photoIdx ? "w-6 bg-teal" : "w-2 bg-card/80",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="space-y-6 p-6 pb-12">
          {provider.announcementTitle && bannerOpen && (
            <div className="flex items-start gap-3 rounded-2xl border border-teal/30 bg-teal-soft p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal/15 text-teal">
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-foreground">{provider.announcementTitle}</p>
                {provider.announcementDescription && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{provider.announcementDescription}</p>
                )}
              </div>
              <button
                onClick={() => setBannerOpen(false)}
                aria-label={t("dismissAnnouncement")}
                className="rounded-full p-1 text-muted-foreground hover:bg-card"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  aria-label={t("viewPhoto", { n: i + 1 })}
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    i === photoIdx ? "border-teal" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <CdnImage fill resolveBase={provider.website} src={src} alt={`${provider.name} photo ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">{categoryLabel(provider.category)}</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{provider.name}</h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {provider.address}
            </p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-orange text-orange" />
                <span className="font-semibold text-foreground">{provider.rating}</span>
                <span className="text-muted-foreground">{t("reviewsCount", { count: provider.reviewCount })}</span>
              </span>
              <span className="text-border">|</span>
              <span className="font-display text-base">
                <span className="font-bold text-orange">{price.main}</span>
                {price.suffix && <span className="text-xs text-muted-foreground">{price.suffix}</span>}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {provider.activityTypes.map((tag) => (
              <span key={tag} className="rounded-full bg-teal-soft px-3 py-1 text-xs font-medium text-teal">
                {activityLabel(tag)}
              </span>
            ))}
            {provider.ageRanges.map((a) => (
              <span key={a} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {ageLabel(a)}
              </span>
            ))}
            {provider.dayTimeTags.map((d) => (
              <span key={d} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {dayLabel(d)}
              </span>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-foreground/85">{provider.longDescription}</p>

          {(provider.menu?.sections?.length || (provider.eventOfferings?.length ?? 0) > 0) && (
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">{tMenu("title")}</h3>
              <div className="mt-3">
                <VenueMenuPanel provider={provider} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {provider.bookingEnabled && (
              <Button
                className="col-span-2 bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label={t("reserveAt", { name: provider.name })}
                onClick={() => toast.success(t("bookingSoon"))}
              >
                <Calendar className="h-4 w-4" /> {t("reserve")}
              </Button>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                add(provider.id);
                toast.success(t("addedToBudget", { name: provider.name }));
              }}
            >
              <Plus className="h-4 w-4" /> {t("addToBudget")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toggle(provider.id);
                toast.success(saved ? t("removed") : t("saved"));
              }}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-orange text-orange")} />
              {saved ? t("saved") : t("save")}
            </Button>
            <Button variant="outline" onClick={shareEmail}>
              <Mail className="h-4 w-4" /> {t("shareEmail")}
            </Button>
            <Button variant="outline" onClick={shareWhatsapp}>
              <MessageCircle className="h-4 w-4" /> {t("shareWhatsapp")}
            </Button>
          </div>

          <div className="rounded-2xl bg-secondary p-5">
            <h3 className="font-display text-sm font-semibold text-foreground">{t("contactVenue")}</h3>
            <div className="mt-3 space-y-2 text-sm">
              <a href={`mailto:${provider.email}`} className="flex items-center gap-2 text-foreground hover:text-teal">
                <Mail className="h-4 w-4 text-muted-foreground" /> {provider.email}
              </a>
              <a href={provider.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-foreground hover:text-teal">
                <Globe className="h-4 w-4 text-muted-foreground" /> {provider.website}
              </a>
              <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-foreground hover:text-teal">
                <Phone className="h-4 w-4 text-muted-foreground" /> {provider.phone}
              </a>
            </div>
          </div>

          <ProviderMap address={provider.address} borough={provider.borough} />

          {similar.length > 0 && (
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">{t("moreNearby")}</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {similar.map((p) => (
                  <ProviderCard key={p.id} provider={p} onOpen={onOpenAnother} onShare={onShare} />
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
