/** Keep in sync with src/lib/curator/localeIngestRules.ts */
const PROVIDER_INGEST_LOCALES = ["hu", "es", "it", "he", "ar"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateProviderLocalesForIngest(localesMap, pathPrefix) {
  const errors = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(`${pathPrefix}: locales object required with keys ${PROVIDER_INGEST_LOCALES.join(", ")}`);
    return errors;
  }
  for (const code of PROVIDER_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const v = localesMap[code];
    if (!v || typeof v !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    for (const field of ["name", "shortDescription", "longDescription", "slug"]) {
      if (typeof v[field] !== "string" || !String(v[field]).trim()) {
        errors.push(`${p}.${field}: required non-empty string`);
      }
    }
    const slug = typeof v.slug === "string" ? v.slug.trim() : "";
    if (slug && !SLUG_RE.test(slug)) {
      errors.push(`${p}.slug: must be lowercase ASCII hyphenated slug`);
    }
    const long = typeof v.longDescription === "string" ? v.longDescription : "";
    if (long.trim() && !/Sources:\s*https?:\/\//i.test(long)) {
      errors.push(`${p}.longDescription: must include Sources: line with https URL(s)`);
    }
    if (v.activityTypes !== undefined) {
      errors.push(`${p}: do not set activityTypes in locales (use root English tags only)`);
    }
  }
  return errors;
}

module.exports = { PROVIDER_INGEST_LOCALES, validateProviderLocalesForIngest };
