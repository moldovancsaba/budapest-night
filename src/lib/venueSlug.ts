import type { AppLocale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import type { Borough } from "@/types/provider";
import type { Provider } from "@/types/provider";

/** URL segment tokens that must not appear unless the venue is in that district. */
const DISTRICT_SLUG_TOKENS: Record<string, Borough> = {
  obuda: "Óbuda",
  ujbuda: "Újbuda",
  belvaros: "Belváros",
  terezvaros: "Terézváros",
  erzsebetvaros: "Erzsébetváros",
  ferencvaros: "Ferencváros",
};

const LOCALE_SLUG_SUFFIX = /^(.+)-(hu|es|it|he|ar)$/;

export function slugifyVenueName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugFromProviderId(id: string): string {
  let s = id.replace(/^prov-/, "");
  for (const token of Object.keys(DISTRICT_SLUG_TOKENS)) {
    const suffix = `-${token}`;
    if (s.endsWith(suffix)) s = s.slice(0, -suffix.length);
  }
  return s;
}

function districtMismatchScore(slug: string, borough: Borough): number {
  const lower = slug.toLowerCase();
  let penalty = 0;
  for (const [token, expectedBorough] of Object.entries(DISTRICT_SLUG_TOKENS)) {
    if (!lower.includes(token)) continue;
    if (borough !== expectedBorough) penalty += 100;
  }
  return penalty;
}

/** Remove misleading district tokens from a slug when borough does not match. */
export function sanitizeVenueSlug(slug: string, borough: Borough): string {
  let s = slug.trim().toLowerCase();
  for (const [token, expectedBorough] of Object.entries(DISTRICT_SLUG_TOKENS)) {
    if (borough === expectedBorough) continue;
    s = s.replace(new RegExp(`-${token}(?=-|$)`, "g"), "");
    s = s.replace(new RegExp(`^${token}-`, "g"), "");
  }
  return s.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function pickBestSlug(candidates: string[], borough: Borough): string | null {
  if (candidates.length === 0) return null;
  const ranked = [...new Set(candidates)]
    .map((raw) => {
      const m = raw.match(LOCALE_SLUG_SUFFIX);
      const base = m ? m[1]! : raw;
      const sanitized = sanitizeVenueSlug(base, borough);
      let score = 100 - districtMismatchScore(sanitized, borough);
      if (!LOCALE_SLUG_SUFFIX.test(raw)) score += 10;
      if (sanitized.length >= 3) score += 5;
      return { raw, sanitized, score };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.sanitized || null;
}

/** Canonical English URL segment — never a raw `prov-…` id with a wrong district suffix. */
export function getCanonicalVenueSlug(provider: Provider): string {
  const en = provider.locales?.en?.slug?.trim();
  if (en) {
    const clean = sanitizeVenueSlug(en, provider.borough);
    if (clean) return clean;
  }

  const hu = provider.locales?.hu?.slug?.trim();
  if (hu) {
    const base = hu.replace(LOCALE_SLUG_SUFFIX, "$1");
    const clean = sanitizeVenueSlug(base, provider.borough);
    if (clean) return clean;
  }

  const fromLocales = Object.values(provider.locales ?? {})
    .map((v) => v?.slug?.trim())
    .filter((s): s is string => Boolean(s));
  const best = pickBestSlug(fromLocales, provider.borough);
  if (best) return best;

  const fromId = slugFromProviderId(provider.id);
  if (fromId) {
    const clean = sanitizeVenueSlug(fromId, provider.borough);
    if (clean) return clean;
  }

  return slugifyVenueName(provider.name);
}

/** All path segments that should resolve to this provider (legacy ids and old slugs). */
export function legacyVenuePathKeys(provider: Provider): string[] {
  const keys = new Set<string>();
  keys.add(provider.id);
  keys.add(slugFromProviderId(provider.id));
  keys.add(getCanonicalVenueSlug(provider));
  for (const v of Object.values(provider.locales ?? {})) {
    const s = v?.slug?.trim();
    if (s) keys.add(s);
  }
  return [...keys];
}

export function venuePathKeyForLocale(
  provider: Provider,
  locale: AppLocale = defaultLocale,
): string {
  const localized = provider.locales?.[locale]?.slug?.trim();
  if (localized) {
    return sanitizeVenueSlug(
      localized.replace(LOCALE_SLUG_SUFFIX, "$1"),
      provider.borough,
    );
  }
  return getCanonicalVenueSlug(provider);
}
