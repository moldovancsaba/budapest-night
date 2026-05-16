const EVENT_INGEST_LOCALES = ["hu", "es", "it", "he", "ar"];
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateEventLocalesForIngest(localesMap, pathPrefix) {
  const errors = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(`${pathPrefix}: locales object required with keys ${EVENT_INGEST_LOCALES.join(", ")}`);
    return errors;
  }
  for (const code of EVENT_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const v = localesMap[code];
    if (!v || typeof v !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    for (const field of ["title", "shortDescription", "longDescription", "slug"]) {
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
  }
  return errors;
}

module.exports = { EVENT_INGEST_LOCALES, validateEventLocalesForIngest };
