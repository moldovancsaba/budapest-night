/**
 * Blocking location validation for ingest payloads (commercial rigid rules).
 */

const {
  resolveLocationFromRegistry,
  neighborhoodAllowed,
  checkForbiddenPairings,
  checkForbiddenCopy,
  extractPostalCode,
  postalEntry,
} = require("./budapest-postal-registry.cjs");

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

function validateProviderLocationForIngest(doc, pathPrefix) {
  const errors = [];
  const p = pathPrefix || "provider";
  const address = typeof doc.address === "string" ? doc.address.trim() : "";
  const borough = doc.borough;
  const neighborhood = doc.neighborhood;

  if (!address) {
    errors.push(`${p}.address: required`);
    return errors;
  }

  const postal = extractPostalCode(address);
  if (!postal) {
    errors.push(`${p}.address: must include 4-digit postal + "Budapest" (e.g. 1124 Budapest, Csörsz utca 18, Hungary)`);
    return errors;
  }

  if (!postalEntry(postal)) {
    errors.push(
      `${p}.address: postal ${postal} is not registered — add it to src/data/budapest-location-registry.json (with kerulet + appBorough)`,
    );
    return errors;
  }

  const resolved = resolveLocationFromRegistry({
    id: doc.id,
    address,
    borough,
    neighborhood,
  });

  if (resolved.error) {
    errors.push(`${p}: ${resolved.error}`);
    return errors;
  }

  if (borough !== resolved.borough) {
    errors.push(
      `${p}.borough: must be ${resolved.borough} (registry ${resolved.source}; postal ${postal} = Budapest ${resolved.kerulet || "?"}. ker.) — not ${borough}`,
    );
  }

  const expectedHood =
    resolved.source.startsWith("landmark") || resolved.source.startsWith("addressOverride")
      ? resolved.neighborhood
      : neighborhood;

  if (resolved.source.startsWith("landmark") || resolved.source.startsWith("addressOverride")) {
    if (neighborhood !== resolved.neighborhood) {
      errors.push(
        `${p}.neighborhood: must be ${resolved.neighborhood} for this address (registry ${resolved.source})`,
      );
    }
  } else if (!neighborhoodAllowed(borough, neighborhood)) {
    errors.push(
      `${p}.neighborhood: "${neighborhood}" is not allowed under borough ${borough} — use src/data/locations.ts`,
    );
  }

  for (const msg of checkForbiddenPairings(address, borough, neighborhood)) {
    errors.push(`${p}: ${msg}`);
  }

  for (const msg of checkForbiddenCopy(address, collectProviderTextFields(doc))) {
    errors.push(`${p}: copy — ${msg}`);
  }

  return errors;
}

function validateEventLocationForIngest(doc, pathPrefix) {
  const errors = [];
  const p = pathPrefix || "event";
  if (!doc.borough || !doc.neighborhood) {
    errors.push(`${p}: borough and neighborhood required (must match primary host after ingest)`);
  }
  return errors;
}

/** Fix-script only: strip forbidden location copy from existing rows being re-ingested. */
function scrubForbiddenLocationCopy(doc) {
  const address = doc.address || "";
  const next = { ...doc };
  const scrub = (text) => {
    if (!text || typeof text !== "string") return text;
    let s = text;
    if (/csörsz|csorsz/i.test(address)) {
      s = s
        .replace(/\bInfopark\b/gi, "MOM Cultural Centre")
        .replace(/\binfopark\b/g, "MOM");
    }
    return s;
  };
  if (next.shortDescription) next.shortDescription = scrub(next.shortDescription);
  if (next.longDescription) next.longDescription = scrub(next.longDescription);
  if (next.locales) {
    next.locales = { ...next.locales };
    for (const [code, loc] of Object.entries(next.locales)) {
      if (!loc || typeof loc !== "object") continue;
      next.locales[code] = {
        ...loc,
        shortDescription: scrub(loc.shortDescription),
        longDescription: scrub(loc.longDescription),
      };
    }
  }
  return next;
}

module.exports = {
  validateProviderLocationForIngest,
  validateEventLocationForIngest,
  scrubForbiddenLocationCopy,
};
