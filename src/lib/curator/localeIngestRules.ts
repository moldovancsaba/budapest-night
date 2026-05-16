import { locales, localeLabels, type AppLocale } from "@/i18n/config";
import { getProviderImageIngestRulesForPrompt } from "@/lib/curator/imageIngestRules";

/** Root provider fields are English; stored in Mongo as the default fallback. */
export const PROVIDER_BASE_LOCALE: AppLocale = "en";

/**
 * Every new/updated provider ingest must include `locales` entries for these codes.
 * The public app resolves copy with `resolveProviderForLocale` (see `src/lib/providerLocale.ts`).
 */
export const PROVIDER_INGEST_LOCALES = locales.filter(
  (l): l is Exclude<AppLocale, "en"> => l !== PROVIDER_BASE_LOCALE,
);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ProviderLocaleIngestShape = {
  name: string;
  shortDescription: string;
  longDescription: string;
  slug: string;
  address?: string;
  announcementTitle?: string;
  announcementDescription?: string;
  announcementBadge?: string;
  image?: string;
};

/** Prompt block for Cursor curator + OpenAI extractor (keep in sync). */
export function getProviderLocaleIngestRulesForPrompt(): string {
  const localeList = PROVIDER_INGEST_LOCALES.map((code) => `${code} (${localeLabels[code]})`).join(", ");
  return `Multilingual provider copy (required on every provider upsert):
- Root document fields (name, shortDescription, longDescription, address, announcements) are **English** — canonical fallback for "${PROVIDER_BASE_LOCALE}" and any missing locale key.
- Include object "locales" with **all** of: ${localeList}.
- For each locale key, required fields: name, shortDescription, longDescription, slug.
- slug: lowercase ASCII hyphenated URL segment unique within this provider (e.g. "a38-hajo" for hu, "barco-a38" for es). No spaces or accents in slug.
- Translate faithfully from the official source; do not invent facts. Each longDescription must end with: Sources: <same https URLs as English>.
- address: include when the source gives a localized address line; otherwise omit (English address on root is used).
- announcementTitle / announcementDescription / announcementBadge: optional per locale when the English root uses them.
- image: optional per locale; only https ImgBB URLs. Usually omit and reuse root "image".
- **Do not** put activityTypes inside locales — keep English canonical tags only on the root "activityTypes" array (app translates tags via message files).
- Structural enums stay on the root only: category, borough, neighborhood, ageRanges, dayTimeTags, badges, pricePerClass, priceCurrency (optional EUR|HUF), rating, reviewCount, website, phone, email, id.
- **pricePerClass** is a typical **EUR** spend hint for bars/restaurants (cover, menu). For ticketed concert venues use \`0\` and put real ticket tiers on a timed \`event\` document (\`entryFees\` with HUF/EUR). Never store Hungarian forint ticket prices as EUR (e.g. 26999 HUF is not pricePerClass 26999).
- Hebrew (he) and Arabic (ar) copy may use RTL scripts in text fields; slug stays Latin ASCII.

${getProviderImageIngestRulesForPrompt()}`;
}

export function validateProviderLocalesForIngest(
  localesMap: unknown,
  pathPrefix: string,
): string[] {
  const errors: string[] = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(`${pathPrefix}: locales object required with keys ${PROVIDER_INGEST_LOCALES.join(", ")}`);
    return errors;
  }

  const record = localesMap as Record<string, unknown>;
  for (const code of PROVIDER_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const v = record[code];
    if (!v || typeof v !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    const loc = v as Record<string, unknown>;
    for (const field of ["name", "shortDescription", "longDescription", "slug"] as const) {
      if (typeof loc[field] !== "string" || !String(loc[field]).trim()) {
        errors.push(`${p}.${field}: required non-empty string`);
      }
    }
    const slug = typeof loc.slug === "string" ? loc.slug.trim() : "";
    if (slug && !SLUG_RE.test(slug)) {
      errors.push(`${p}.slug: must match ${SLUG_RE}`);
    }
    const long = typeof loc.longDescription === "string" ? loc.longDescription : "";
    if (long.trim() && !/Sources:\s*https?:\/\//i.test(long)) {
      errors.push(`${p}.longDescription: must end with a Sources: line listing https URL(s)`);
    }
    if (loc.activityTypes !== undefined) {
      errors.push(`${p}: do not set activityTypes in locales (use root English tags only)`);
    }
  }

  return errors;
}
