import type { AppLocale } from "@/i18n/config";
import type { ViewKey } from "@/components/scout/Sidebar";
import { getVenuePathKey } from "@/lib/providerLocale";
import { getEventPathKey } from "@/lib/eventLocale";
import type { Borough, BoroughChoice, Category, Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";

/** URL path segment (no leading slash, no locale). */
export type AppSection =
  | "home"
  | "program"
  | "venues"
  | "events"
  | "parties"
  | "restaurants"
  | "cafes"
  | "culture"
  | "eat-drink"
  | "saved"
  | "budget"
  | "split"
  | "account";

export type ProgramVerticalSlug = "mozi" | "szinhaz" | "kiallitas" | "koncert" | "csalad";

export const DISCOVER_SECTIONS: AppSection[] = ["venues", "parties", "restaurants", "cafes"];

const VIEW_TO_SECTION: Record<ViewKey, AppSection> = {
  Home: "home",
  Program: "program",
  Venues: "venues",
  Events: "events",
  Parties: "parties",
  Restaurants: "restaurants",
  Cafés: "cafes",
  "Meet-Up Groups": "culture",
  "Eat & Drink": "eat-drink",
  Saved: "saved",
  Calculator: "budget",
  "Split Check": "split",
  "My Account": "account",
};

const SECTION_TO_VIEW: Record<AppSection, ViewKey> = {
  home: "Home",
  program: "Program",
  venues: "Venues",
  events: "Events",
  parties: "Parties",
  restaurants: "Restaurants",
  cafes: "Cafés",
  culture: "Meet-Up Groups",
  "eat-drink": "Eat & Drink",
  saved: "Saved",
  budget: "Calculator",
  split: "Split Check",
  account: "My Account",
};

const CATEGORY_TO_SECTION: Record<Category, AppSection> = {
  Venues: "venues",
  Parties: "parties",
  Restaurants: "restaurants",
  Cafés: "cafes",
};

const BOROUGH_SLUG: Record<Borough, string> = {
  Belváros: "belvaros",
  Terézváros: "terezvaros",
  Erzsébetváros: "erzsebetvaros",
  Ferencváros: "ferencvaros",
  Buda: "buda",
  Óbuda: "obuda",
  Újbuda: "ujbuda",
};

const SLUG_TO_BOROUGH = Object.fromEntries(
  Object.entries(BOROUGH_SLUG).map(([b, s]) => [s, b]),
) as Record<string, Borough>;

const KNOWN_SECTIONS = new Set<string>([
  "program",
  "venues",
  "events",
  "parties",
  "restaurants",
  "cafes",
  "culture",
  "eat-drink",
  "saved",
  "budget",
  "split",
  "account",
]);

export interface LocationFilter {
  borough?: BoroughChoice;
  neighborhood?: string;
}

export interface AppRoute {
  view: ViewKey;
  section: AppSection;
  location: LocationFilter | null;
  programVertical: ProgramVerticalSlug | null;
  venueId: string | null;
  groupId: string | null;
  tourId: string | null;
  eventId: string | null;
  /** Dedicated full-page layout (e.g. `/event/{key}/full` or `/event/{key}-full`). */
  fullPage: boolean;
  /** Section to return to when closing a venue/event sheet (from `?from=`). */
  fromSection: AppSection;
  invalid: boolean;
}

/** Parse `/entity/{key}` with optional `/full` suffix or `-full` on the key. */
export function parseEntityRouteKey(
  keySegment: string,
  trailingSegment?: string,
): { entityKey: string; fullPage: boolean } {
  let fullPage = trailingSegment === "full";
  let entityKey = decodeURIComponent(keySegment);
  if (!fullPage && entityKey.endsWith("-full")) {
    fullPage = true;
    entityKey = entityKey.slice(0, -5);
  }
  return { entityKey, fullPage };
}

export function viewToSection(view: ViewKey): AppSection {
  return VIEW_TO_SECTION[view];
}

export function sectionToView(section: AppSection): ViewKey {
  return SECTION_TO_VIEW[section];
}

export function sectionFromCategory(category: Category): AppSection {
  return CATEGORY_TO_SECTION[category];
}

export function boroughToSlug(borough: Borough): string {
  return BOROUGH_SLUG[borough];
}

export function slugToBorough(slug: string): Borough | null {
  return SLUG_TO_BOROUGH[slug] ?? null;
}

function parseLocation(search: URLSearchParams): LocationFilter | null {
  const boroughSlug = search.get("borough");
  if (!boroughSlug) return null;
  const borough = slugToBorough(boroughSlug);
  if (!borough) return null;
  const hood = search.get("hood");
  return { borough, neighborhood: hood ? decodeURIComponent(hood) : undefined };
}

function parseFromSection(search: URLSearchParams, fallback: AppSection): AppSection {
  const from = search.get("from");
  if (from && KNOWN_SECTIONS.has(from)) return from as AppSection;
  return fallback;
}

/** Parse pathname from next-intl (no locale prefix). */
export function parseAppRoute(pathname: string, search: URLSearchParams): AppRoute {
  const segments = pathname
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean)
    .map((part) => part.split("?")[0]!);
  const location = parseLocation(search);

  if (segments[0] === "v" && segments[1]) {
    const fromSection = parseFromSection(search, "venues");
    const { entityKey, fullPage } = parseEntityRouteKey(segments[1], segments[2]);
    return {
      view: sectionToView(fromSection),
      section: fromSection,
      location,
      programVertical: null,
      venueId: entityKey,
      groupId: null,
      tourId: null,
      eventId: null,
      fullPage,
      fromSection,
      invalid: false,
    };
  }

  if (segments[0] === "venue" && segments[1]) {
    const fromSection = parseFromSection(search, "venues");
    const { entityKey, fullPage } = parseEntityRouteKey(segments[1], segments[2]);
    return {
      view: sectionToView(fromSection),
      section: fromSection,
      location,
      programVertical: null,
      venueId: entityKey,
      groupId: null,
      tourId: null,
      eventId: null,
      fullPage,
      fromSection,
      invalid: false,
    };
  }

  if (segments[0] === "event" && segments[1]) {
    const fromSection = parseFromSection(search, "events");
    const { entityKey, fullPage } = parseEntityRouteKey(segments[1], segments[2]);
    return {
      view: "Events",
      section: "events",
      location,
      programVertical: null,
      venueId: null,
      groupId: null,
      tourId: null,
      eventId: entityKey,
      fullPage,
      fromSection,
      invalid: false,
    };
  }

  if (segments[0] === "tours" && segments[1]) {
    const location = parseLocation(search);
    return {
      view: "Eat & Drink",
      section: "eat-drink",
      location,
      programVertical: null,
      venueId: null,
      groupId: null,
      tourId: decodeURIComponent(segments[1]),
      eventId: null,
      fullPage: false,
      fromSection: "eat-drink",
      invalid: false,
    };
  }

  if (segments[0] === "group" && segments[1]) {
    const { entityKey, fullPage } = parseEntityRouteKey(segments[1], segments[2]);
    return {
      view: "Meet-Up Groups",
      section: "culture",
      location,
      programVertical: null,
      venueId: null,
      groupId: entityKey,
      tourId: null,
      eventId: null,
      fullPage,
      fromSection: "culture",
      invalid: false,
    };
  }

  if (segments[0] === "program" || segments[0] === "ez-a-het") {
    const vertical = segments[1] as ProgramVerticalSlug | undefined;
    const validVerticals = new Set(["mozi", "szinhaz", "kiallitas", "koncert", "csalad"]);
    return {
      view: "Program",
      section: "program",
      location,
      programVertical: vertical && validVerticals.has(vertical) ? vertical : null,
      venueId: null,
      groupId: null,
      tourId: null,
      eventId: null,
      fullPage: false,
      fromSection: "program",
      invalid: Boolean(vertical && !validVerticals.has(vertical)),
    };
  }

  if (segments.length === 0) {
    return {
      view: "Home",
      section: "home",
      location,
      programVertical: null,
      venueId: null,
      groupId: null,
      tourId: null,
      eventId: null,
      fullPage: false,
      fromSection: "home",
      invalid: false,
    };
  }

  const section = segments[0];
  if (!KNOWN_SECTIONS.has(section)) {
    return {
      view: "Home",
      section: "home",
      location: null,
      programVertical: null,
      venueId: null,
      groupId: null,
      tourId: null,
      eventId: null,
      fullPage: false,
      fromSection: "home",
      invalid: true,
    };
  }

  const appSection = section as AppSection;
  return {
    view: sectionToView(appSection),
    section: appSection,
    location,
    programVertical: null,
    venueId: null,
    groupId: null,
    tourId: null,
    eventId: null,
    fullPage: false,
    fromSection: appSection,
    invalid: false,
  };
}

export function buildProgramPath(
  vertical?: ProgramVerticalSlug,
  options?: { locale?: AppLocale },
): string {
  const loc = options?.locale;
  if (vertical) {
    return loc === "hu" ? `/ez-a-het/${vertical}` : `/program/${vertical}`;
  }
  if (loc === "hu") return "/ez-a-het";
  return "/program";
}

export function buildTourPath(tourId: string, seed?: string): string {
  const base = `/tours/${encodeURIComponent(tourId)}`;
  if (!seed) return base;
  return `${base}?seed=${encodeURIComponent(seed)}`;
}

export function buildSectionPath(
  section: AppSection,
  options?: { location?: LocationFilter; search?: Record<string, string> },
): string {
  const base = section === "home" ? "/" : `/${section}`;
  const params = new URLSearchParams(options?.search);

  const loc = options?.location;
  if (loc?.borough && loc.borough !== "All") {
    params.set("borough", boroughToSlug(loc.borough));
    if (loc.neighborhood) params.set("hood", loc.neighborhood);
  }

  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export function buildPathForView(view: ViewKey, location?: LocationFilter): string {
  return buildSectionPath(viewToSection(view), { location });
}

export function buildVenuePath(
  providerOrKey: Provider | string,
  options?: { from?: AppSection; location?: LocationFilter; locale?: AppLocale },
): string {
  const key =
    typeof providerOrKey === "string"
      ? providerOrKey
      : getVenuePathKey(providerOrKey, options?.locale);
  const from = options?.from ?? "venues";
  const params = new URLSearchParams();
  params.set("from", from);
  const loc = options?.location;
  if (loc?.borough && loc.borough !== "All") {
    params.set("borough", boroughToSlug(loc.borough));
    if (loc.neighborhood) params.set("hood", loc.neighborhood);
  }
  return `/venue/${encodeURIComponent(key)}?${params.toString()}`;
}

export function buildGroupPath(groupId: string): string {
  return `/group/${encodeURIComponent(groupId)}`;
}

export function buildEventPath(
  eventOrKey: NightEvent | string,
  options?: { from?: AppSection; location?: LocationFilter; locale?: AppLocale },
): string {
  const key =
    typeof eventOrKey === "string" ? eventOrKey : getEventPathKey(eventOrKey, options?.locale);
  const from = options?.from ?? "events";
  const params = new URLSearchParams();
  params.set("from", from);
  const loc = options?.location;
  if (loc?.borough && loc.borough !== "All") {
    params.set("borough", boroughToSlug(loc.borough));
    if (loc.neighborhood) params.set("hood", loc.neighborhood);
  }
  return `/event/${encodeURIComponent(key)}?${params.toString()}`;
}

function withFullPageSuffix(path: string): string {
  const q = path.indexOf("?");
  if (q === -1) return `${path}/full`;
  return `${path.slice(0, q)}/full?${path.slice(q + 1)}`;
}

export function buildVenueFullPath(
  providerOrKey: Provider | string,
  options?: { from?: AppSection; location?: LocationFilter; locale?: AppLocale },
): string {
  return withFullPageSuffix(buildVenuePath(providerOrKey, options));
}

export function buildEventFullPath(
  eventOrKey: NightEvent | string,
  options?: { from?: AppSection; location?: LocationFilter; locale?: AppLocale },
): string {
  return withFullPageSuffix(buildEventPath(eventOrKey, options));
}

export function buildGroupFullPath(groupId: string): string {
  return `${buildGroupPath(groupId)}/full`;
}

export function tourSeedFromSearch(search: URLSearchParams): string | null {
  const seed = search.get("seed");
  return seed?.trim() ? seed : null;
}

/** Live Vercel deployment — override with NEXT_PUBLIC_SITE_URL when you add a custom domain. */
export const DEFAULT_SITE_ORIGIN = "https://budapest-night.vercel.app";

export function getSiteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_ORIGIN;
}
