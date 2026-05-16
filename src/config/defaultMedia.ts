/**
 * Raster images for marketing + UI fallbacks must be **https://i.ibb.co/...** (ImgBB).
 * `NEXT_PUBLIC_IMG_BB_*` overrides these defaults (set after `npm run imgbb:upload-assets`).
 */
import type { Category } from "@/types/provider";

export type CmsMediaUrls = {
  homeHero: string;
  discoverHero: string;
  fallbackListing: string;
  fallbackMeetup: string;
  guideCard: string;
};

/** Budapest nightlife defaults (re-run `npm run imgbb:upload-assets` to rotate). */
const BAKED_IMG_BB: CmsMediaUrls = {
  homeHero: "https://i.ibb.co/VWwV2Qt6/6699c3090ff3.jpg",
  discoverHero: "https://i.ibb.co/4g3Bf6n6/53e86654299f.jpg",
  fallbackListing: "https://i.ibb.co/1f00nn4X/b4bef39e5fc5.jpg",
  fallbackMeetup: "https://i.ibb.co/Mx9DQ6X7/44603dce365f.jpg",
  guideCard: "https://i.ibb.co/xK672jw6/6a4e4e8ea50c.jpg",
};

/** Discover category hero — one scene per Events / Parties / Restaurants / Cafés. */
const BAKED_DISCOVER_HERO_BY_CATEGORY: Record<Category, string> = {
  Venues: "https://i.ibb.co/Z17xzwSm/7a7a1fab59a0.jpg",
  Parties: "https://i.ibb.co/4g3Bf6n6/53e86654299f.jpg",
  Restaurants: "https://i.ibb.co/fdZ1jDct/90043b184c36.jpg",
  "Cafés": "https://i.ibb.co/KjHkYtQs/53f3688c0a7b.png",
};

/** Culture circles listing hero (Meet-Up Groups). */
const BAKED_CULTURE_DISCOVER_HERO =
  "https://i.ibb.co/Mx9DQ6X7/44603dce365f.jpg";

/** Featured district guide cards — one distinct scene per guide id. */
export const GUIDE_IMAGE_BY_ID: Record<string, string> = {
  "guide-belvaros": "https://i.ibb.co/Wv8BgB2k/e0c2e2090035.jpg",
  "guide-jewish-quarter": "https://i.ibb.co/Txz1FJQD/2b6ef53ffe23.jpg",
  "guide-andrassy": "https://i.ibb.co/99x7Yxzt/e18ce39c1140.jpg",
  "guide-buda": "https://i.ibb.co/yBMjWmDH/5e7dddeb2089.jpg",
};

const DISCOVER_HERO_ENV: Record<Category, string> = {
  Venues: "NEXT_PUBLIC_IMG_BB_DISCOVER_HERO_EVENTS",
  Parties: "NEXT_PUBLIC_IMG_BB_DISCOVER_HERO_PARTIES",
  Restaurants: "NEXT_PUBLIC_IMG_BB_DISCOVER_HERO_RESTAURANTS",
  "Cafés": "NEXT_PUBLIC_IMG_BB_DISCOVER_HERO_CAFES",
};

const ENV_KEYS: Record<keyof CmsMediaUrls, string> = {
  homeHero: "NEXT_PUBLIC_IMG_BB_HOME_HERO",
  discoverHero: "NEXT_PUBLIC_IMG_BB_DISCOVER_HERO",
  fallbackListing: "NEXT_PUBLIC_IMG_BB_FALLBACK_LISTING",
  fallbackMeetup: "NEXT_PUBLIC_IMG_BB_FALLBACK_MEETUP",
  guideCard: "NEXT_PUBLIC_IMG_BB_GUIDE_CARD",
};

function pick(key: keyof CmsMediaUrls): string {
  const e = typeof process !== "undefined" ? process.env : undefined;
  const raw = e?.[ENV_KEYS[key] as keyof NodeJS.ProcessEnv];
  const fromEnv = typeof raw === "string" ? raw.trim() : "";
  return fromEnv || BAKED_IMG_BB[key];
}

function pickDiscoverHero(category: Category): string {
  const e = typeof process !== "undefined" ? process.env : undefined;
  const envKey = DISCOVER_HERO_ENV[category];
  const fromEnv = typeof e?.[envKey as keyof NodeJS.ProcessEnv] === "string"
    ? (e[envKey as keyof NodeJS.ProcessEnv] as string).trim()
    : "";
  if (fromEnv) return fromEnv;
  return BAKED_DISCOVER_HERO_BY_CATEGORY[category];
}

function pickCultureDiscoverHero(): string {
  const e = typeof process !== "undefined" ? process.env : undefined;
  const raw = e?.NEXT_PUBLIC_IMG_BB_DISCOVER_HERO_CULTURE;
  const fromEnv = typeof raw === "string" ? raw.trim() : "";
  return fromEnv || BAKED_CULTURE_DISCOVER_HERO;
}

export function guideImageForId(id: string | undefined): string {
  if (id && GUIDE_IMAGE_BY_ID[id]) return GUIDE_IMAGE_BY_ID[id];
  return BAKED_IMG_BB.guideCard;
}

/** Timed events listing hero (concerts, festivals). */
export const BAKED_EVENTS_LISTING_HERO = BAKED_DISCOVER_HERO_BY_CATEGORY.Venues;

/** Hero image for Discover category pages (Venues, Parties, etc.). */
export function discoverHeroForCategory(
  category: Category,
  siteOverride?: string | null,
): string {
  const trimmed = siteOverride?.trim();
  if (trimmed) return trimmed;
  return pickDiscoverHero(category);
}

/** Hero image for Culture / meet-up groups listing. */
export function cultureDiscoverHero(siteOverride?: string | null): string {
  const trimmed = siteOverride?.trim();
  if (trimmed) return trimmed;
  return pickCultureDiscoverHero();
}

function readEnv(): CmsMediaUrls {
  return {
    homeHero: pick("homeHero"),
    discoverHero: pick("discoverHero"),
    fallbackListing: pick("fallbackListing"),
    fallbackMeetup: pick("fallbackMeetup"),
    guideCard: pick("guideCard"),
  };
}

export function getCmsMediaUrls(): CmsMediaUrls {
  return readEnv();
}

export const CMS_MEDIA: CmsMediaUrls = {
  get homeHero() {
    return readEnv().homeHero;
  },
  get discoverHero() {
    return readEnv().discoverHero;
  },
  get fallbackListing() {
    return readEnv().fallbackListing;
  },
  get fallbackMeetup() {
    return readEnv().fallbackMeetup;
  },
  get guideCard() {
    return readEnv().guideCard;
  },
} as CmsMediaUrls;
