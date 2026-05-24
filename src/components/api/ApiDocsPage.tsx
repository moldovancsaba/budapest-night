"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Anchor,
  Badge,
  Box,
  Code,
  Container,
  Group,
  List,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";

function methodBadgeColor(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"): string {
  if (method === "GET") return "teal";
  if (method === "POST") return "blue";
  if (method === "PUT") return "yellow";
  if (method === "PATCH") return "grape";
  return "red";
}

function InlineCode({ children }: { children: ReactNode }) {
  return <Code>{children}</Code>;
}

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <Stack gap="xs" my="md" component="figure">
      {title ? (
        <Text component="figcaption" size="xs" fw={500} c="dimmed">
          {title}
        </Text>
      ) : null}
      <Paper
        withBorder
        radius="md"
        p="md"
        style={{ maxHeight: "min(70vh, 520px)", overflow: "auto" }}
      >
        <Code block fz={13} style={{ whiteSpace: "pre" }}>
          {children}
        </Code>
      </Paper>
    </Stack>
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
    <Box
      component="section"
      id={id}
      py="xl"
      style={{
        scrollMarginTop: 96,
        borderBottom: "1px solid var(--mantine-color-default-border)",
      }}
    >
      <Title order={2} size="h2">
        {title}
      </Title>
      <Stack gap="md" mt="lg" fz={15} lh={1.65}>
        {children}
      </Stack>
    </Box>
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
  return (
    <Paper component="article" withBorder radius="md" p="md">
      <Group gap="sm" wrap="wrap" align="center">
        <Badge color={methodBadgeColor(method)} variant="light" radius="sm" tt="uppercase">
          {method}
        </Badge>
        <Code fz="sm">{path}</Code>
      </Group>
      <Text size="xs" c="dimmed" mt="xs">
        <Text component="span" fw={600} inherit>
          Auth:
        </Text>{" "}
        {auth}
      </Text>
      <Stack gap="sm" mt="md" fz="sm" lh={1.65}>
        {children}
      </Stack>
    </Paper>
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
  name: string;             // English canonical
  description?: string;
  locales?: { hu, es, it, he, ar: { name: string; description?: string } };  // required on ingest
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
  /** Host venues (prov-*) — curators send ids only; ingest writes venueLinks. */
  venueIds?: string[];
  /** Organized timed events (event-*) — curators send ids only; ingest writes eventLinks. */
  eventIds?: string[];
  venueLinks?: VenueLink[];
  eventLinks?: MeetupEventLink[];
}

interface MeetupEventLink {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  borough: Borough;
  neighborhood: string;
  status: EventStatus;
}

/** GET /api/public/meetup-groups */
interface PublicMeetupGroup extends MeetupGroup {
  venues: VenueLink[];
  events: MeetupEventLink[];
  venuesResolved: boolean;
  eventsResolved: boolean;
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

const INGEST_BATCH = `{
  "operations": [
    { "resource": "providers", "action": "list" },
    { "resource": "provider", "action": "get", "id": "my-studio" },
    { "resource": "site", "action": "get" },
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
  { href: "#ingest", label: "Ingest" },
  { href: "#admin", label: "Admin" },
  { href: "#errors", label: "Errors" },
];

export function ApiDocsPage({ origin }: { origin: string }) {
  const base = origin || "https://budapest-night.vercel.app";

  return (
    <Box style={{ minHeight: "100vh" }}>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderBottom: "1px solid var(--mantine-color-default-border)",
          backdropFilter: "blur(8px)",
          backgroundColor: "color-mix(in srgb, var(--mantine-color-body) 95%, transparent)",
        }}
      >
        <Container size="lg" px="md" py="md">
          <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
            <Stack gap={4} maw={576}>
              <Text size="xs" fw={600} tt="uppercase" lts="0.12em" c="brand">
                Pesti Est · API v{API_VERSION}
              </Text>
              <Title order={1} size="h2">
                HTTP API reference
              </Title>
              <Text size="sm" c="dimmed">
                Catalog, machine ingest, and admin endpoints (app package{" "}
                <Code>v{API_VERSION}</Code>). Paths are relative to your deployment (for example{" "}
                <Code>{base}</Code>).
              </Text>
            </Stack>
            <Group gap="xs">
              <AppButton component={Link} href="/" variant="outline">
                Home
              </AppButton>
              <AppButton component={Link} href="/admin" variant="outline">
                Admin
              </AppButton>
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="lg" px="md" pb="xl" pt="lg">
        <Group align="flex-start" gap="xl" wrap="wrap">
          <Box
            component="nav"
            aria-label="On this page"
            w={{ base: "100%", lg: 208 }}
            pos={{ lg: "sticky" }}
            top={{ lg: 96 }}
            style={{ flexShrink: 0, alignSelf: "flex-start" }}
          >
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              On this page
            </Text>
            <Stack component="ul" gap={4} mt="sm" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {nav.map((item) => (
                <Box component="li" key={item.href}>
                  <Anchor href={item.href} size="sm" underline="never">
                    {item.label}
                  </Anchor>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box component="main" style={{ minWidth: 0, flex: 1 }}>
          <Section id="overview" title="Overview">
            <Text>
              Pesti Est exposes JSON APIs for the public catalog, a{" "}
              <strong>machine ingest</strong> pipeline secured by <InlineCode>INGEST_API_KEY</InlineCode>, and{" "}
              <strong>browser session</strong> APIs for the admin console. Unless noted, request and response bodies use{" "}
              <InlineCode>application/json</InlineCode> with UTF-8.
            </Text>
            <List spacing="xs" size="sm">
              <List.Item>
                <strong>Public routes</strong> are read-only and safe to call from browsers or edge caches (no secrets
                required).
              </List.Item>
              <List.Item>
                <strong>Admin routes</strong> require an HTTP-only cookie set by <InlineCode>POST /api/admin/login</InlineCode>; use a
                browser or forward <InlineCode>Cookie</InlineCode> from the same origin.
              </List.Item>
              <List.Item>
                <strong>Ingest</strong> is intended for servers, ETL jobs, or trusted partners — never expose{" "}
                <InlineCode>INGEST_API_KEY</InlineCode> in client-side code.
              </List.Item>
              <List.Item>
                <strong>Prices</strong> are stored in HUF on providers and menu items; the web app reads{" "}
                <InlineCode>currencyRates</InlineCode> from <InlineCode>GET /api/public/site</InlineCode> for EUR/USD display.
              </List.Item>
            </List>
          </Section>

          <Section id="urls" title="Venue &amp; event URLs (web app)">
            <Text>
              These paths are implemented by the Next.js app (not separate JSON resources). They open the venue sheet or a
              shareable full page and accept either a <strong>canonical slug</strong> or a legacy key.
            </Text>
            <List spacing="xs" size="sm">
              <List.Item>
                <InlineCode>/venue/{"{slug}"}</InlineCode> — venue profile (query <InlineCode>?from=venues|events|…</InlineCode> controls back navigation).
              </List.Item>
              <List.Item>
                <InlineCode>/venue/{"{slug}"}/full</InlineCode> — full-page venue layout with share chrome.
              </List.Item>
              <List.Item>
                <InlineCode>/event/{"{slug}"}</InlineCode> and <InlineCode>/event/{"{slug}"}/full</InlineCode> — timed event profiles.
              </List.Item>
              <List.Item>
                Locale prefix optional: <InlineCode>/hu/venue/budapest-park</InlineCode> uses Hungarian copy; slug resolution checks all locales.
              </List.Item>
            </List>
            <Text>
              <strong>Canonical slugs</strong> must not embed the wrong Budapest district (e.g. use{" "}
              <InlineCode>budapest-park</InlineCode> for the Ferencváros open-air park, not{" "}
              <InlineCode>prov-budapest-park-ferencvaros</InlineCode>). Set{" "}
              <InlineCode>locales.en.slug</InlineCode> on ingest; logic lives in{" "}
              <InlineCode>src/lib/venueSlug.ts</InlineCode>. Legacy <InlineCode>prov-*</InlineCode> URL segments still resolve but the app redirects to the canonical slug.
            </Text>
            <Text>
              Timed events link to hosts via <InlineCode>venueIds</InlineCode> (internal ids). The venue UI lists upcoming events whose{" "}
              <InlineCode>venueIds</InlineCode> include that provider.
            </Text>
          </Section>

          <Section id="public" title="Public catalog (read)">
            <Text>These endpoints read from MongoDB when <InlineCode>MONGODB_URI</InlineCode> is configured; otherwise they fall back to built-in defaults where noted.</Text>

            <Stack gap="lg">
              <EndpointCard method="GET" path="/api/public/providers" auth="None">
                <Text>
                  Returns <InlineCode>Provider[]</InlineCode>. Mongo <InlineCode>_id</InlineCode> is stripped from each object.
                </Text>
                <Text>
                  <strong>Query:</strong> <InlineCode>locale</InlineCode> — optional{" "}
                  <InlineCode>en</InlineCode> | <InlineCode>hu</InlineCode> | <InlineCode>es</InlineCode> |{" "}
                  <InlineCode>it</InlineCode> | <InlineCode>he</InlineCode> | <InlineCode>ar</InlineCode> (overlays{" "}
                  <InlineCode>locales[locale]</InlineCode> on name, descriptions, and slug). Public venue links should use{" "}
                  <InlineCode>locales.en.slug</InlineCode> when set, otherwise the canonical slug algorithm in{" "}
                  <InlineCode>getCanonicalVenueSlug()</InlineCode> — not raw internal ids in marketing URLs.
                </Text>
                <Text c="dimmed">
                  <strong>503</strong> if the database is not configured.
                </Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/events" auth="None">
                <Text>
                  Returns <InlineCode>PublicNightEvent[]</InlineCode> — timed concerts and ticketed shows (not venue listings).
                  Each event includes <InlineCode>venues</InlineCode> (resolved host snapshots) and{" "}
                  <InlineCode>venuesResolved</InlineCode>.
                </Text>
                <Text>
                  <strong>Query:</strong>{" "}
                  <InlineCode>locale</InlineCode> (same as providers);{" "}
                  <InlineCode>upcoming=0</InlineCode> to include past/cancelled;{" "}
                  <InlineCode>borough</InlineCode> to filter by district. Default: upcoming scheduled events only, sorted by{" "}
                  <InlineCode>startsAt</InlineCode>.
                </Text>
                <Text c="dimmed">
                  Stored <InlineCode>venueIds</InlineCode> must reference existing <InlineCode>prov-*</InlineCode> ids. On ingest,{" "}
                  <InlineCode>venueLinks</InlineCode> and district fields sync from the primary host.
                </Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/menu-items" auth="None">
                <Text>
                  Flat menu board for Eat &amp; Drink: dishes and drinks with prices, each row linked to a host venue via{" "}
                  <InlineCode>venue</InlineCode> (<InlineCode>VenueLink</InlineCode>).
                </Text>
                <Text>
                  <strong>Query:</strong>{" "}
                  <InlineCode>locale</InlineCode> (optional, e.g. <InlineCode>it</InlineCode> — resolves item{" "}
                  <InlineCode>name</InlineCode> and section titles from <InlineCode>locales</InlineCode>),{" "}
                  <InlineCode>tag</InlineCode> (canonical menu tag),{" "}
                  <InlineCode>q</InlineCode> (search name, venue, section, address, category),{" "}
                  <InlineCode>kind</InlineCode> (<InlineCode>food</InlineCode> | <InlineCode>drink</InlineCode> |{" "}
                  <InlineCode>other</InlineCode>),{" "}
                  <InlineCode>borough</InlineCode>,{" "}
                  <InlineCode>categories</InlineCode> (comma-separated),{" "}
                  <InlineCode>limit</InlineCode> (max 500, default 120).
                </Text>
                <Text>
                  <strong>400</strong> if <InlineCode>tag</InlineCode> is not a canonical tag. Empty catalog returns{" "}
                  <InlineCode>{"{ items: [], providersWithMenu: 0, tourReadiness: {...} }"}</InlineCode> when DB is missing.
                </Text>
                <CodeBlock title="Example response">{MENU_ITEMS_RESPONSE}</CodeBlock>
                <Text size="sm" c="dimmed">
                  Canonical tags: <InlineCode>palinka</InlineCode>, <InlineCode>coffee</InlineCode>,{" "}
                  <InlineCode>specialty-coffee</InlineCode>, <InlineCode>goulash</InlineCode>,{" "}
                  <InlineCode>hungarian</InlineCode>, <InlineCode>street-food</InlineCode>, and others in{" "}
                  <InlineCode>src/data/menuTags.ts</InlineCode>.
                </Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/tours/{tourId}" auth="None">
                <Text>
                  Generates a themed three-stop tour from venues with <strong>published menu items</strong> matching the template tags.
                  Templates: <InlineCode>palinka</InlineCode>, <InlineCode>foodie</InlineCode>,{" "}
                  <InlineCode>coffee</InlineCode>.
                </Text>
                <Text>
                  <strong>Query:</strong> <InlineCode>seed</InlineCode> — optional shuffle seed (defaults to tour id + timestamp).
                </Text>
                <Text>
                  <strong>404</strong> unknown <InlineCode>tourId</InlineCode>.{" "}
                  <strong>422</strong> <InlineCode>{"{ \"error\": \"not_enough_venues\" }"}</InlineCode> when fewer than three eligible venues.
                  Check readiness via <InlineCode>tourReadiness</InlineCode> on menu-items.
                </Text>
                <CodeBlock title="Example response">{TOUR_RESPONSE}</CodeBlock>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/meetup-groups" auth="None">
                <Text>
                  Returns <InlineCode>PublicMeetupGroup[]</InlineCode>: each row includes{" "}
                  <InlineCode>venues</InlineCode> and <InlineCode>events</InlineCode> resolved from live
                  catalogs plus stored <InlineCode>venueLinks</InlineCode> /{" "}
                  <InlineCode>eventLinks</InlineCode> snapshots. <InlineCode>_id</InlineCode> stripped.
                </Text>
                <Text c="dimmed">
                  <strong>503</strong> if the database is not configured.
                </Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/locations" auth="None">
                <Text>
                  Returns a borough → neighborhoods map: <InlineCode>Record&lt;Borough, string[]&gt;</InlineCode>. If the
                  locations collection is empty or DB is unavailable, the app falls back to static neighborhood lists from the
                  codebase.
                </Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/public/site" auth="None">
                <Text>
                  Returns the marketing shell document for <InlineCode>_id: &quot;main&quot;</InlineCode>, or merged defaults
                  when missing. Includes <InlineCode>currencyRates</InlineCode> ({`{ hufPerEur, hufPerUsd }`}) used by the header
                  currency switcher (HUF is canonical in Mongo provider/event documents).
                </Text>
                <CodeBlock title="Shape (SiteDoc)">{SITE_DOC}</CodeBlock>
              </EndpointCard>

            </Stack>

            <Title order={3} size="h4" mt="xl">
              Entity references
            </Title>
            <CodeBlock title="VenueLink (events, menus, API rows)">{VENUE_LINK}</CodeBlock>
            <CodeBlock title="Provider">{PROVIDER_FIELDS}</CodeBlock>
            <CodeBlock title="VenueMenu &amp; MenuItem">{VENUE_MENU}</CodeBlock>
            <CodeBlock title="NightEvent &amp; PublicNightEvent">{NIGHT_EVENT}</CodeBlock>
            <CodeBlock title="MeetupGroup (Borough same as Provider)">{MEETUP_FIELDS}</CodeBlock>
          </Section>

          <Section id="ingest" title="Machine ingest (full CMS via API)">
              <Text>
                Use <InlineCode>INGEST_API_KEY</InlineCode> for headless content management: read catalog and
                settings, bulk replace collections, patch singletons, upload images to ImgBB, and mirror everything the admin
                UI can change in MongoDB. <strong>Stored raster URLs</strong> in provider, meet-up, and site documents must be{" "}
                <InlineCode>https://</InlineCode> on <strong>imgbb.com</strong> (e.g. <InlineCode>i.ibb.co</InlineCode>) or empty; other hosts are rejected.
              </Text>
              <Text>
                <strong>Provider locales:</strong> root fields are English. Every <InlineCode>provider</InlineCode>{" "}
                upsert should include <InlineCode>locales</InlineCode> for{" "}
                <InlineCode>hu</InlineCode>, <InlineCode>es</InlineCode>, <InlineCode>it</InlineCode>,{" "}
                <InlineCode>he</InlineCode>, and <InlineCode>ar</InlineCode> (each with{" "}
                <InlineCode>name</InlineCode>, <InlineCode>shortDescription</InlineCode>,{" "}
                <InlineCode>longDescription</InlineCode>, <InlineCode>slug</InlineCode>). Also set{" "}
                <InlineCode>locales.en.slug</InlineCode> to the district-neutral canonical URL segment. Public reads accept{" "}
                <InlineCode>?locale=</InlineCode> on providers and events. See{" "}
                <InlineCode>src/lib/curator/localeIngestRules.ts</InlineCode> and{" "}
                <InlineCode>src/lib/curator/eventLocaleIngestRules.ts</InlineCode>.
              </Text>
              <Text>
                <strong>Menus (Eat &amp; Drink):</strong> attach <InlineCode>menu</InlineCode> to an existing{" "}
                <InlineCode>prov-*</InlineCode> via <InlineCode>provider</InlineCode> + <InlineCode>patch</InlineCode> or{" "}
                <InlineCode>upsert</InlineCode>. Do not send <InlineCode>menuTags</InlineCode> or{" "}
                <InlineCode>menu.venueLink</InlineCode>. Specialist prompt:{" "}
                <InlineCode>scripts/cursor-curator-menu-prompt.txt</InlineCode> · rules:{" "}
                <InlineCode>src/lib/curator/menuIngestRules.ts</InlineCode>.
              </Text>
              <Text>
                <strong>Timed events:</strong> use <InlineCode>resource: &quot;event&quot;</InlineCode> (not provider category{" "}
                <InlineCode>Events</InlineCode>). Upsert host venues first in the same <InlineCode>operations</InlineCode> array.
                Ticket tiers go in <InlineCode>entryFees</InlineCode> (HUF/EUR), not <InlineCode>pricePerClass</InlineCode> on the venue.
                Prompt: <InlineCode>scripts/cursor-curator-events-prompt.txt</InlineCode>.
              </Text>

            <Stack gap="lg">
              <EndpointCard method="GET" path="/api/cron/curator" auth="Bearer CRON_SECRET (Vercel Cron)">
                <Text>
                  <strong>Optional automation:</strong> when <InlineCode>CURATOR_ENABLED=true</InlineCode>, runs Serper search → fetches an official page → OpenAI JSON → Zod validate → dedupe → Mongo{" "}
                  <InlineCode>provider</InlineCode> upsert (same as ingest). Requires <InlineCode>SERPER_API_KEY</InlineCode> and{" "}
                  <InlineCode>CURATOR_OPENAI_API_KEY</InlineCode>. Response JSON includes <InlineCode>steps</InlineCode>. Schedule in <InlineCode>vercel.json</InlineCode>.
                </Text>
                <Text c="dimmed">
                  <strong>401</strong> if the bearer token does not match <InlineCode>CRON_SECRET</InlineCode>. Returns <strong>200</strong> with a descriptive body for skip/config errors so crons do not retry endlessly.
                </Text>
              </EndpointCard>

              <EndpointCard
                method="GET"
                path="/api/ingest"
                auth="Bearer INGEST_API_KEY or header X-Ingest-Key: &lt;key&gt;"
              >
                <Text>
                  Returns a compact JSON summary of ingest capabilities and limits (same authentication as{" "}
                  <InlineCode>POST /api/ingest</InlineCode>).
                </Text>
              </EndpointCard>

              <EndpointCard
                method="POST"
                path="/api/ingest/upload"
                auth="Bearer INGEST_API_KEY or header X-Ingest-Key: &lt;key&gt;"
              >
                <Text>
                  Same behavior as <InlineCode>POST /api/admin/upload</InlineCode>, but for API clients:{" "}
                  <InlineCode>multipart/form-data</InlineCode> with field <InlineCode>file</InlineCode>. Requires{" "}
                  <InlineCode>IMGBB_API_KEY</InlineCode> on the server.
                </Text>
                <Text c="dimmed">
                  Success: <InlineCode>{"{ \"url\": string, \"displayUrl\": string }"}</InlineCode>.
                </Text>
              </EndpointCard>

              <EndpointCard
                method="POST"
                path="/api/ingest"
                auth="Bearer INGEST_API_KEY or header X-Ingest-Key: &lt;key&gt;"
              >
              <Text>
                Batch <strong>read + write</strong> operations for providers, timed events, meetup groups, site, and locations.
                Up to <strong>100 operations</strong> per request. Each result may include <InlineCode>data</InlineCode> for successful reads or write metadata (e.g.{" "}
                <InlineCode>{"{ \"replaced\": 12 }"}</InlineCode>, <InlineCode>{"{ \"deletedCount\": 3 }"}</InlineCode>).
              </Text>
              <Text>
                <strong>503</strong> if <InlineCode>INGEST_API_KEY</InlineCode> is not set. <strong>401</strong> if the key is missing or wrong.{" "}
                <strong>503</strong> if MongoDB is unavailable.
              </Text>
              <Text>
                <strong>Request:</strong> either a single operation object or <InlineCode>{"{ \"operations\": [ ... ] }"}</InlineCode>.
              </Text>
              <CodeBlock title="Batch example (reads + writes)">{INGEST_BATCH}</CodeBlock>
              <CodeBlock title="Single operation (shorthand)">{INGEST_SINGLE}</CodeBlock>
              <Text>
                <strong>Read actions</strong> (successful results include <InlineCode>data</InlineCode>)
              </Text>
              <List spacing="xs" size="sm">
                <List.Item>
                  <InlineCode>providers</InlineCode> + <InlineCode>list</InlineCode> → <InlineCode>Provider[]</InlineCode> (<InlineCode>_id</InlineCode> stripped).
                </List.Item>
                <List.Item>
                  <InlineCode>provider</InlineCode> + <InlineCode>get</InlineCode> + <InlineCode>id</InlineCode> → one provider or error <InlineCode>provider not found</InlineCode>.
                </List.Item>
                <List.Item>
                  <InlineCode>meetupGroups</InlineCode> + <InlineCode>list</InlineCode> / <InlineCode>meetupGroup</InlineCode> + <InlineCode>get</InlineCode> — same pattern.
                </List.Item>
                <List.Item>
                  <InlineCode>site</InlineCode> + <InlineCode>get</InlineCode> → <InlineCode>SiteDoc</InlineCode> (defaults merged if missing).
                </List.Item>
                <List.Item>
                  <InlineCode>locations</InlineCode> + <InlineCode>list</InlineCode> → raw Mongo rows{" "}
                  <InlineCode>{"{ borough, neighborhoods }[]"}</InlineCode>.
                </List.Item>
                <List.Item>
                  <InlineCode>events</InlineCode> + <InlineCode>list</InlineCode> → <InlineCode>NightEvent[]</InlineCode>.
                </List.Item>
                <List.Item>
                  <InlineCode>event</InlineCode> + <InlineCode>get</InlineCode> + <InlineCode>id</InlineCode> → one event or error.
                </List.Item>
              </List>
              <Text>
                <strong>Write actions</strong>
              </Text>
              <List spacing="xs" size="sm">
                <List.Item>
                  <InlineCode>provider</InlineCode>: <InlineCode>upsert</InlineCode>, <InlineCode>patch</InlineCode>, <InlineCode>delete</InlineCode> (by <InlineCode>id</InlineCode>).
                  Menu patches recompute <InlineCode>menuTags</InlineCode> and <InlineCode>menu.venueLink</InlineCode>; linked events refresh host snapshots when the venue changes.
                </List.Item>
                <List.Item>
                  <InlineCode>event</InlineCode>: <InlineCode>upsert</InlineCode>, <InlineCode>patch</InlineCode>, <InlineCode>delete</InlineCode>.
                  Every <InlineCode>venueIds[]</InlineCode> entry must exist before the event is saved. Ingest writes <InlineCode>venueLinks</InlineCode> and syncs district from <InlineCode>venueIds[0]</InlineCode>.
                  Do not send <InlineCode>venueLinks</InlineCode> in payloads.
                </List.Item>
                <List.Item>
                  <InlineCode>providers</InlineCode>: <InlineCode>upsertMany</InlineCode> (bulk by <InlineCode>id</InlineCode>),{" "}
                  <InlineCode>replaceAll</InlineCode> (clears collection then inserts array; max <strong>2000</strong> docs),{" "}
                  <InlineCode>deleteMany</InlineCode> with <InlineCode>ids: string[]</InlineCode> (max <strong>500</strong> ids).
                </List.Item>
                <List.Item>
                  <InlineCode>meetupGroup</InlineCode> / <InlineCode>meetupGroups</InlineCode>: same as providers (including{" "}
                  <InlineCode>replaceAll</InlineCode> / <InlineCode>deleteMany</InlineCode>).
                </List.Item>
                <List.Item>
                  <InlineCode>site</InlineCode>: <InlineCode>patch</InlineCode> (partial merge) or <InlineCode>put</InlineCode> with full <InlineCode>document</InlineCode> (replaces <InlineCode>_id: &quot;main&quot;</InlineCode>).
                </List.Item>
                <List.Item>
                  <InlineCode>locations</InlineCode>: <InlineCode>replace</InlineCode> — deletes all rows, then inserts the provided array.
                </List.Item>
              </List>
              <Text>
                <strong>Response (JSON):</strong> per-operation results with optional <InlineCode>data</InlineCode>. HTTP <strong>200</strong> when every operation succeeded;{" "}
                <strong>422</strong> when any operation failed.
              </Text>
              <CodeBlock title="Example response">{INGEST_RESPONSE}</CodeBlock>
              <Text size="sm" c="dimmed">
                <strong>curl</strong> example (replace the host and key):
              </Text>
              <CodeBlock>{`curl -sS -X POST "${base}/api/ingest" \\
  -H "Authorization: Bearer $INGEST_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"resource":"provider","action":"patch","id":"my-id","patch":{"rating":5}}'`}</CodeBlock>
            </EndpointCard>
            </Stack>
          </Section>

          <Section id="admin" title="Admin console APIs">
            <Text>
              Used by <Anchor component={Link} href="/admin" c="brand">/admin</Anchor>. Authenticate with{" "}
              <InlineCode>POST /api/admin/login</InlineCode>, then call other routes from the same origin with the session cookie.
            </Text>

            <Stack gap="lg">
              <EndpointCard method="POST" path="/api/admin/login" auth="None (sets cookie on success)">
                <Text>
                  Body: <InlineCode>{"{ \"password\": string }"}</InlineCode> matching <InlineCode>ADMIN_PASSWORD</InlineCode>.
                </Text>
                <Text c="dimmed">
                  <strong>200</strong> <InlineCode>{"{ \"ok\": true }"}</InlineCode> and sets HTTP-only cookie. <strong>401</strong> invalid password.{" "}
                  <strong>500</strong> if admin password env is missing.
                </Text>
              </EndpointCard>

              <EndpointCard method="POST" path="/api/admin/logout" auth="None">
                <Text>Clears the admin session cookie. Returns <InlineCode>{"{ \"ok\": true }"}</InlineCode>.</Text>
              </EndpointCard>

              <EndpointCard method="POST" path="/api/admin/upload" auth="Admin session cookie">
                <Text>
                  <InlineCode>multipart/form-data</InlineCode> with field name <InlineCode>file</InlineCode> (image blob). Uploads to ImgBB using{" "}
                  <InlineCode>IMGBB_API_KEY</InlineCode>.
                </Text>
                <Text c="dimmed">
                  Success: <InlineCode>{"{ \"url\": string, \"displayUrl\": string }"}</InlineCode>. Errors <strong>400</strong> missing file,{" "}
                  <strong>401</strong> not logged in, <strong>500</strong> missing ImgBB key, <strong>502</strong> ImgBB failure.
                </Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/providers" auth="Admin session">
                <Text>Returns raw Mongo documents (includes <InlineCode>_id</InlineCode>).</Text>
              </EndpointCard>
              <EndpointCard method="POST" path="/api/admin/providers" auth="Admin session">
                <Text>
                  Full replace/upsert by <InlineCode>id</InlineCode>. Body: full <InlineCode>Provider</InlineCode> (+ optional <InlineCode>_id</InlineCode> ignored).
                </Text>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/providers" auth="Admin session">
                <Text>
                  Body: <InlineCode>{"{ \"id\": string, ...partial fields }"}</InlineCode> — <InlineCode>$set</InlineCode> style merge.
                </Text>
              </EndpointCard>
              <EndpointCard method="DELETE" path="/api/admin/providers?id=&lt;id&gt;" auth="Admin session">
                <Text>Deletes one provider by <InlineCode>id</InlineCode> query param.</Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/meetup-groups" auth="Admin session">
                <Text>Raw meetup group documents.</Text>
              </EndpointCard>
              <EndpointCard method="POST" path="/api/admin/meetup-groups" auth="Admin session">
                <Text>Upsert full <InlineCode>MeetupGroup</InlineCode> by <InlineCode>id</InlineCode>.</Text>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/meetup-groups" auth="Admin session">
                <Text>Partial update by <InlineCode>id</InlineCode>.</Text>
              </EndpointCard>
              <EndpointCard method="DELETE" path="/api/admin/meetup-groups?id=&lt;id&gt;" auth="Admin session">
                <Text>Deletes one meetup group by <InlineCode>id</InlineCode> query param.</Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/site" auth="Admin session">
                <Text>Returns <InlineCode>SiteDoc</InlineCode> (or defaults).</Text>
              </EndpointCard>
              <EndpointCard method="PATCH" path="/api/admin/site" auth="Admin session">
                <Text>JSON partial patch merged into <InlineCode>_id: &quot;main&quot;</InlineCode>.</Text>
              </EndpointCard>

              <EndpointCard method="GET" path="/api/admin/locations" auth="Admin session">
                <Text>Array of <InlineCode>{"{ borough, neighborhoods }"}</InlineCode> rows.</Text>
              </EndpointCard>
              <EndpointCard method="PUT" path="/api/admin/locations" auth="Admin session">
                <Text>
                  Body: <InlineCode>{"{ \"locations\": LocRow[] }"}</InlineCode> — replaces the entire locations collection.
                </Text>
              </EndpointCard>
            </Stack>
          </Section>

          <Section id="errors" title="Common errors and environment">
            <Table fz="sm" striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>HTTP</Table.Th>
                  <Table.Th>Typical cause</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>
                    <Code>400</Code>
                  </Table.Td>
                  <Table.Td>Malformed JSON or missing required fields (ingest, login).</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Code>401</Code>
                  </Table.Td>
                  <Table.Td>Admin cookie missing/invalid, wrong admin password, or wrong ingest key.</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Code>422</Code>
                  </Table.Td>
                  <Table.Td>
                    Ingest: one or more operations failed (see <InlineCode>results[].error</InlineCode>).
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Code>500 / 502</Code>
                  </Table.Td>
                  <Table.Td>Missing server env (ImgBB, admin password), or upstream API/upload errors.</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>
                    <Code>503</Code>
                  </Table.Td>
                  <Table.Td>Mongo not configured, or ingest key not configured on server.</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <Title order={3} size="h4" mt="lg">
              Environment variables (server)
            </Title>
            <List spacing="xs" size="sm">
              <List.Item>
                <InlineCode>MONGODB_URI</InlineCode>, optional <InlineCode>MONGODB_DB</InlineCode>
              </List.Item>
              <List.Item>
                <InlineCode>ADMIN_PASSWORD</InlineCode>, optional <InlineCode>ADMIN_SESSION_SECRET</InlineCode>
              </List.Item>
              <List.Item>
                <InlineCode>INGEST_API_KEY</InlineCode> — required for <InlineCode>POST /api/ingest</InlineCode>
              </List.Item>
              <List.Item>
                Optional <InlineCode>INGEST_BASE_URL</InlineCode> — for local ingest scripts only (see{" "}
                <InlineCode>scripts/ingest-listing-automation.cjs</InlineCode>); not required on Vercel.
              </List.Item>
              <List.Item>
                <InlineCode>IMGBB_API_KEY</InlineCode> — admin image upload
              </List.Item>
            </List>
            <Text size="sm" c="dimmed">
              <InlineCode>npm run vercel:env:push</InlineCode> syncs Mongo, ImgBB, admin, session, ingest, optional{" "}
              <InlineCode>NEXT_PUBLIC_IMG_BB_*</InlineCode>, and optional curator keys (see{" "}
              <InlineCode>scripts/sync-vercel-env.cjs</InlineCode>). Run <InlineCode>npm run env:generate</InlineCode> locally to mint ingest/admin secrets into{" "}
              <InlineCode>.env.local</InlineCode>. See <InlineCode>.env.example</InlineCode> for the full list.
            </Text>
          </Section>
          </Box>
        </Group>
      </Container>
    </Box>
  );
}
