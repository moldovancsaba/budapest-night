/** Keep in sync with src/lib/curator/menuLocaleIngestRules.ts */
const MENU_INGEST_LOCALES = ["hu", "es", "it", "he", "ar"];

function validateMenuItemLocalesForIngest(localesMap, pathPrefix) {
  const errors = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(
      `${pathPrefix}: locales object required with keys ${MENU_INGEST_LOCALES.join(", ")} (translate menu item)`,
    );
    return errors;
  }
  if (localesMap.en !== undefined) {
    errors.push(`${pathPrefix}.locales: do not add "en" — English is the root name`);
  }
  for (const code of MENU_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const v = localesMap[code];
    if (!v || typeof v !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    if (typeof v.name !== "string" || !String(v.name).trim()) {
      errors.push(`${p}.name: required non-empty string`);
    }
    if (v.description !== undefined && typeof v.description !== "string") {
      errors.push(`${p}.description: must be string when set`);
    }
    if (v.tags !== undefined || v.price !== undefined || v.kind !== undefined) {
      errors.push(`${p}: do not put tags/price/kind inside locales`);
    }
  }
  return errors;
}

function validateMenuSectionLocalesForIngest(localesMap, pathPrefix) {
  const errors = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(
      `${pathPrefix}: locales object required with keys ${MENU_INGEST_LOCALES.join(", ")} (translate section title)`,
    );
    return errors;
  }
  if (localesMap.en !== undefined) {
    errors.push(`${pathPrefix}.locales: do not add "en" — English is the root title`);
  }
  for (const code of MENU_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const v = localesMap[code];
    if (!v || typeof v !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    if (typeof v.title !== "string" || !String(v.title).trim()) {
      errors.push(`${p}.title: required non-empty string`);
    }
  }
  return errors;
}

module.exports = {
  MENU_INGEST_LOCALES,
  validateMenuItemLocalesForIngest,
  validateMenuSectionLocalesForIngest,
};
