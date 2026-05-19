import { useState } from "react";
import {
  CalendarDays,
  PartyPopper,
  UtensilsCrossed,
  Coffee,
  Palette,
  Sparkles,
  Users,
  ArrowRight,
  Mail,
  Star,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BoroughChoice, Category, Provider } from "@/types/provider";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { PROGRAM_VERTICALS } from "@/lib/programVerticals";
import {
  useCategoryLabel,
  useDistrictLabel,
  useNeighborhoodLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import {
  useHomeCopy,
  useTrustPillars,
  type HomeCopy,
} from "@/hooks/useLocalizedSiteCopy";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useFormatVenuePrice,
} from "@/hooks/useVenueDisplay";
import type { MeetupGroup } from "@/types/meetup";
import type { SiteDoc, SiteGuide, SiteGuideNavigateTo } from "@/types/site";
import { DEFAULT_SITE } from "@/types/site";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { Link } from "@/i18n/routing";
import { buildProgramPath } from "@/lib/appPaths";
import { cacheBustMediaUrl } from "@/lib/siteMedia";
import { toast } from "sonner";
import { CdnImage } from "@/components/ui/CdnImage";
import { SiteLucideIcon } from "@/lib/siteLucideIcon";
import {
  useProvidersCatalog,
  useMeetupGroupsCatalog,
  useSiteCatalog,
  useNeighborhoodsCatalog,
  useEventsCatalog,
} from "@/hooks/useCatalog";
import { EventCard } from "@/components/scout/EventCard";
import { isUpcoming } from "@/lib/eventDisplay";
import type { PublicNightEvent } from "@/lib/publicEvent";
import { BOROUGHS, NEIGHBORHOODS } from "@/data/locations";
import { CYBER_PANEL, CYBER_TONE_BG, CYBER_TONE_LINK } from "@/lib/cyberTheme";

const HOME_BOROUGH_CHOICES: BoroughChoice[] = ["All", ...BOROUGHS];

function openMarketingLink(href: string | undefined, inApp: () => void) {
  const h = (href ?? "").trim();
  if (!h) {
    inApp();
    return;
  }
  if (h.startsWith("http://") || h.startsWith("https://")) {
    window.open(h, "_blank", "noopener,noreferrer");
    return;
  }
  if (h.startsWith("#")) {
    window.location.hash = h;
    return;
  }
  window.location.assign(h.startsWith("/") ? h : `/${h}`);
}

const CATEGORY_TILES: {
  key: Category | "Events" | "Meet-Up Groups";
  icon: React.ComponentType<{ className?: string }>;
  descKey: keyof HomeCopy["categories"];
  tone: "orange" | "teal" | "pink" | "amber" | "blue";
}[] = [
  { key: "Events", icon: CalendarDays, descKey: "events", tone: "orange" },
  { key: "Venues", icon: Building2, descKey: "venues", tone: "teal" },
  { key: "Parties", icon: PartyPopper, descKey: "parties", tone: "pink" },
  {
    key: "Restaurants",
    icon: UtensilsCrossed,
    descKey: "restaurants",
    tone: "amber",
  },
  { key: "Cafés", icon: Coffee, descKey: "cafes", tone: "blue" },
  { key: "Meet-Up Groups", icon: Palette, descKey: "culture", tone: "orange" },
];

const TONE_BG = CYBER_TONE_BG;
const TONE_LINK = CYBER_TONE_LINK;

const GUIDE_NAV_BY_ID: Record<string, SiteGuideNavigateTo> = {
  "guide-belvaros": "Eat & Drink",
  "guide-jewish-quarter": "Parties",
  "guide-andrassy": "Cafés",
  "guide-buda": "Venues",
};

function resolveGuideNavigateTo(g: SiteGuide): SiteGuideNavigateTo {
  if (g.navigateTo) return g.navigateTo;
  if (g.id && GUIDE_NAV_BY_ID[g.id]) return GUIDE_NAV_BY_ID[g.id];
  return "Venues";
}

type HomeNavigateView =
  | Category
  | "Events"
  | "Saved"
  | "Calculator"
  | "Meet-Up Groups"
  | "Eat & Drink"
  | "Program";

interface Props {
  onNavigate: (
    view: HomeNavigateView,
    location?: { borough?: BoroughChoice; neighborhood?: string },
  ) => void;
  onOpenProvider: (p: Provider) => void;
  onOpenGroup: (g: MeetupGroup) => void;
  onOpenEvent: (e: PublicNightEvent) => void;
}

export function HomeView({ onNavigate, onOpenProvider, onOpenGroup, onOpenEvent }: Props) {
  const locale = useLocale() as AppLocale;
  const tProgram = useTranslations("program");
  const districtLabel = useDistrictLabel();
  const neighborhoodLabel = useNeighborhoodLabel();
  const locationLine = useVenueLocationLine();
  const tNav = useTranslations("nav");
  const categoryLabel = useCategoryLabel();
  const home = useHomeCopy();
  const trustPillars = useTrustPillars();
  const [borough, setBorough] = useState<BoroughChoice>("All");
  const [email, setEmail] = useState("");
  const { data: providers = [] } = useProvidersCatalog();
  const { data: events = [] } = useEventsCatalog();
  const { data: meetups = [] } = useMeetupGroupsCatalog();
  const { data: siteData } = useSiteCatalog();
  const { data: locationsByBorough } = useNeighborhoodsCatalog();
  const s = siteData ?? ({ _id: "main", ...DEFAULT_SITE } as SiteDoc);
  const hoodList =
    borough === "All"
      ? []
      : (locationsByBorough?.[borough] ?? NEIGHBORHOODS[borough]);

  const popularPicks = s.homePopularPickProviderNames
    .map((name) => providers.find((p) => p.name === name))
    .filter((p): p is Provider => !!p);

  const promotedPartners = providers.filter((p) => p.isPromoted).slice(0, 6);
  const featuredHomeEvents = events
    .filter((e) => e.isFeatured && isUpcoming(e))
    .slice(0, 6);

  const popularGroup = s.homePopularMeetupGroupId.trim()
    ? meetups.find((g) => g.id === s.homePopularMeetupGroupId.trim())
    : undefined;

  const scrollToNeighborhoods = () => {
    document
      .getElementById("home-neighborhoods")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className={cn("relative overflow-hidden", CYBER_PANEL)}>
        <div className="relative grid items-center gap-8 p-8 sm:p-12 md:grid-cols-[1.1fr_1fr] md:p-16">
          <div className="relative z-10">
            <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              <span className="text-foreground">{home.heroTitle}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {home.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                onClick={() => onNavigate("Events")}
              >
                {home.heroPrimaryCta} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-card/50 px-6 text-foreground hover:bg-muted"
                onClick={scrollToNeighborhoods}
              >
                {home.heroSecondaryCta}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-card/50 px-6 text-foreground hover:bg-muted"
                asChild
              >
                <Link href={buildProgramPath(undefined, { locale })}>{tProgram("heroCta")}</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm font-medium text-primary">{tProgram("thuNote")}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-muted text-foreground">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              {home.heroTagline}
            </p>
          </div>
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border">
              <CdnImage fill src={cacheBustMediaUrl(s.homeHeroUrl)} alt={home.heroImageAlt} />
            </div>
            <span
              className="absolute -right-2 -top-2 hidden text-muted-foreground md:block"
              aria-hidden
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 4v10M40 12l-7 7M44 28H34M12 12l7 7M4 28h10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* PROGRAM VERTICALS */}
      <section>
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
          {tProgram("verticalsTitle")}
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {PROGRAM_VERTICALS.map((v) => (
            <Link key={v.id} href={buildProgramPath(v.id, { locale })}>
              <Button variant="outline" className="rounded-full">
                {tProgram(`vertical.${v.id}`)}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {featuredHomeEvents.length > 0 && (
        <section>
          <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            {tProgram("featuredEvents")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredHomeEvents.map((ev) => (
              <EventCard key={ev.id} event={ev} onOpen={onOpenEvent} />
            ))}
          </div>
        </section>
      )}

      {promotedPartners.length > 0 && (
        <section>
          <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
            {tProgram("promotedTitle")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promotedPartners.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenProvider(p)}
                className="rounded-2xl border border-primary/30 bg-card p-4 text-left transition hover:border-primary"
              >
                <p className="font-semibold text-foreground">{p.name}</p>
                {p.promotionLabel ? (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {p.promotionLabel}
                    <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                      {tProgram("adDisclosure")}
                    </span>
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section>
        <h2 className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">
          {home.categoriesTitle}
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORY_TILES.map(({ key, icon: Icon, descKey, tone }) => (
            <button
              key={key}
              onClick={() =>
                onNavigate(
                  key === "Meet-Up Groups"
                    ? "Meet-Up Groups"
                    : key === "Events"
                      ? "Events"
                      : (key as Category),
                )
              }
              className="group flex flex-col items-center rounded-3xl border border-border/80 bg-card/90 p-6 text-center transition-all hover:-translate-y-1 hover:border-foreground/40/40"
            >
              <span
                className={cn(
                  "grid h-16 w-16 place-items-center rounded-full",
                  TONE_BG[tone],
                )}
              >
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {key === "Meet-Up Groups"
                  ? tNav("culture")
                  : key === "Events"
                    ? tNav("events")
                    : categoryLabel(key as Category)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {home.categories[descKey].description}
              </p>
              <span
                className={cn(
                  "mt-4 inline-flex items-center gap-1 text-sm font-semibold",
                  TONE_LINK[tone],
                )}
              >
                {home.exploreCta}{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* NEIGHBORHOOD DISCOVERY */}
      <section
        id="home-neighborhoods"
        className={cn(
          "relative overflow-hidden px-6 py-12 sm:px-12 sm:py-14",
          CYBER_PANEL,
        )}
      >
        <Building2
          className="pointer-events-none absolute -left-4 top-6 h-32 w-32 text-foreground/[0.04]"
          aria-hidden
        />
        <Building2
          className="pointer-events-none absolute -right-4 bottom-6 h-32 w-32 text-foreground/[0.04]"
          aria-hidden
        />
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
          {home.neighborhoodSectionTitle}
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {HOME_BOROUGH_CHOICES.map((b) => {
            const active = b === borough;
            const label = districtLabel(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBorough(b)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border bg-card/80 text-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
          {borough === "All"
            ? home.allDistrictsHint
            : home.popularNeighborhoodsCaption
                .replace(/\{district\}/g, districtLabel(borough))
                .replace(/\{borough\}/g, districtLabel(borough))}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {borough === "All" ? (
            <button
              type="button"
              onClick={() => onNavigate("Events", { borough: "All" })}
              className="rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              {home.openDiscoverAll}
            </button>
          ) : (
            <>
              {hoodList.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    onNavigate("Events", { borough, neighborhood: n })
                  }
                  className="rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {neighborhoodLabel(n)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate("Events", { borough })}
                className="rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                {home.viewAllNeighborhoods}
              </button>
            </>
          )}
        </div>
      </section>

      {/* GUIDES */}
      {home.guides.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {home.guidesSectionTitle}
            </h2>
            <button
              type="button"
              onClick={() =>
                openMarketingLink(s.guidesViewAllHref, () => {
                  onNavigate("Venues");
                })
              }
              className="hidden items-center gap-1 text-sm font-semibold text-foreground hover:text-foreground sm:inline-flex"
            >
              {home.guidesViewAllLabel} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {home.guides.map((g) => (
              <button
                key={g.id ?? g.title}
                type="button"
                onClick={() =>
                  openMarketingLink(g.ctaHref, () => {
                    const target = resolveGuideNavigateTo(g);
                    const location =
                      target === "Eat & Drink" || target === "Meet-Up Groups"
                        ? undefined
                        : { borough: g.borough, neighborhood: g.neighborhood };
                    onNavigate(target, location);
                  })
                }
                className="group flex flex-col overflow-hidden rounded-2xl bg-card text-left transition-all hover:-translate-y-0.5"
              >
                <div className="relative h-36 overflow-hidden">
                  <CdnImage
                    fill
                    src={g.imageUrl}
                    alt={g.title}
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={cn(
                      "absolute -bottom-4 left-4 grid h-10 w-10 place-items-center rounded-full border-2 border-card",
                      TONE_BG[g.tone],
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 pt-6">
                  <h3 className="font-display text-base font-semibold leading-snug text-foreground">
                    {g.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {g.desc}
                  </p>
                  <span
                    className={cn(
                      "mt-4 inline-flex items-center gap-1 text-sm font-semibold",
                      TONE_LINK[g.tone],
                    )}
                  >
                    {g.ctaLabel?.trim() || home.guideCtaDefault}{" "}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section>
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
          {home.howItWorksSectionTitle}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {home.howItWorksSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-3xl border border-border/80 bg-card/90 p-6 "
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold",
                    TONE_BG[step.tone],
                  )}
                >
                  {step.step}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <SiteLucideIcon
                      name={step.icon}
                      className={cn("h-5 w-5 shrink-0", TONE_LINK[step.tone])}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className={cn("px-6 py-8 sm:px-10", CYBER_PANEL)}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar) => (
            <div key={pillar.title} className="flex items-start gap-3">
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                  TONE_BG[pillar.tone],
                )}
              >
                <SiteLucideIcon name={pillar.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR PICKS */}
      {(popularPicks.length > 0 || popularGroup) && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {home.popularPicksSectionTitle}
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("Events")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-foreground"
            >
              {home.popularPicksViewAllLabel}{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
            {popularPicks.map((p) => (
              <PreviewCard key={p.id} provider={p} onOpen={onOpenProvider} />
            ))}
            {popularGroup && (
              <button
                onClick={() => onOpenGroup(popularGroup)}
                className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card text-left transition-all hover:-translate-y-0.5 sm:w-auto"
              >
                <div className="relative grid h-32 place-items-center bg-muted">
                  <Users className="h-10 w-10 text-foreground" />
                  <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-foreground">
                    {home.culturePickBadge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">
                    {popularGroup.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {locationLine(
                      popularGroup.borough,
                      popularGroup.neighborhood,
                    )}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {popularGroup.ageRange} · {home.cultureCircleLabel}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {home.freeToJoin}
                  </p>
                </div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* EMAIL */}
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-10 sm:px-12">
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-muted text-foreground ">
            <Mail className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              {home.newsletterTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {home.newsletterSubtitle}
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!email) return;
              try {
                const locale = document.documentElement.lang || "hu";
                const r = await fetch("/api/public/newsletter/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, locale }),
                });
                const j = (await r.json()) as { ok?: boolean };
                if (!r.ok || !j.ok) throw new Error("subscribe failed");
                toast.success(home.newsletterSuccess);
                setEmail("");
              } catch {
                toast.error(tProgram("subscribeError"));
              }
            }}
            className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={home.newsletterPlaceholder}
              className="h-11 rounded-full border-border/80 bg-background/50 sm:w-64"
            />
            <Button
              type="submit"
              className="h-11 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            >
              {home.newsletterCta}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground md:text-left">
          {home.newsletterFinePrint}
        </p>
      </section>
    </div>
  );
}

function PreviewCard({
  provider,
  onOpen,
}: {
  provider: Provider;
  onOpen: (p: Provider) => void;
}) {
  const locationLine = useVenueLocationLine();
  const badgeLabel = useBadgeLabel();
  const ageLabel = useAgeRangeLabel();
  const activityLabel = useActivityTypeLabel();
  const formatPrice = useFormatVenuePrice();
  const price = formatPrice(provider);
  const badge = provider.badges[0];
  return (
    <button
      onClick={() => onOpen(provider)}
      className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card text-left transition-all hover:-translate-y-0.5 sm:w-auto"
    >
      <div className="relative h-32 overflow-hidden bg-muted">
        <CdnImage
          fill
          resolveBase={provider.website}
          src={
            provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing
          }
          alt={provider.name}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
            {badgeLabel(badge)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">
          {provider.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {locationLine(provider.borough, provider.neighborhood)}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {ageLabel(provider.ageRanges[0])} ·{" "}
          {activityLabel(provider.activityTypes[0])}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {price.main}
            {price.suffix && (
              <span className="text-[10px] font-normal text-muted-foreground">
                {price.suffix}
              </span>
            )}
          </span>
          <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
        </div>
      </div>
    </button>
  );
}
