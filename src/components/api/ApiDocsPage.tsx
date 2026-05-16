import type { ReactNode } from "react";
import Link from "next/link";

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <figure className="my-4 space-y-2">
      {title ? <figcaption className="text-xs font-medium text-muted-foreground">{title}</figcaption> : null}
      <pre className="max-h-[min(70vh,520px)] overflow-auto rounded-xl border border-border bg-card p-4 text-[13px] leading-relaxed text-card-foreground shadow-sm">
        <code className="font-mono whitespace-pre">{children}</code>
      </pre>
    </figure>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border/60 py-14 last:border-0">
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function EndpointCard({
  method,
  path,
  auth,
  children,
}: {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  auth: string;
  children: ReactNode;
}) {
  const methodColor =
    method === "GET"
      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
      : method === "POST"
        ? "bg-sky-500/15 text-sky-800 dark:text-sky-200"
        : method === "PUT"
          ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
          : method === "PATCH"
            ? "bg-violet-500/15 text-violet-800 dark:text-violet-200"
            : "bg-rose-500/15 text-rose-800 dark:text-rose-200";
  return (
    <article className="rounded-xl border border-border bg-background/80 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 gap-y-2">
        <span className={`rounded-md px-2.5 py-1 text-xs font-bold tracking-wide ${methodColor}`}>{method}</span>
        <code className="font-mono text-sm text-foreground">{path}</code>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground/80">Auth:</span> {auth}
      </p>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </article>
  );
}

const PROVIDER_FIELDS = `interface Provider {
  id: string;
  name: string;
  category: "Venues" | "Parties" | "Restaurants" | "Cafés";
  borough: "Belváros" | "Terézváros" | "Erzsébetváros" | "Ferencváros" | "Buda" | "Óbuda" | "Újbuda";
  neighborhood: string;
  address: string;
  activityTypes: string[];
  ageRanges: ("All ages" | "Family" | "18+" | "21+" | "Late night")[];
  dayTimeTags: ("Weekday" | "Weekend" | "Morning" | "Afternoon" | "Evening" | "Late night")[];
  pricePerClass: number;
  /** Canonical storage currency is HUF. Legacy EUR rows are converted on read until migrated. */
  priceCurrency?: "HUF" | "EUR";
  shortDescription: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  badges: ("Featured" | "Popular" | "New" | "Staff Pick" | "Hidden Gem" | "Weekend Vibes")[];
  image: string;
  email: string;
  website: string;
  phone: string;
  announcementTitle?: string;
  announcementDescription?: string;
  announcementBadge?: string;
  galleryImages?: string[];
  bookingEnabled?: boolean;
  /** Optional published food & drink menu; menu.venueLink is computed on ingest. */
  menu?: VenueMenu;
  /** Optional dated packages (not timed events in the Events calendar). */
  eventOfferings?: EventOffering[];
  /** Union of item tags — computed on ingest; do not send in payloads. */
  menuTags?: string[];
  /**
   * Localized copy + URL slugs. Base document fields = English.
   * Set locales.en.slug to the canonical public path segment (district-neutral, e.g. budapest-park).
   * Also provide hu, es, it, he, ar on curated ingest. See localeIngestRules + venueSlug.ts.
   */
  locales?: Partial<Record<"en" | "hu" | "es" | "it" | "he" | "ar", {
    name?: string;
    shortDescription?: string;
    longDescription?: string;
    slug?: string;
    address?: string;
    announcementTitle?: string;
    announcementDescription?: string;
    announcementBadge?: string;
    image?: string;
  }>>;
}`;

const VENUE_LINK = `interface VenueLink {
  id: string;              // prov-...
  name: string;
  category: "Venues" | "Parties" | "Restaurants" | "Cafés";
  borough: Borough;
  neighborhood: string;
  address: string;
  website?: string;
  menuUrl?: string;
}`;

const VENUE_MENU = `interface VenueMenu {
  menuUrl?: string;
  sourceUrls: string[];   // https official menu sources
  lastVerifiedAt: string; // YYYY-MM-DD
  sections: MenuSection[];
  /** Set on ingest from the provider row — do not author in payloads. */
  venueLink?: VenueLink;
}

interface MenuSection {
  id: string;
  title: string;
  kind: "food" | "drink" | "mixed";
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  kind: "food" | "drink" | "other";
  name: string;
  description?: string;
  price?: { amount: number; currency: "HUF" | "EUR"; unit?: "each" | "glass" | "bottle" | "portion" | "ticket"; source: "published" | "estimated" };
  tags: string[];         // canonical tags — see GET /api/public/menu-items
  dietary?: ("vegan" | "vegetarian" | "gluten-free")[];
}`;

const NIGHT_EVENT = `interface NightEvent {
  id: string;               // event-...
  title: string;
  shortDescription: string;
  longDescription: string;
  startsAt: string;         // ISO 8601 with offset, e.g. 2026-08-01T20:00:00+02:00
  endsAt: string;
  timezone?: string;        // default Europe/Budapest
  doorsOpenAt?: string;
  /** Host provider ids; first = primary host (location + cards). */
  venueIds: string[];
  /** Snapshots written on ingest — do not author in payloads. */
  venueLinks?: VenueLink[];
  borough: Borough;
  neighborhood: string;
  entryFees: { id: string; label: string; amount: number; currency: "HUF" | "EUR" | "FREE"; source: "published" | "estimated"; notes?: string }[];
  activityTypes: string[];
  ageRanges: AgeRange[];
  dayTimeTags: DayTimeTag[];
  badges: FeaturedBadge[];
  image: string;
  galleryImages?: string[];
  website: string;
  bookingUrl: string;
  email: string;
  phone: string;
  status: "scheduled" | "cancelled" | "sold_out" | "postponed";
  locales?: Partial<Record<"hu" | "es" | "it" | "he" | "ar", { title: string; shortDescription: string; longDescription: string; slug: string }>>;
}

/** GET /api/public/events adds resolved hosts: */
interface PublicNightEvent extends NightEvent {
  venues: VenueLink[];
  venuesResolved: boolean;
}`;

const MENU_ITEMS_RESPONSE = `{
  "items": [
    {
      "id": "prov-cafe:espresso",
      "name": "Espresso",
      "kind": "drink",
      "tags": ["coffee", "specialty-coffee"],
      "price": { "amount": 890, "currency": "HUF", "unit": "each", "source": "published" },
      "providerId": "prov-cafe",
      "providerName": "Example Café",
      "category": "Cafés",
      "borough": "Erzsébetváros",
      "neighborhood": "Gozsdu Udvar",
      "address": "1075 Budapest, Kazinczy utca 1",
      "venue": { "id": "prov-cafe", "name": "Example Café", "category": "Cafés", "...": "VenueLink" },
      "sectionTitle": "Coffee",
      "source": "venue",
      "eventTitle": null,
      "venueResolved": true
    }
  ],
  "total": 42,
  "providersWithMenu": 8,
  "tourReadiness": {
    "palinka": { "eligible": 2, "ready": false, "stopCount": 3 },
    "foodie": { "eligible": 1, "ready": false, "stopCount": 3 },
    "coffee": { "eligible": 3, "ready": true, "stopCount": 3 }
  }
}`;

const TOUR_RESPONSE = `{
  "tourId": "palinka",
  "seed": "palinka-1715000000",
  "templateId": "palinka",
  "stops": [
    {
      "providerId": "prov-cellar",
      "providerName": "Example Cellar",
      "category": "Restaurants",
      "borough": "Erzsébetváros",
      "neighborhood": "Jewish Quarter",
      "address": "1075 Budapest, ...",
      "website": "https://...",
      "image": "https://i.ibb.co/...",
      "highlightItems": [
        { "name": "House plum pálinka (4 cl)", "priceLabel": "1,490 Ft" }
      ]
    }
  ]
}`;

const MEETUP_FIELDS = `interface MeetupGroup {
  id: string;
  name: string;
  borough: Borough;
  neighborhood: string;
  groupType: "Art & Gallery" | "Live Culture" | "Food & Wine Circle" | "Nightlife Crew" | "Local Creators";
  ageRange: "All ages" | "18+" | "21+" | "Family" | "Late night";
  cadence: "Weekly" | "Monthly" | "Weekend" | "Pop-up";
  instagram: string;
  website: string;
  description: string;
  initials: string;
  icon: "stroller" | "skyline" | "heart" | "coffee" | "playground" | "community";
  palette: "teal" | "orange" | "beige" | "charcoal";
  coverImageUrl?: string;
}`;

const SITE_DOC = `interface SiteDoc {
  _id: "main";
  logoUrl: string;
  homeHeroUrl: string;
  discoverHeroUrl: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroPrimaryCta: string;
  homeHeroSecondaryCta: string;
  homeHeroTagline: string;
  homeCategoriesTitle: string;
  neighborhoodSectionTitle: string;
  /** Use "{borough}" as a placeholder for the selected borough name. */
  popularNeighborhoodsCaption: string;
  guidesSectionTitle: string;
  guidesViewAllLabel: string;
  guidesViewAllHref?: string;
  guides: SiteGuide[];
  howItWorksSectionTitle: string;
  howItWorksSteps: SiteHowStep[];
  trustPillars: SiteTrustPillar[];
  trustLines: string[];
  popularPicksSectionTitle: string;
  popularPicksViewAllLabel: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  newsletterFinePrint: string;
  sidebarTitle: string;
  sidebarBody: string;
  sidebarCtaLabel: string;
  homePopularPickProviderNames: string[];
  homePopularMeetupGroupId: string;
  /** Fixed HUF conversion rates for the public currency switcher (defaults 350 / 300). */
  currencyRates: { hufPerEur: number; hufPerUsd: number };
  calculator: SiteCalculatorCopy;
  account: SiteAccountSettings;
}

interface SiteCalculatorCopy {
  title: string;
  subtitle: string;
  clearAllCta: string;
  emptyTitle: string;
  emptyMessage: string;
  asideTitle: string;
  asideSubtitle: string;
  asideFootnote: string;
  providerLinePriceSuffix: string;
  estimatedTotalLabel: string;
}

/** My Account, family prefs, neighborhood preview, alerts — full shape in \`src/types/site.ts\`. */
interface SiteAccountSettings {
  page: { title: string; subtitle: string };
  navTabs: { id: string; label: string }[];
  saved: { tabId: string; title: string; filterChips: { label: string; categoryFilter: string }[]; /* … */ };
  activityPlan: { tabId: string; title: string; priceUnits: { class: string; week: string; party: string; visit: string }; /* … */ };
  familyPreferences: { tabId: string; sections: { id: string; label: string; options: string[]; defaultSelected: string[] }[]; /* … */ };
  neighborhood: { tabId: string; title: string; nearbyNeighborhoods: string[]; /* … */ };
  alerts: { tabId: string; options: string[]; frequencyChoices: string[]; /* … */ };
  privacy: { headline: string; supportEmail: string; /* … */ };
}

type SiteTone = "orange" | "teal" | "pink" | "amber" | "blue";
type SiteIconKey =
  | "map-pin" | "list-checks" | "heart" | "shield-check" | "compass" | "users" | "calculator";

interface SiteGuide {
  id?: string;
  title: string;
  desc: string;
  borough: Borough;
  neighborhood: string;
  imageUrl: string;
  tone: SiteTone;
  ctaLabel?: string;
  ctaHref?: string;
}

interface SiteHowStep {
  step: number;
  title: string;
  desc: string;
  tone: SiteTone;
  icon: SiteIconKey;
}

interface SiteTrustPillar {
  title: string;
  desc: string;
  tone: SiteTone;
  icon: SiteIconKey;
}`;

const BRAIN_DOC = `interface BrainSettingsDoc {
  _id: "main";
  systemPrompt: string;
  model: string;
  starters: string[];
}`;

const INGEST_BATCH = `{
  "operations": [
    { "resource": "providers", "action": "list" },
    { "resource": "provider", "action": "get", "id": "my-studio" },
    { "resource": "site", "action": "get" },
    { "resource": "brain", "action": "get" },
    { "resource": "locations", "action": "list" },
    {
      "resource": "provider",
      "action": "upsert",
      "document": { "id": "my-studio", "...": "full Provider fields" }
    },
    {
      "resource": "providers",
      "action": "replaceAll",
      "documents": [{ "id": "a", "name": "..." }]
    },
    { "resource": "providers", "action": "deleteMany", "ids": ["legacy-1", "legacy-2"] },
    {
      "resource": "site",
      "action": "put",
      "document": { "logoUrl": "https://...", "...": "full SiteDoc fields" }
    },
    {
      "resource": "locations",
      "action": "replace",
      "locations": [
        { "borough": "Belváros", "neighborhoods": ["Inner City", "Jewish Quarter"] }
      ]
    },
    { "resource": "events", "action": "list" },
    {
      "resource": "event",
      "action": "upsert",
      "document": {
        "id": "event-example-2026",
        "venueIds": ["prov-host-arena"],
        "startsAt": "2026-08-01T20:00:00+02:00",
        "...": "NightEvent fields — upsert host venue first"
      }
    },
    {
      "resource": "provider",
      "action": "patch",
      "id": "prov-cafe",
      "patch": {
        "menu": {
          "menuUrl": "https://cafe.hu/menu",
          "sourceUrls": ["https://cafe.hu/menu"],
          "lastVerifiedAt": "2026-05-16",
          "sections": [{ "id": "drinks", "title": "Drinks", "kind": "drink", "items": [] }]
        }
      }
    }
  ]
}`;

const INGEST_SINGLE = `{
  "resource": "provider",
  "action": "upsert",
  "document": { "id": "solo-provider", "name": "Example", "...": "remaining Provider fields" }
}`;

const INGEST_RESPONSE = `{
  "ok": true,
  "results": [
    { "index": 0, "ok": true, "data": [ { "id": "...", "name": "..." } ] },
    { "index": 1, "ok": true, "data": { "id": "my-studio", "name": "..." } },
    { "index": 2, "ok": false, "error": "provider not found" }
  ]
}`;

const API_VERSION = "0.2.0";

const nav = [
  { href: "#overview", label: "Overview" },
  { href: "#urls", label: "Venue URLs" },
  { href: "#public", label: "Public" },
  { href: "#brain", label: "Night Guide" },
  { href: "#ingest", label: "Ingest" },
  { href: "#admin", label: "Admin" },
  { href: "#errors", label: "Errors" },
];

export function ApiDocsPage({ origin }: { origin: string }) {
  const base = origin || "https://budapest-night.vercel.app";

  return (
    <div className="min-h-screen bg-ivory text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-ivory/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal">
              Budapest Night · API v{API_VERSION}
            </p>
            <h1 className="font-display text-xl font-bold sm:text-2xl">HTTP API reference</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Catalog, Night Guide AI, machine ingest, and admin endpoints (app package{" "}
              <span className="font-mono text-foreground/80">v{API_VERSION}</span>). Paths are relative to your deployment
              (for example <span className="font-mono text-foreground/80">{base}</span>).
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/"
              className="rounded-lg border border-border bg-background px-3 py-2 font-medium text-foreground transition hover:bg-muted"
            >
              Home
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-border bg-background px-3 py-2 font-medium text-foreground transition hover:bg-muted"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-8 lg:flex-row lg:items-start lg:gap-12 sm:px-6">
        <nav
          aria-label="On this page"
          className="lg:sticky lg:top-24 lg:w-52 lg:shrink-0 lg:self-start"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
          <ul className="mt-3 space-y-1 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="block rounded-md px-2 py-1.5 text-foreground/80 transition hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <Section id="overview" title="Overview">
            <p>
              Budapest Night exposes JSON APIs for the public catalog, a streaming Night Guide chat proxy, a{" "}
              <strong>machine ingest</strong> pipeline secured by <code className="rounded bg-muted px-1 font-mono text-sm">INGEST_API_KEY</code>, and{" "}
              <strong>browser session</strong> APIs for the admin console. Unless noted, request and response bodies use{" "}
              <code className="rounded bg-muted px-1 font-mono text-sm">application/json</code> with UTF-8.
            </p>
            <ul className="list-inside list-disc space-y-2 text-foreground/90">
              <li>
                <strong>Public routes</strong> are read-only and safe to call from browsers or edge caches (no secrets
                required).
              </li>
              <li>
                <strong>Admin routes</strong> require an HTTP-only cookie set by <code className="font-mono">POST /api/admin/login</code>; use a
                browser or forward <code className="font-mono">Cookie</code> from the same origin.
              </li>
              <li>
                <strong>Ingest</strong> is intended for servers, ETL jobs, or trusted partners — never expose{" "}
                <code className="font-mono">INGEST_API_KEY</code> in client-side code.
              </li>
              <li>
                <strong>Prices</strong> are stored in HUF on providers and menu items; the web app reads{" "}
                <code className="font-mono">currencyRates</code> from <code className="font-mono">GET /api/public/site</code> for EUR/USD display.
              </li>
            </ul>
          </Section>

          <Section id="urls" title="Venue &amp; event URLs (web app)">
            <p>
              These paths are implemented by the Next.js app (not separate JSON resources). They open the venue sheet or a
              shareable full page and accept either a <strong>canonical slug</strong> or a legacy key.
            </p>
            <ul className="list-inside list-disc space-y-2 text-foreground/90">
              <li>
                <code className="font-mono">/venue/{"{slug}"}</code> — venue profile (query <code className="font-mono">?from=venues|events|…</code> controls back navigation).
              </li>
              <li>
                <code className="font-mono">/venue/{"{slug}"}/full</code> — full-page venue layout with share chrome.
              </li>
              <li>
                <code className="font-mono">/event/{"{slug}"}</code> and <code className="font-mono">/event/{"{slug}"}/full</code> — timed event profiles.
              </li>
              <li>
                Locale prefix optional: <code className="font-mono">/hu/venue/budapest-park</code> uses Hungarian copy; slug resolution checks all locales.
              </li>
            </ul>
            <p>
              <strong>Canonical slugs</strong> must not embed the wrong Budapest district (e.g. use{" "}
              <code className="font-mono">budapest-park</code> for the Ferencváros open-air park, not{" "}
              <code className="font-mono">prov-budapest-park-obuda</code>). Set{" "}
              <code className="font-mono">locales.en.slug</code> on ingest; logic lives in{" "}
              <code className="font-mono">src/lib/venueSlug.ts</code>. Legacy <code className="font-mono">prov-*</code> URL segments still resolve but the app redirects to the canonical slug.
            </p>
            <p>
              Timed events link to hosts via <code className="font-mono">venueIds</code> (internal ids). The venue UI lists upcoming events whose{" "}
              <code className="font-mono">venueIds</code> include that provider.
            </p>
          </Section>

          <Section id="public" title="Public catalog (read)">
            <p>These endpoints read from MongoDB when <code className="font-mono">MONGODB_URI</code> is configured; otherwise they fall back to built-in defaults where noted.</p>

            <div className="space-y-6">
              <EndpointCard method="GET" path="/api/public/providers" auth="None">
                <p>
                  Returns <code className="font-mono">Provider[]</code>. Mongo <code className="font-mono">_id</code> is stripped from each object.
                </p>
                <p>
                  <strong>Query:</strong> <code className="font-mono">locale</code> — optional{" "}
                  <code className="font-mono">en</code> | <code className="font-mono">hu</code> | <code className="font-mono">es</code> |{" "}
                  <code className="font-mono">it</code> | <code className="font-mono">he</code> | <code className="font-mono">ar</code> (overlays{" "}
                  <code className="font-mono">locales[locale]</code> on name, descriptions, and slug). Public venue links should use{" "}
                  <code className="font-mono">locales.en.slug</code> when set, otherwise the canonical slug algorithm in{" "}
                  <code className="font-mono">getCanonicalVenueSlug()</code> — not raw internal ids in marketing URLs.
                </p>
                <p className="text-muted-foreground">
                  <strong>503</strong> if the database is not configured.
                </p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/events" auth="None">
                <p>
                  Returns <code className="font-mono">PublicNightEvent[]</code> — timed concerts and ticketed shows (not venue listings).
                  Each event includes <code className="font-mono">venues</code> (resolved host snapshots) and{" "}
                  <code className="font-mono">venuesResolved</code>.
                </p>
                <p>
                  <strong>Query:</strong>{" "}
                  <code className="font-mono">locale</code> (same as providers);{" "}
                  <code className="font-mono">upcoming=0</code> to include past/cancelled;{" "}
                  <code className="font-mono">borough</code> to filter by district. Default: upcoming scheduled events only, sorted by{" "}
                  <code className="font-mono">startsAt</code>.
                </p>
                <p className="text-muted-foreground">
                  Stored <code className="font-mono">venueIds</code> must reference existing <code className="font-mono">prov-*</code> ids. On ingest,{" "}
                  <code className="font-mono">venueLinks</code> and district fields sync from the primary host.
                </p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/menu-items" auth="None">
                <p>
                  Flat menu board for Eat &amp; Drink: dishes and drinks with prices, each row linked to a host venue via{" "}
                  <code className="font-mono">venue</code> (<code className="font-mono">VenueLink</code>).
                </p>
                <p>
                  <strong>Query:</strong>{" "}
                  <code className="font-mono">tag</code> (canonical menu tag),{" "}
                  <code className="font-mono">q</code> (search name, venue, section, address, category),{" "}
                  <code className="font-mono">kind</code> (<code className="font-mono">food</code> | <code className="font-mono">drink</code> |{" "}
                  <code className="font-mono">other</code>),{" "}
                  <code className="font-mono">borough</code>,{" "}
                  <code className="font-mono">categories</code> (comma-separated),{" "}
                  <code className="font-mono">limit</code> (max 500, default 120).
                </p>
                <p>
                  <strong>400</strong> if <code className="font-mono">tag</code> is not a canonical tag. Empty catalog returns{" "}
                  <code className="font-mono">{"{ items: [], providersWithMenu: 0, tourReadiness: {...} }"}</code> when DB is missing.
                </p>
                <CodeBlock title="Example response">{MENU_ITEMS_RESPONSE}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  Canonical tags: <code className="font-mono">palinka</code>, <code className="font-mono">coffee</code>,{" "}
                  <code className="font-mono">specialty-coffee</code>, <code className="font-mono">goulash</code>,{" "}
                  <code className="font-mono">hungarian</code>, <code className="font-mono">street-food</code>, and others in{" "}
                  <code className="font-mono">src/data/menuTags.ts</code>.
                </p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/tours/{tourId}" auth="None">
                <p>
                  Generates a themed three-stop tour from venues with <strong>published menu items</strong> matching the template tags.
                  Templates: <code className="font-mono">palinka</code>, <code className="font-mono">foodie</code>,{" "}
                  <code className="font-mono">coffee</code>.
                </p>
                <p>
                  <strong>Query:</strong> <code className="font-mono">seed</code> — optional shuffle seed (defaults to tour id + timestamp).
                </p>
                <p>
                  <strong>404</strong> unknown <code className="font-mono">tourId</code>.{" "}
                  <strong>422</strong> <code className="font-mono">{"{ \"error\": \"not_enough_venues\" }"}</code> when fewer than three eligible venues.
                  Check readiness via <code className="font-mono">tourReadiness</code> on menu-items.
                </p>
                <CodeBlock title="Example response">{TOUR_RESPONSE}</CodeBlock>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/meetup-groups" auth="None">
                <p>
                  Returns <code className="font-mono">MeetupGroup[]</code>. <code className="font-mono">_id</code> stripped.
                </p>
                <p className="text-muted-foreground">
                  <strong>503</strong> if the database is not configured.
                </p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/locations" auth="None">
                <p>
                  Returns a borough → neighborhoods map: <code className="font-mono">Record&lt;Borough, string[]&gt;</code>. If the
                  locations collection is empty or DB is unavailable, the app falls back to static neighborhood lists from the
                  codebase.
                </p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/site" auth="None">
                <p>
                  Returns the marketing shell document for <code className="font-mono">_id: &quot;main&quot;</code>, or merged defaults
                  when missing. Includes <code className="font-mono">currencyRates</code> ({`{ hufPerEur, hufPerUsd }`}) used by the header
                  currency switcher (HUF is canonical in Mongo provider/event documents).
                </p>
                <CodeBlock title="Shape (SiteDoc)">{SITE_DOC}</CodeBlock>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/brain" auth="None">
                <p>
                  Returns only public UI fields for Scout: <code className="font-mono">{"{ \"starters\": string[] }"}</code>. Server-side
                  system prompt and model are not exposed here.
                </p>
              </EndpointCard>
            </div>

            <h3 className="mt-10 font-display text-lg font-semibold">Entity references</h3>
            <CodeBlock title="VenueLink (events, menus, API rows)">{VENUE_LINK}</CodeBlock>
            <CodeBlock title="Provider">{PROVIDER_FIELDS}</CodeBlock>
            <CodeBlock title="VenueMenu &amp; MenuItem">{VENUE_MENU}</CodeBlock>
            <CodeBlock title="NightEvent &amp; PublicNightEvent">{NIGHT_EVENT}</CodeBlock>
            <CodeBlock title="MeetupGroup (Borough same as Provider)">{MEETUP_FIELDS}</CodeBlock>
          </Section>

          <Section id="brain" title="Night Guide chat (streaming)">
            <EndpointCard method="POST" path="/api/brain/chat" auth="None (uses server OpenAI API key)">
              <p>
                Proxies to an OpenAI-compatible chat API with the configured model and system prompt from MongoDB{" "}
                <code className="font-mono">brainSettings</code> (<code className="font-mono">_id: &quot;main&quot;</code>), falling back to app defaults when unset.
              </p>
              <p>
                <strong>Request body (JSON):</strong>
              </p>
              <CodeBlock>{`{
  "messages": [
    { "role": "user", "content": "Ruin bars in Erzsébetváros tonight under €30" }
  ]
}`}</CodeBlock>
              <p>
                <strong>Response:</strong> <code className="font-mono">text/event-stream</code> (OpenAI-compatible SSE chunk stream). Consume with{" "}
                <code className="font-mono">fetch</code> + <code className="font-mono">ReadableStream</code> or an SSE client.
              </p>
              <ul className="list-inside list-disc text-muted-foreground">
                <li>
                  <strong className="text-foreground">500</strong> if <code className="font-mono">BRAIN_OPENAI_API_KEY</code> /{" "}
                  <code className="font-mono">CURATOR_OPENAI_API_KEY</code> is missing on the server.
                </li>
                <li>
                  <strong className="text-foreground">429</strong> rate limit, <strong className="text-foreground">402</strong> credits exhausted, <strong className="text-foreground">502</strong> gateway error.
                </li>
              </ul>
            </EndpointCard>
          </Section>

          <Section id="ingest" title="Machine ingest (full CMS via API)">
              <p>
                Use <code className="font-mono">INGEST_API_KEY</code> for headless content management: read catalog and
                settings, bulk replace collections, patch singletons, upload images to ImgBB, and mirror everything the admin
                UI can change in MongoDB. <strong>Stored raster URLs</strong> in provider, meet-up, and site documents must be{" "}
                <code className="font-mono">https://</code> on <strong>imgbb.com</strong> (e.g. <code className="font-mono">i.ibb.co</code>) or empty; other hosts are rejected.
              </p>
              <p>
                <strong>Provider locales:</strong> root fields are English. Every <code className="font-mono">provider</code>{" "}
                upsert should include <code className="font-mono">locales</code> for{" "}
                <code className="font-mono">hu</code>, <code className="font-mono">es</code>, <code className="font-mono">it</code>,{" "}
                <code className="font-mono">he</code>, and <code className="font-mono">ar</code> (each with{" "}
                <code className="font-mono">name</code>, <code className="font-mono">shortDescription</code>,{" "}
                <code className="font-mono">longDescription</code>, <code className="font-mono">slug</code>). Also set{" "}
                <code className="font-mono">locales.en.slug</code> to the district-neutral canonical URL segment. Public reads accept{" "}
                <code className="font-mono">?locale=</code> on providers and events. See{" "}
                <code className="font-mono">src/lib/curator/localeIngestRules.ts</code> and{" "}
                <code className="font-mono">src/lib/curator/eventLocaleIngestRules.ts</code>.
              </p>
              <p>
                <strong>Menus (Eat &amp; Drink):</strong> attach <code className="font-mono">menu</code> to an existing{" "}
                <code className="font-mono">prov-*</code> via <code className="font-mono">provider</code> + <code className="font-mono">patch</code> or{" "}
                <code className="font-mono">upsert</code>. Do not send <code className="font-mono">menuTags</code> or{" "}
                <code className="font-mono">menu.venueLink</code>. Specialist prompt:{" "}
                <code className="font-mono">scripts/cursor-curator-menu-prompt.txt</code> · rules:{" "}
                <code className="font-mono">src/lib/curator/menuIngestRules.ts</code>.
              </p>
              <p>
                <strong>Timed events:</strong> use <code className="font-mono">resource: &quot;event&quot;</code> (not provider category{" "}
                <code className="font-mono">Events</code>). Upsert host venues first in the same <code className="font-mono">operations</code> array.
                Ticket tiers go in <code className="font-mono">entryFees</code> (HUF/EUR), not <code className="font-mono">pricePerClass</code> on the venue.
                Prompt: <code className="font-mono">scripts/cursor-curator-events-prompt.txt</code>.
              </p>

            <div className="space-y-6">
              <EndpointCard method="GET" path="/api/cron/curator" auth="Bearer CRON_SECRET (Vercel Cron)">
                <p>
                  <strong>Optional automation:</strong> when <code className="font-mono">CURATOR_ENABLED=true</code>, runs Serper search → fetches an official page → OpenAI JSON → Zod validate → dedupe → Mongo{" "}
                  <code className="font-mono">provider</code> upsert (same as ingest). Requires <code className="font-mono">SERPER_API_KEY</code> and{" "}
                  <code className="font-mono">CURATOR_OPENAI_API_KEY</code>. Response JSON includes <code className="font-mono">steps</code>. Schedule in <code className="font-mono">vercel.json</code>.
                </p>
                <p className="text-muted-foreground">
                  <strong>401</strong> if the bearer token does not match <code className="font-mono">CRON_SECRET</code>. Returns <strong>200</strong> with a descriptive body for skip/config errors so crons do not retry endlessly.
                </p>
              </EndpointCard>

              <EndpointCard
                method="GET"
                path="/api/ingest"
                auth="Bearer INGEST_API_KEY or header X-Ingest-Key: &lt;key&gt;"
              >
                <p>
                  Returns a compact JSON summary of ingest capabilities and limits (same authentication as{" "}
                  <code className="font-mono">POST /api/ingest</code>).
                </p>
              </EndpointCard>

              <EndpointCard
                method="POST"
                path="/api/ingest/upload"
                auth="Bearer INGEST_API_KEY or header X-Ingest-Key: &lt;key&gt;"
              >
                <p>
                  Same behavior as <code className="font-mono">POST /api/admin/upload</code>, but for API clients:{" "}
                  <code className="font-mono">multipart/form-data</code> with field <code className="font-mono">file</code>. Requires{" "}
                  <code className="font-mono">IMGBB_API_KEY</code> on the server.
                </p>
                <p className="text-muted-foreground">
                  Success: <code className="font-mono">{"{ \"url\": string, \"displayUrl\": string }"}</code>.
                </p>
              </EndpointCard>

              <EndpointCard
                method="POST"
                path="/api/ingest"
                auth="Bearer INGEST_API_KEY or header X-Ingest-Key: &lt;key&gt;"
              >
              <p>
                Batch <strong>read + write</strong> operations for providers, timed events, meetup groups, site, brain, and locations.
                Up to <strong>100 operations</strong> per request. Each result may include <code className="font-mono">data</code> for successful reads or write metadata (e.g.{" "}
                <code className="font-mono">{"{ \"replaced\": 12 }"}</code>, <code className="font-mono">{"{ \"deletedCount\": 3 }"}</code>).
              </p>
              <p>
                <strong>503</strong> if <code className="font-mono">INGEST_API_KEY</code> is not set. <strong>401</strong> if the key is missing or wrong.{" "}
                <strong>503</strong> if MongoDB is unavailable.
              </p>
              <p>
                <strong>Request:</strong> either a single operation object or <code className="font-mono">{"{ \"operations\": [ ... ] }"}</code>.
              </p>
              <CodeBlock title="Batch example (reads + writes)">{INGEST_BATCH}</CodeBlock>
              <CodeBlock title="Single operation (shorthand)">{INGEST_SINGLE}</CodeBlock>
              <p>
                <strong>Read actions</strong> (successful results include <code className="font-mono">data</code>)
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>
                  <code className="font-mono">providers</code> + <code className="font-mono">list</code> → <code className="font-mono">Provider[]</code> (<code className="font-mono">_id</code> stripped).
                </li>
                <li>
                  <code className="font-mono">provider</code> + <code className="font-mono">get</code> + <code className="font-mono">id</code> → one provider or error <code className="font-mono">provider not found</code>.
                </li>
                <li>
                  <code className="font-mono">meetupGroups</code> + <code className="font-mono">list</code> / <code className="font-mono">meetupGroup</code> + <code className="font-mono">get</code> — same pattern.
                </li>
                <li>
                  <code className="font-mono">site</code> + <code className="font-mono">get</code> → <code className="font-mono">SiteDoc</code> (defaults merged if missing).
                </li>
                <li>
                  <code className="font-mono">brain</code> + <code className="font-mono">get</code> → full <code className="font-mono">BrainSettingsDoc</code> (includes <code className="font-mono">systemPrompt</code> and <code className="font-mono">model</code>; treat as secret).
                </li>
                <li>
                  <code className="font-mono">locations</code> + <code className="font-mono">list</code> → raw Mongo rows{" "}
                  <code className="font-mono">{"{ borough, neighborhoods }[]"}</code>.
                </li>
                <li>
                  <code className="font-mono">events</code> + <code className="font-mono">list</code> → <code className="font-mono">NightEvent[]</code>.
                </li>
                <li>
                  <code className="font-mono">event</code> + <code className="font-mono">get</code> + <code className="font-mono">id</code> → one event or error.
                </li>
              </ul>
              <p>
                <strong>Write actions</strong>
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>
                  <code className="font-mono">provider</code>: <code className="font-mono">upsert</code>, <code className="font-mono">patch</code>, <code className="font-mono">delete</code> (by <code className="font-mono">id</code>).
                  Menu patches recompute <code className="font-mono">menuTags</code> and <code className="font-mono">menu.venueLink</code>; linked events refresh host snapshots when the venue changes.
                </li>
                <li>
                  <code className="font-mono">event</code>: <code className="font-mono">upsert</code>, <code className="font-mono">patch</code>, <code className="font-mono">delete</code>.
                  Every <code className="font-mono">venueIds[]</code> entry must exist before the event is saved. Ingest writes <code className="font-mono">venueLinks</code> and syncs district from <code className="font-mono">venueIds[0]</code>.
                  Do not send <code className="font-mono">venueLinks</code> in payloads.
                </li>
                <li>
                  <code className="font-mono">providers</code>: <code className="font-mono">upsertMany</code> (bulk by <code className="font-mono">id</code>),{" "}
                  <code className="font-mono">replaceAll</code> (clears collection then inserts array; max <strong>2000</strong> docs),{" "}
                  <code className="font-mono">deleteMany</code> with <code className="font-mono">ids: string[]</code> (max <strong>500</strong> ids).
                </li>
                <li>
                  <code className="font-mono">meetupGroup</code> / <code className="font-mono">meetupGroups</code>: same as providers (including{" "}
                  <code className="font-mono">replaceAll</code> / <code className="font-mono">deleteMany</code>).
                </li>
                <li>
                  <code className="font-mono">site</code>: <code className="font-mono">patch</code> (partial merge) or <code className="font-mono">put</code> with full <code className="font-mono">document</code> (replaces <code className="font-mono">_id: &quot;main&quot;</code>).
                </li>
                <li>
                  <code className="font-mono">brain</code>: <code className="font-mono">patch</code> or <code className="font-mono">put</code> with full <code className="font-mono">document</code> for <code className="font-mono">_id: &quot;main&quot;</code>.
                </li>
                <li>
                  <code className="font-mono">locations</code>: <code className="font-mono">replace</code> — deletes all rows, then inserts the provided array.
                </li>
              </ul>
              <CodeBlock title="Brain document shape (for patches)">{BRAIN_DOC}</CodeBlock>
              <p>
                <strong>Response (JSON):</strong> per-operation results with optional <code className="font-mono">data</code>. HTTP <strong>200</strong> when every operation succeeded;{" "}
                <strong>422</strong> when any operation failed.
              </p>
              <CodeBlock title="Example response">{INGEST_RESPONSE}</CodeBlock>
              <p className="text-sm text-muted-foreground">
                <strong>curl</strong> example (replace the host and key):
              </p>
              <CodeBlock>{`curl -sS -X POST "${base}/api/ingest" \\
  -H "Authorization: Bearer $INGEST_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"resource":"provider","action":"patch","id":"my-id","patch":{"rating":5}}'`}</CodeBlock>
            </EndpointCard>
            </div>
          </Section>

          <Section id="admin" title="Admin console APIs">
            <p>
              Used by <Link href="/admin" className="font-medium text-teal underline-offset-4 hover:underline">/admin</Link>. Authenticate with{" "}
              <code className="font-mono">POST /api/admin/login</code>, then call other routes from the same origin with the session cookie.
            </p>

            <div className="space-y-6">
              <EndpointCard method="POST" path="/api/admin/login" auth="None (sets cookie on success)">
                <p>
                  Body: <code className="font-mono">{"{ \"password\": string }"}</code> matching <code className="font-mono">ADMIN_PASSWORD</code>.
                </p>
                <p className="text-muted-foreground">
                  <strong>200</strong> <code className="font-mono">{"{ \"ok\": true }"}</code> and sets HTTP-only cookie. <strong>401</strong> invalid password.{" "}
                  <strong>500</strong> if admin password env is missing.
                </p>
              </EndpointCard>

              <EndpointCard method="POST" path="/api/admin/logout" auth="None">
                <p>Clears the admin session cookie. Returns <code className="font-mono">{"{ \"ok\": true }"}</code>.</p>
              </EndpointCard>

              <EndpointCard method="POST" path="/api/admin/upload" auth="Admin session cookie">
                <p>
                  <code className="font-mono">multipart/form-data</code> with field name <code className="font-mono">file</code> (image blob). Uploads to ImgBB using{" "}
                  <code className="font-mono">IMGBB_API_KEY</code>.
                </p>
                <p className="text-muted-foreground">
                  Success: <code className="font-mono">{"{ \"url\": string, \"displayUrl\": string }"}</code>. Errors <strong>400</strong> missing file,{" "}
                  <strong>401</strong> not logged in, <strong>500</strong> missing ImgBB key, <strong>502</strong> ImgBB failure.
                </p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/providers" auth="Admin session">
                <p>Returns raw Mongo documents (includes <code className="font-mono">_id</code>).</p>
              </EndpointCard>
              <EndpointCard method="POST" path="/api/admin/providers" auth="Admin session">
                <p>
                  Full replace/upsert by <code className="font-mono">id</code>. Body: full <code className="font-mono">Provider</code> (+ optional <code className="font-mono">_id</code> ignored).
                </p>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/providers" auth="Admin session">
                <p>
                  Body: <code className="font-mono">{"{ \"id\": string, ...partial fields }"}</code> — <code className="font-mono">$set</code> style merge.
                </p>
              </EndpointCard>
              <EndpointCard method="DELETE" path="/api/admin/providers?id=&lt;id&gt;" auth="Admin session">
                <p>Deletes one provider by <code className="font-mono">id</code> query param.</p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/meetup-groups" auth="Admin session">
                <p>Raw meetup group documents.</p>
              </EndpointCard>
              <EndpointCard method="POST" path="/api/admin/meetup-groups" auth="Admin session">
                <p>Upsert full <code className="font-mono">MeetupGroup</code> by <code className="font-mono">id</code>.</p>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/meetup-groups" auth="Admin session">
                <p>Partial update by <code className="font-mono">id</code>.</p>
              </EndpointCard>
              <EndpointCard method="DELETE" path="/api/admin/meetup-groups?id=&lt;id&gt;" auth="Admin session">
                <p>Deletes one meetup group by <code className="font-mono">id</code> query param.</p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/site" auth="Admin session">
                <p>Returns <code className="font-mono">SiteDoc</code> (or defaults).</p>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/site" auth="Admin session">
                <p>JSON partial patch merged into <code className="font-mono">_id: &quot;main&quot;</code>.</p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/brain" auth="Admin session">
                <p>Returns full <code className="font-mono">BrainSettingsDoc</code> for editing.</p>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/brain" auth="Admin session">
                <p>Partial patch for <code className="font-mono">_id: &quot;main&quot;</code>.</p>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/locations" auth="Admin session">
                <p>Array of <code className="font-mono">{"{ borough, neighborhoods }"}</code> rows.</p>
              </EndpointCard>
              <EndpointCard method="PUT" path="/api/admin/locations" auth="Admin session">
                <p>
                  Body: <code className="font-mono">{"{ \"locations\": LocRow[] }"}</code> — replaces the entire locations collection.
                </p>
              </EndpointCard>
            </div>
          </Section>

          <Section id="errors" title="Common errors and environment">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-semibold">HTTP</th>
                  <th className="py-2 pr-4 font-semibold">Typical cause</th>
                </tr>
              </thead>
              <tbody className="text-foreground/90">
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-mono">400</td>
                  <td>Malformed JSON or missing required fields (ingest, login, chat).</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-mono">401</td>
                  <td>Admin cookie missing/invalid, wrong admin password, or wrong ingest key.</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-mono">422</td>
                  <td>Ingest: one or more operations failed (see <code className="font-mono">results[].error</code>).</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-mono">500 / 502</td>
                  <td>Missing server env (OpenAI key, ImgBB, admin password), or upstream API/upload errors.</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-2 pr-4 font-mono">503</td>
                  <td>Mongo not configured, or ingest key not configured on server.</td>
                </tr>
              </tbody>
            </table>
            <h3 className="mt-8 font-display text-lg font-semibold">Environment variables (server)</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-foreground/90">
              <li>
                <code className="font-mono">MONGODB_URI</code>, optional <code className="font-mono">MONGODB_DB</code>
              </li>
              <li>
                <code className="font-mono">ADMIN_PASSWORD</code>, optional <code className="font-mono">ADMIN_SESSION_SECRET</code>
              </li>
              <li>
                <code className="font-mono">INGEST_API_KEY</code> — required for <code className="font-mono">POST /api/ingest</code>
              </li>
              <li>
                Optional <code className="font-mono">INGEST_BASE_URL</code> — for local ingest scripts only (see{" "}
                <code className="font-mono">scripts/ingest-listing-automation.cjs</code>); not required on Vercel.
              </li>
              <li>
                <code className="font-mono">IMGBB_API_KEY</code> — admin image upload
              </li>
              <li>
                Optional <code className="font-mono">BRAIN_OPENAI_API_KEY</code> (or reuse <code className="font-mono">CURATOR_OPENAI_API_KEY</code>) — Night Guide chat at{" "}
                <code className="font-mono">/api/brain/chat</code>; omit if unused.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              <code className="font-mono">npm run vercel:env:push</code> syncs Mongo, ImgBB, admin, session, ingest, optional{" "}
              <code className="font-mono">NEXT_PUBLIC_IMG_BB_*</code>, and optional curator keys (see{" "}
              <code className="font-mono">scripts/sync-vercel-env.cjs</code>). Run <code className="font-mono">npm run env:generate</code> locally to mint ingest/admin secrets into{" "}
              <code className="font-mono">.env.local</code>. See <code className="font-mono">.env.example</code> for the full list.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}
