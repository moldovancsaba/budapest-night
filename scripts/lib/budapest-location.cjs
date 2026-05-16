/** Budapest location — registry-backed only (see src/data/budapest-location-registry.json). */

const {
  BOROUGHS,
  NEIGHBORHOODS,
  registry,
  resolveLocationFromRegistry,
  neighborhoodAllowed,
  checkForbiddenPairings,
  checkForbiddenCopy,
  normalizeAddressKey,
  extractPostalCode,
  postalEntry,
} = require("./budapest-postal-registry.cjs");

const LEGACY_PROVIDER_ID_ALIASES = {
  "prov-budapest-park-obuda": "prov-budapest-park-ferencvaros",
  "prov-mvm-dome-ujbuda": "prov-mvm-dome-terezvaros",
  "prov-cov-island-cafe-obuda": "prov-cov-island-cafe-ferencvaros",
  "prov-cov-park-party-obuda": "prov-cov-park-party-ferencvaros",
  "prov-cov-rudas-ujbuda-party": "prov-cov-rudas-buda-party",
};

const CANONICAL_BY_ID = Object.fromEntries(
  registry.landmarks.map((l) => [
    l.id,
    { borough: l.borough, neighborhood: l.neighborhood, address: l.address },
  ]),
);

function collectProviderTextFields(doc) {
  const out = [];
  if (typeof doc.shortDescription === "string") out.push(doc.shortDescription);
  if (typeof doc.longDescription === "string") out.push(doc.longDescription);
  for (const loc of Object.values(doc.locales || {})) {
    if (loc && typeof loc === "object") {
      if (typeof loc.shortDescription === "string") out.push(loc.shortDescription);
      if (typeof loc.longDescription === "string") out.push(loc.longDescription);
    }
  }
  return out;
}

function suggestProviderLocation(provider) {
  const address = (provider.address || "").trim();
  const resolved = resolveLocationFromRegistry({
    id: provider.id,
    address,
    borough: provider.borough,
    neighborhood: provider.neighborhood,
  });
  if (resolved.error) return null;

  const highConfidence =
    resolved.source.startsWith("landmark") || resolved.source.startsWith("addressOverride");
  if (!highConfidence) return null;

  const forbidden = checkForbiddenPairings(address, provider.borough, provider.neighborhood);
  const boroughWrong = provider.borough !== resolved.borough;
  const hoodWrong = provider.neighborhood !== resolved.neighborhood;
  if (!boroughWrong && !hoodWrong && !forbidden.length) return null;

  return {
    borough: resolved.borough,
    neighborhood: resolved.neighborhood,
    address: resolved.source.startsWith("landmark") ? resolved.address : address,
    reason: resolved.source.split(":")[0],
  };
}

function locationNeedsFix(provider) {
  return suggestProviderLocation(provider) !== null;
}

function applyLocationToProvider(provider, loc) {
  return {
    ...provider,
    borough: loc.borough,
    neighborhood: loc.neighborhood,
    address: loc.address || provider.address,
  };
}

function syncEventFromHost(event, host) {
  if (!host) return event;
  return { ...event, borough: host.borough, neighborhood: host.neighborhood };
}

function validateCanonicalProvider(doc, pathPrefix) {
  const errors = [];
  if (LEGACY_PROVIDER_ID_ALIASES[doc.id]) {
    errors.push(
      `${pathPrefix}: id ${doc.id} is retired — use ${LEGACY_PROVIDER_ID_ALIASES[doc.id]} instead`,
    );
    return errors;
  }

  errors.push(
    ...require("./location-ingest-validate.cjs").validateProviderLocationForIngest(doc, pathPrefix),
  );

  const canonical = CANONICAL_BY_ID[doc.id];
  if (canonical?.address && doc.address && doc.address.trim() !== canonical.address) {
    errors.push(`${pathPrefix}: address must be ${canonical.address} for ${doc.id}`);
  }

  if (doc.id === "prov-mvm-dome-terezvaros" && doc.website && !/^https:\/\/(www\.)?mvm-dome\.hu/i.test(doc.website)) {
    errors.push(`${pathPrefix}: website should be https://mvm-dome.hu`);
  }
  if (
    doc.id === "prov-budapest-park-ferencvaros" &&
    doc.website &&
    !/^https:\/\/(www\.)?budapestpark\.hu/i.test(doc.website)
  ) {
    errors.push(`${pathPrefix}: website should be https://www.budapestpark.hu/...`);
  }

  return errors;
}

function validateCanonicalEvent(doc, pathPrefix, providersById) {
  const errors = [];
  const hostId = Array.isArray(doc.venueIds) ? doc.venueIds[0] : undefined;
  if (typeof hostId !== "string") return errors;

  if (LEGACY_PROVIDER_ID_ALIASES[hostId]) {
    errors.push(
      `${pathPrefix}: venueIds must use ${LEGACY_PROVIDER_ID_ALIASES[hostId]} instead of retired ${hostId}`,
    );
    return errors;
  }

  const canonical = CANONICAL_BY_ID[hostId];
  if (canonical) {
    if (doc.borough && doc.borough !== canonical.borough) {
      errors.push(`${pathPrefix}: borough must be ${canonical.borough} for host ${hostId}`);
    }
    if (doc.neighborhood && doc.neighborhood !== canonical.neighborhood) {
      errors.push(`${pathPrefix}: neighborhood must be ${canonical.neighborhood} for host ${hostId}`);
    }
  }

  const live = providersById?.get(hostId);
  if (live) {
    errors.push(
      ...require("./location-ingest-validate.cjs").validateProviderLocationForIngest(
        live,
        `${pathPrefix}: host ${hostId}`,
      ),
    );
  }

  return errors;
}

function auditProviderLocationFields(provider, ctx = {}) {
  const errors = [];
  const ingestErrors = require("./location-ingest-validate.cjs").validateProviderLocationForIngest(
    provider,
    provider.id,
  );
  for (const msg of ingestErrors) {
    let code = "canonical_location_mismatch";
    if (msg.includes("postal") && msg.includes("not registered")) code = "postal_not_registered";
    else if (msg.includes(".borough:")) code = "postal_borough_mismatch";
    else if (msg.includes("neighborhood")) code = "landmark_neighborhood_mismatch";
    else if (msg.includes("copy —")) code = "forbidden_district_copy";
    errors.push({ code, message: msg });
  }

  if (ctx.duplicateAddressPeers?.length) {
    const boroughs = new Set(ctx.duplicateAddressPeers.map((p) => p.borough).filter(Boolean));
    if (boroughs.size > 1) {
      errors.push({
        code: "duplicate_address_inconsistent",
        message: `Same address as ${ctx.duplicateAddressPeers.map((p) => p.id).join(", ")} but different borough labels`,
        peers: ctx.duplicateAddressPeers.map((p) => ({
          id: p.id,
          borough: p.borough,
          neighborhood: p.neighborhood,
        })),
      });
    }
  }

  return errors;
}

function buildAddressPeerIndex(providers) {
  const byKey = new Map();
  for (const p of providers) {
    const key = normalizeAddressKey(p.address);
    if (!key) continue;
    const list = byKey.get(key) || [];
    list.push(p);
    byKey.set(key, list);
  }
  return byKey;
}

/** @deprecated Copy patches removed — ingest rejects forbidden copy at validation time. */
function applyMomCopyPatches(provider) {
  return provider;
}

module.exports = {
  BOROUGHS,
  NEIGHBORHOODS,
  LEGACY_PROVIDER_ID_ALIASES,
  CANONICAL_BY_ID,
  suggestProviderLocation,
  locationNeedsFix,
  applyLocationToProvider,
  applyMomCopyPatches,
  syncEventFromHost,
  validateCanonicalProvider,
  validateCanonicalEvent,
  auditProviderLocationFields,
  buildAddressPeerIndex,
  normalizeAddressKey,
  resolveLocationFromRegistry,
};
