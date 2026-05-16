/**
 * Raster images for marketing + UI fallbacks must be **https://i.ibb.co/...** (ImgBB).
 * `NEXT_PUBLIC_IMG_BB_*` overrides these defaults (set after `npm run imgbb:upload-assets`).
 */
export type CmsMediaUrls = {
  homeHero: string;
  discoverHero: string;
  fallbackListing: string;
  fallbackMeetup: string;
  guideCard: string;
};

/** Budapest nightlife defaults (re-run `npm run imgbb:upload-assets` to rotate). */
const BAKED_IMG_BB: CmsMediaUrls = {
  homeHero: "https://i.ibb.co/GQCgxnm0/cbe8e6335604.jpg",
  discoverHero: "https://i.ibb.co/HLd5nwcK/27a9829853a0.jpg",
  fallbackListing: "https://i.ibb.co/1f00nn4X/b4bef39e5fc5.jpg",
  fallbackMeetup: "https://i.ibb.co/CsBQ1Ff5/9f2233d76c21.jpg",
  guideCard: "https://i.ibb.co/xK672jw6/6a4e4e8ea50c.jpg",
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
