/**
 * Raster images for marketing + UI fallbacks must be **https://i.ibb.co/...** (ImgBB).
 * `NEXT_PUBLIC_IMG_BB_*` overrides these defaults (set after `npm run imgbb:upload-assets`).
 *
 * Built-in URLs are from the repo’s bundled JPEGs uploaded once to ImgBB so guides/heroes
 * are not empty before Vercel env is configured. Re-run the upload script and replace here
 * if you rotate the ImgBB account or images are removed.
 */
export type CmsMediaUrls = {
  homeHero: string;
  discoverHero: string;
  fallbackListing: string;
  fallbackMeetup: string;
  guideCard: string;
};

/** Last-resort CDN URLs (same assets as `scripts/imgbb-asset-sources/`). */
const BAKED_IMG_BB: CmsMediaUrls = {
  homeHero: "https://i.ibb.co/C3k9k2bG/eec5793c6379.jpg",
  discoverHero: "https://i.ibb.co/7d33cFj4/31b5a106c7f2.jpg",
  fallbackListing: "https://i.ibb.co/cX2MTsKW/1de59a6f2a20.jpg",
  fallbackMeetup: "https://i.ibb.co/B2gTxn0T/fb06bf613a97.jpg",
  guideCard: "https://i.ibb.co/0RCvBy95/783a0a6a17b1.jpg",
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

/** Lazy env reads (supports Next `NEXT_PUBLIC_*` inlining at build time). */
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
