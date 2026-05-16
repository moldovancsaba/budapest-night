/**
 * Single source of truth: src/data/budapest-location-registry.json
 * App borough buckets + official kerület from postal / verified landmarks only.
 */

const path = require("path");
const registry = require(path.join(__dirname, "../../src/data/budapest-location-registry.json"));

const BOROUGHS = [
  "Belváros",
  "Terézváros",
  "Erzsébetváros",
  "Ferencváros",
  "Buda",
  "Óbuda",
  "Újbuda",
];

const NEIGHBORHOODS = {
  Belváros: ["Váci utca", "Deák tér", "Parliament", "Danube Promenade", "Inner City"],
  Terézváros: ["Andrássy út", "Opera", "Oktogon", "Király utca", "Liszt Ferenc tér", "Stefánia út"],
  Erzsébetváros: [
    "Jewish Quarter",
    "Gozsdu Udvar",
    "Kazinczy utca",
    "Wesselényi utca",
    "Rákóczi tér",
  ],
  Ferencváros: [
    "Corvin-negyed",
    "Műegyetem",
    "Petőfi Bridge",
    "Nagytemplom utca",
    "Boráros tér",
    "Millenniumi Városközpont",
    "Fábián Juli",
  ],
  Buda: ["Castle District", "Gellért Hill", "Tabán", "Rózsadomb", "Szent Gellért tér", "MOM Park"],
  Óbuda: ["Óbuda Island", "Aquincum", "Kolosy tér", "Bécsi út", "Main Square Óbuda"],
  Újbuda: [
    "Móricz Zsigmond körtér",
    "Gellért Baths area",
    "Infopark",
    "Kosztolányi Dezső tér",
    "Bikás park",
    "Kelenföld",
  ],
};

const LANDMARK_BY_ID = new Map(registry.landmarks.map((l) => [l.id, l]));
const LANDMARK_BY_ADDRESS = new Map(
  registry.landmarks.map((l) => [normalizeAddressKey(l.address), l]),
);

const ADDRESS_OVERRIDES = registry.addressOverrides.map((o) => ({
  ...o,
  re: new RegExp(o.pattern, "i"),
}));

const FORBIDDEN_PAIRINGS = registry.forbiddenPairings.map((o) => ({
  ...o,
  addressRe: new RegExp(o.addressPattern, "i"),
  forbiddenNeighborhood: o.forbiddenNeighborhood,
  forbiddenBorough: o.forbiddenBorough,
}));

const FORBIDDEN_COPY = registry.forbiddenCopyPatterns.map((o) => ({
  ...o,
  whenRe: new RegExp(o.whenAddressPattern, "i"),
  copyRe: new RegExp(o.pattern, "i"),
}));

function extractPostalCode(address) {
  const m = String(address || "").match(/\b(1\d{3})\s+Budapest/i);
  return m ? m[1] : "";
}

function normalizeAddressKey(address) {
  return String(address || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function postalEntry(postal) {
  return registry.postalToAppBorough[postal] ?? null;
}

/** Resolved location from registry rules only (no marketing inference). */
function resolveLocationFromRegistry(input) {
  const id = input.id;
  const address = String(input.address || "").trim();
  const postal = extractPostalCode(address);

  if (id && LANDMARK_BY_ID.has(id)) {
    const l = LANDMARK_BY_ID.get(id);
    return {
      borough: l.borough,
      neighborhood: l.neighborhood,
      address: l.address,
      source: `landmark:${id}`,
      kerulet: postalEntry(extractPostalCode(l.address))?.kerulet,
    };
  }

  const addrKey = normalizeAddressKey(address);
  if (addrKey && LANDMARK_BY_ADDRESS.has(addrKey)) {
    const l = LANDMARK_BY_ADDRESS.get(addrKey);
    return {
      borough: l.borough,
      neighborhood: l.neighborhood,
      address: l.address,
      source: `landmark:address`,
      kerulet: postalEntry(extractPostalCode(l.address))?.kerulet,
    };
  }

  for (const o of ADDRESS_OVERRIDES) {
    if (o.re.test(address)) {
      return {
        borough: o.borough,
        neighborhood: o.neighborhood,
        address,
        source: `addressOverride:${o.pattern}`,
        kerulet: postal ? postalEntry(postal)?.kerulet : undefined,
      };
    }
  }

  if (postal) {
    const row = postalEntry(postal);
    if (row) {
      return {
        borough: row.appBorough,
        neighborhood: input.neighborhood,
        address,
        source: `postal:${postal}`,
        kerulet: row.kerulet,
        keruletName: row.keruletName,
      };
    }
    return {
      error: `postal ${postal} not in budapest-location-registry.json — add postalToAppBorough before ingest`,
    };
  }

  return { error: "address must match: {postal} Budapest, {street}, Hungary" };
}

function neighborhoodAllowed(borough, neighborhood) {
  if (!borough || !neighborhood) return false;
  const list = NEIGHBORHOODS[borough];
  return Boolean(list && list.includes(neighborhood));
}

function checkForbiddenPairings(address, borough, neighborhood) {
  const errors = [];
  const text = String(address || "");
  for (const rule of FORBIDDEN_PAIRINGS) {
    if (!rule.addressRe.test(text)) continue;
    if (rule.forbiddenNeighborhood && neighborhood === rule.forbiddenNeighborhood) {
      errors.push(rule.reason);
    }
    if (rule.forbiddenBorough && borough === rule.forbiddenBorough) {
      errors.push(rule.reason);
    }
  }
  return errors;
}

function checkForbiddenCopy(address, fields) {
  const errors = [];
  const text = fields.join("\n");
  for (const rule of FORBIDDEN_COPY) {
    if (!rule.whenRe.test(address)) continue;
    if (rule.copyRe.test(text)) errors.push(rule.reason);
  }
  return errors;
}

function getRegistryPromptBlock() {
  return registry.rules;
}

module.exports = {
  REGISTRY_VERSION: registry.version,
  REGISTRY_SOURCES: registry.sources,
  BOROUGHS,
  NEIGHBORHOODS,
  registry,
  extractPostalCode,
  normalizeAddressKey,
  postalEntry,
  resolveLocationFromRegistry,
  neighborhoodAllowed,
  checkForbiddenPairings,
  checkForbiddenCopy,
  getRegistryPromptBlock,
};
