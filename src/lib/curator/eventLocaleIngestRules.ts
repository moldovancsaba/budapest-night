import { locales, localeLabels, type AppLocale } from "@/i18n/config";
import { PROVIDER_BASE_LOCALE } from "@/lib/curator/localeIngestRules";

export const EVENT_INGEST_LOCALES = locales.filter(
  (l): l is Exclude<AppLocale, "en"> => l !== PROVIDER_BASE_LOCALE,
);

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateEventLocalesForIngest(localesMap: unknown, pathPrefix: string): string[] {
  const errors: string[] = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(`${pathPrefix}: locales object required with keys ${EVENT_INGEST_LOCALES.join(", ")}`);
    return errors;
  }
  const record = localesMap as Record<string, unknown>;
  for (const code of EVENT_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const v = record[code];
    if (!v || typeof v !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    const row = v as Record<string, unknown>;
    if (typeof row.title !== "string" || !row.title.trim()) errors.push(`${p}.title: required`);
    if (typeof row.shortDescription !== "string" || !row.shortDescription.trim()) {
      errors.push(`${p}.shortDescription: required`);
    }
    if (typeof row.longDescription !== "string" || !row.longDescription.trim()) {
      errors.push(`${p}.longDescription: required`);
    }
    if (typeof row.slug !== "string" || !SLUG_RE.test(row.slug)) errors.push(`${p}.slug: invalid slug`);
    const ld = String(row.longDescription ?? "");
    if (!/Sources:\s*https?:\/\//i.test(ld)) {
      errors.push(`${p}.longDescription: must include Sources: line with https URL(s)`);
    }
  }
  return errors;
}

export function getEventLocaleIngestRulesForPrompt(): string {
  const localeList = EVENT_INGEST_LOCALES.map((code) => `${code} (${localeLabels[code]})`).join(", ");
  return `Multilingual timed event copy (required on every event upsert):
- Root fields (title, shortDescription, longDescription) are **English**.
- Include "locales" with **all** of: ${localeList}.
- Per locale: title, shortDescription, longDescription, slug (Latin ASCII hyphenated).
- longDescription must end with: Sources: <https URLs>.
- Structural fields stay on root only: startsAt, endsAt, venueIds, borough, entryFees, status, id.`;
}
