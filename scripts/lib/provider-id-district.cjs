/**
 * Provider id suffix tokens vs Budapest borough (keep in sync with src/lib/venueSlug.ts).
 */
const DISTRICT_SLUG_TOKENS = {
  obuda: "Óbuda",
  ujbuda: "Újbuda",
  belvaros: "Belváros",
  terezvaros: "Terézváros",
  erzsebetvaros: "Erzsébetváros",
  ferencvaros: "Ferencváros",
  buda: "Buda",
};

const TOKEN_ORDER = Object.keys(DISTRICT_SLUG_TOKENS).sort((a, b) => b.length - a.length);

/** Already migrated — keep for URL resolution. */
const RETIRED_PROVIDER_ID_ALIASES = {
  "prov-budapest-park-obuda": "prov-budapest-park-ferencvaros",
  "prov-mvm-dome-ujbuda": "prov-mvm-dome-terezvaros",
  "prov-cov-island-cafe-obuda": "prov-cov-island-cafe-ferencvaros",
  "prov-cov-park-party-obuda": "prov-cov-park-party-ferencvaros",
  "prov-cov-rudas-ujbuda-party": "prov-cov-rudas-buda-party",
};

function suffixTokenFromProviderId(id) {
  let s = id.replace(/^prov-/, "");
  for (const token of TOKEN_ORDER) {
    if (s.endsWith(`-${token}`)) return token;
  }
  return null;
}

function boroughToSlugToken(borough) {
  return Object.entries(DISTRICT_SLUG_TOKENS).find(([, b]) => b === borough)?.[0];
}

/** If id suffix district ≠ provider borough, return corrected prov-* id. */
function proposeRenamedProviderId(id, borough) {
  const token = suffixTokenFromProviderId(id);
  if (!token) return null;
  if (DISTRICT_SLUG_TOKENS[token] === borough) return null;
  const correct = boroughToSlugToken(borough);
  if (!correct) return null;
  const base = id.replace(/^prov-/, "").slice(0, -(`-${token}`).length);
  return `prov-${base}-${correct}`;
}

/** Build old→new map for every catalog row with a misleading suffix. */
function computeProviderIdRenames(providers) {
  const renames = { ...RETIRED_PROVIDER_ID_ALIASES };
  for (const p of providers) {
    if (!p?.id || !p?.borough) continue;
    const next = proposeRenamedProviderId(p.id, p.borough);
    if (next && next !== p.id) renames[p.id] = next;
  }
  return renames;
}

function remapVenueIds(ids, renames) {
  if (!Array.isArray(ids)) return ids;
  return ids.map((id) => renames[id] ?? id);
}

module.exports = {
  DISTRICT_SLUG_TOKENS,
  RETIRED_PROVIDER_ID_ALIASES,
  suffixTokenFromProviderId,
  proposeRenamedProviderId,
  computeProviderIdRenames,
  remapVenueIds,
};
