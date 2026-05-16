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
import type { MeetupGroup } from "@/types/meetup";
import type { SiteDoc } from "@/types/site";
import { DEFAULT_SITE } from "@/types/site";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { toast } from "sonner";
import { CdnImage } from "@/components/ui/CdnImage";
import { SiteLucideIcon } from "@/lib/siteLucideIcon";
import { useProvidersCatalog, useMeetupGroupsCatalog, useSiteCatalog, useNeighborhoodsCatalog } from "@/hooks/useCatalog";
import { BOROUGHS, NEIGHBORHOODS } from "@/data/locations";

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

const CATEGORIES: {
  key: Category | "Meet-Up Groups";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  tone: "orange" | "teal" | "pink" | "amber" | "blue";
}[] = [
  { key: "Events", icon: CalendarDays, description: "Concerts, festivals, boat parties, rooftops & late-night happenings", tone: "orange" },
  { key: "Parties", icon: PartyPopper, description: "Clubs, ruin bars, DJ sets, themed nights & weekend blowouts", tone: "teal" },
  { key: "Restaurants", icon: UtensilsCrossed, description: "Fine dining, bistro gems, street food courts & Danube-side tables", tone: "pink" },
  { key: "Cafés", icon: Coffee, description: "Specialty coffee, brunch spots, dessert bars & all-day hangouts", tone: "amber" },
  { key: "Meet-Up Groups", icon: Palette, description: "Gallery walks, culture circles, food clubs & local creator meetups", tone: "blue" },
];

const TONE_BG: Record<string, string> = {
  orange: "bg-orange/15 text-orange",
  teal: "bg-teal-soft text-teal",
  pink: "bg-[hsl(340_70%_94%)] text-[hsl(340_60%_45%)]",
  amber: "bg-[hsl(40_90%_92%)] text-[hsl(35_85%_45%)]",
  blue: "bg-[hsl(210_80%_94%)] text-[hsl(210_70%_45%)]",
};

const TONE_LINK: Record<string, string> = {
  orange: "text-orange",
  teal: "text-teal",
  pink: "text-[hsl(340_60%_45%)]",
  amber: "text-[hsl(35_85%_45%)]",
  blue: "text-[hsl(210_70%_45%)]",
};

interface Props {
  onNavigate: (view: Category | "Saved" | "Calculator" | "Meet-Up Groups", location?: { borough?: BoroughChoice; neighborhood?: string }) => void;
  onOpenProvider: (p: Provider) => void;
  onOpenGroup: (g: MeetupGroup) => void;
}

export function HomeView({ onNavigate, onOpenProvider, onOpenGroup }: Props) {
  const [borough, setBorough] = useState<BoroughChoice>("All");
  const [email, setEmail] = useState("");
  const { data: providers = [] } = useProvidersCatalog();
  const { data: meetups = [] } = useMeetupGroupsCatalog();
  const { data: siteData } = useSiteCatalog();
  const { data: locationsByBorough } = useNeighborhoodsCatalog();
  const s = siteData ?? ({ _id: "main", ...DEFAULT_SITE } as SiteDoc);
  const hoodList =
    borough === "All" ? [] : (locationsByBorough?.[borough] ?? NEIGHBORHOODS[borough]);

  const popularPicks = s.homePopularPickProviderNames
    .map((name) => providers.find((p) => p.name === name))
    .filter((p): p is Provider => !!p);

  const popularGroup = s.homePopularMeetupGroupId.trim()
    ? meetups.find((g) => g.id === s.homePopularMeetupGroupId.trim())
    : undefined;

  const scrollToNeighborhoods = () => {
    document.getElementById("home-neighborhoods")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-card via-background to-[hsl(280_50%_12%)] neon-border">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(310_100%_50%_/_0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(180_100%_50%_/_0.08),transparent_55%)]" />
        <div className="relative grid items-center gap-8 p-8 sm:p-12 md:grid-cols-[1.1fr_1fr] md:p-16">
          <div className="relative z-10">
            <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              <span className="neon-text">{s.homeHeroTitle}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">{s.homeHeroSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-primary px-6 text-primary-foreground shadow-[0_0_24px_hsl(310_100%_62%_/_0.35)] hover:bg-primary/90"
                onClick={() => onNavigate("Events")}
              >
                {s.homeHeroPrimaryCta} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-accent/40 bg-card/50 px-6 text-accent hover:bg-accent/10"
                onClick={scrollToNeighborhoods}
              >
                {s.homeHeroSecondaryCta}
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              {s.homeHeroTagline}
            </p>
          </div>
          <div className="relative">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-accent/20 shadow-elevated ring-1 ring-primary/20">
              <CdnImage
                src={s.homeHeroUrl}
                alt="Budapest city lights at night along the Danube"
                width={1280}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute -right-2 -top-2 hidden text-orange md:block" aria-hidden>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 4v10M40 12l-7 7M44 28H34M12 12l7 7M4 28h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <h2 className="text-center font-display text-3xl font-bold text-foreground sm:text-4xl">{s.homeCategoriesTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map(({ key, icon: Icon, description, tone }) => (
            <button
              key={key}
              onClick={() =>
                onNavigate(key === "Meet-Up Groups" ? "Meet-Up Groups" : (key as Category))
              }
              className="group flex flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className={cn("grid h-16 w-16 place-items-center rounded-full", TONE_BG[tone])}>
                <Icon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{key}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-semibold", TONE_LINK[tone])}>
                Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* NEIGHBORHOOD DISCOVERY */}
      <section id="home-neighborhoods" className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-12 sm:px-12 sm:py-14">
        <Building2 className="pointer-events-none absolute -left-4 top-6 h-32 w-32 text-foreground/[0.04]" aria-hidden />
        <Building2 className="pointer-events-none absolute -right-4 bottom-6 h-32 w-32 text-foreground/[0.04]" aria-hidden />
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">{s.neighborhoodSectionTitle}</h2>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          {HOME_BOROUGH_CHOICES.map((b) => {
            const active = b === borough;
            const label = b === "All" ? "All" : b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBorough(b)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground hover:border-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
          {borough === "All"
            ? "Browse every borough at once in Discover, or pick a borough above to explore its neighborhoods."
            : s.popularNeighborhoodsCaption.replace(/\{borough\}/g, borough)}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {borough === "All" ? (
            <button
              type="button"
              onClick={() => onNavigate("Events", { borough: "All" })}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-teal hover:text-teal"
            >
              Open Discover (all NYC)
            </button>
          ) : (
            <>
              {hoodList.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onNavigate("Events", { borough, neighborhood: n })}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground transition-colors hover:border-teal hover:text-teal"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate("Events", { borough })}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground transition-colors hover:border-teal hover:text-teal"
              >
                View all
              </button>
            </>
          )}
        </div>
      </section>

      {/* GUIDES */}
      {s.guides.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.guidesSectionTitle}</h2>
            <button
              type="button"
              onClick={() =>
                openMarketingLink(s.guidesViewAllHref, () => {
                  onNavigate("Events");
                })
              }
              className="hidden items-center gap-1 text-sm font-semibold text-foreground hover:text-teal sm:inline-flex"
            >
              {s.guidesViewAllLabel} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {s.guides.map((g) => (
              <button
                key={g.id ?? g.title}
                type="button"
                onClick={() =>
                  openMarketingLink(g.ctaHref, () => {
                    onNavigate("Events", { borough: g.borough, neighborhood: g.neighborhood });
                  })
                }
                className="group flex flex-col overflow-hidden rounded-2xl bg-card text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="relative h-36 overflow-hidden">
                  <CdnImage
                    src={g.imageUrl}
                    alt={g.title}
                    width={800}
                    height={512}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className={cn("absolute -bottom-4 left-4 grid h-10 w-10 place-items-center rounded-full ring-4 ring-card", TONE_BG[g.tone])}>
                    <Building2 className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 pt-6">
                  <h3 className="font-display text-base font-semibold leading-snug text-foreground">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{g.desc}</p>
                  <span className={cn("mt-4 inline-flex items-center gap-1 text-sm font-semibold", TONE_LINK[g.tone])}>
                    {g.ctaLabel?.trim() || "Explore guide"}{" "}
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
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">{s.howItWorksSectionTitle}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.howItWorksSteps.map((step) => (
            <div key={step.step} className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-start gap-4">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold", TONE_BG[step.tone])}>
                  {step.step}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-foreground">{step.title}</h3>
                    <SiteLucideIcon name={step.icon} className={cn("h-5 w-5 shrink-0", TONE_LINK[step.tone])} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="rounded-[2rem] bg-[hsl(24_45%_94%)] px-6 py-8 sm:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {s.trustPillars.map((pillar) => (
            <div key={pillar.title} className="flex items-start gap-3">
              <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", TONE_BG[pillar.tone])}>
                <SiteLucideIcon name={pillar.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">{pillar.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR PICKS */}
      {(popularPicks.length > 0 || popularGroup) && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.popularPicksSectionTitle}</h2>
            <button
              type="button"
              onClick={() => onNavigate("Events")}
              className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-teal"
            >
              {s.popularPicksViewAllLabel} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
            {popularPicks.map((p) => (
              <PreviewCard key={p.id} provider={p} onOpen={onOpenProvider} />
            ))}
            {popularGroup && (
              <button
                onClick={() => onOpenGroup(popularGroup)}
                className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated sm:w-auto"
              >
                <div className="relative grid h-32 place-items-center bg-[hsl(210_80%_94%)]">
                  <Users className="h-10 w-10 text-[hsl(210_70%_45%)]" />
                  <span className="absolute left-2 top-2 rounded-full bg-[hsl(210_70%_45%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Parent Favorite
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">{popularGroup.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{popularGroup.neighborhood}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">Ages {popularGroup.ageRange} · Meet-Up Group</p>
                  <p className="mt-2 text-sm font-semibold text-orange">Free</p>
                </div>
              </button>
            )}
          </div>
        </section>
      )}

      {/* EMAIL */}
      <section className="overflow-hidden rounded-[2rem] bg-[hsl(340_70%_96%)] px-6 py-10 sm:px-12">
        <div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(340_70%_88%)] text-[hsl(340_60%_40%)]">
            <Mail className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{s.newsletterTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.newsletterSubtitle}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email) return;
              toast.success("You're on the list! We'll be in touch soon.");
              setEmail("");
            }}
            className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={s.newsletterPlaceholder}
              className="h-11 rounded-full border-border bg-card sm:w-64"
            />
            <Button type="submit" className="h-11 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
              {s.newsletterCta}
            </Button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground md:text-left">{s.newsletterFinePrint}</p>
      </section>
    </div>
  );
}

function PreviewCard({ provider, onOpen }: { provider: Provider; onOpen: (p: Provider) => void }) {
  const badge = provider.badges[0];
  return (
    <button
      onClick={() => onOpen(provider)}
      className="group flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated sm:w-auto"
    >
      <div className="relative h-32 overflow-hidden">
        <CdnImage
          resolveBase={provider.website}
          src={provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing}
          alt={provider.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-card/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur">
            {badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">{provider.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{provider.neighborhood}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Ages {provider.ageRanges[0]} · {provider.activityTypes[0]}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-orange">
            ${provider.pricePerClass}
            <span className="text-[10px] font-normal text-muted-foreground">/class</span>
          </span>
          <Star className="h-3.5 w-3.5 fill-orange text-orange" />
        </div>
      </div>
    </button>
  );
}
