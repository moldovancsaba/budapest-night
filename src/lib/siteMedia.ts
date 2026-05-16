import { CMS_MEDIA } from "@/config/defaultMedia";
import { imgbbFilenameHash, isBannedImageUrl } from "@/lib/curator/catalogImageValidate";

/** ImgBB URLs that must never be used for site marketing heroes (wrong asset uploads). */
export const STALE_SITE_MEDIA_URLS = [
  "https://i.ibb.co/VWwV2Qt6/6699c3090ff3.jpg",
  "https://i.ibb.co/GQCgxnm0/cbe8e6335604.jpg",
] as const;

export function isStaleSiteMediaUrl(url: string | undefined | null): boolean {
  const u = url?.trim();
  if (!u) return false;
  if (STALE_SITE_MEDIA_URLS.includes(u as (typeof STALE_SITE_MEDIA_URLS)[number])) return true;
  return isBannedImageUrl(u);
}

/** Prefer CMS defaults when Mongo/env still reference a known-bad or banned ImgBB URL. */
export function resolveHomeHeroUrl(mongoOrEnvUrl?: string | null): string {
  const candidate = mongoOrEnvUrl?.trim() ?? "";
  if (!candidate || isStaleSiteMediaUrl(candidate)) return CMS_MEDIA.homeHero;
  return candidate;
}

export function resolveDiscoverHeroUrl(mongoOrEnvUrl?: string | null): string {
  const candidate = mongoOrEnvUrl?.trim() ?? "";
  if (!candidate || isStaleSiteMediaUrl(candidate)) return CMS_MEDIA.discoverHero;
  return candidate;
}

/** Bust long-lived ImgBB browser cache after URL rotations (query string ignored by ImgBB CDN). */
export function cacheBustMediaUrl(url: string | undefined | null): string {
  const u = url?.trim();
  if (!u || !/^https:\/\//i.test(u)) return u ?? "";
  if (u.includes("?")) return u;
  const id = imgbbFilenameHash(u);
  return id ? `${u}?v=${id}` : u;
}
