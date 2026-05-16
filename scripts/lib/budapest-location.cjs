/** Budapest district + neighborhood helpers for ingest location fixes. */

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
  Buda: ["Castle District", "Gellért Hill", "Tabán", "Rózsadomb", "Szent Gellért tér"],
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

const LEGACY_PROVIDER_ID_ALIASES = {
  "prov-budapest-park-obuda": "prov-budapest-park-ferencvaros",
  "prov-mvm-dome-ujbuda": "prov-mvm-dome-terezvaros",
  "prov-cov-island-cafe-obuda": "prov-cov-island-cafe-ferencvaros",
  "prov-cov-park-party-obuda": "prov-cov-park-party-ferencvaros",
  "prov-cov-rudas-ujbuda-party": "prov-cov-rudas-buda-party",
};

/** Verified overrides — official address + district (do not guess from postal alone). */
const CANONICAL_BY_ID = {
  "prov-mvm-dome-terezvaros": {
    borough: "Terézváros",
    neighborhood: "Stefánia út",
    address: "1143 Budapest, Stefánia út 2, Hungary",
  },
  "prov-budapest-park-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-cov-island-cafe-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-cov-park-party-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-a38-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Petőfi Bridge",
    address: "1117 Budapest, Petőfi rakpart, Buda bridge foot, Hungary",
  },
  "prov-mupa-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Műegyetem",
    address: "1095 Budapest, Komor Marcell utca 1, Hungary",
  },
  "prov-cov-bartok-moricz": {
    borough: "Ferencváros",
    neighborhood: "Műegyetem",
    address: "1095 Budapest, Komor Marcell utca 1, Hungary",
  },
  "prov-mng-castle-buda": {
    borough: "Buda",
    neighborhood: "Castle District",
    address: "1014 Budapest, Szent György tér 2, Hungary",
  },
  "prov-rudas-buda": {
    borough: "Buda",
    neighborhood: "Tabán",
    address: "1013 Budapest, Döbrentei tér 9, Hungary",
  },
  "prov-cov-varfok-taban": {
    borough: "Buda",
    neighborhood: "Tabán",
    address: "1013 Budapest, Varfok utca 1, Hungary",
  },
  "prov-cov-citadella-gellert": {
    borough: "Buda",
    neighborhood: "Gellért Hill",
    address: "1118 Budapest, Citadella sétány, Hungary",
  },
  "prov-cov-gellert-spa-events": {
    borough: "Buda",
    neighborhood: "Szent Gellért tér",
    address: "1114 Budapest, Szent Gellért tér 2, Hungary",
  },
};

const STREET_HINTS = [
  { pattern: /fábián juli/i, borough: "Ferencváros", neighborhood: "Fábián Juli" },
  { pattern: /stefánia|stefania/i, borough: "Terézváros", neighborhood: "Stefánia út" },
  { pattern: /andrássy|andrassy/i, borough: "Terézváros", neighborhood: "Andrássy út" },
  { pattern: /kazinczy/i, borough: "Erzsébetváros", neighborhood: "Kazinczy utca" },
  { pattern: /gozsdu/i, borough: "Erzsébetváros", neighborhood: "Gozsdu Udvar" },
  { pattern: /petőfi rakpart|petofi rakpart/i, borough: "Ferencváros", neighborhood: "Petőfi Bridge" },
  { pattern: /komor marcell|müpa|mupa/i, borough: "Ferencváros", neighborhood: "Műegyetem" },
  { pattern: /szent györgy|castle|budai vár/i, borough: "Buda", neighborhood: "Castle District" },
  { pattern: /döbrentei|varfok|tabán/i, borough: "Buda", neighborhood: "Tabán" },
  { pattern: /citadella|gellért|gellert/i, borough: "Buda", neighborhood: "Gellért Hill" },
  { pattern: /hajógyári|óbuda-sziget/i, borough: "Óbuda", neighborhood: "Óbuda Island" },
];

function inferFromStreet(address) {
  for (const h of STREET_HINTS) {
    if (h.pattern.test(address)) return { borough: h.borough, neighborhood: h.neighborhood };
  }
  return null;
}

function suggestProviderLocation(provider) {
  const id = provider.id;
  const address = (provider.address || "").trim();

  if (CANONICAL_BY_ID[id]) {
    const c = CANONICAL_BY_ID[id];
    if (
      c.borough !== provider.borough ||
      c.neighborhood !== provider.neighborhood ||
      c.address !== address
    ) {
      return { ...c, reason: "canonical" };
    }
    return null;
  }

  const streetHint = address ? inferFromStreet(address) : null;
  if (
    streetHint &&
    (streetHint.borough !== provider.borough || streetHint.neighborhood !== provider.neighborhood)
  ) {
    return { borough: streetHint.borough, neighborhood: streetHint.neighborhood, address, reason: "street" };
  }

  return null;
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
  return {
    ...event,
    borough: host.borough,
    neighborhood: host.neighborhood,
  };
}

/** Copy that must not appear on canonical venues (false district names). */
const FORBIDDEN_DISTRICT_COPY = {
  "prov-mvm-dome-terezvaros": [/\bÚjbuda\b/i, /\bUjbuda\b/i, /\bKelenföld\b/i, /\bInfopark\b/i],
  "prov-budapest-park-ferencvaros": [/\bHajógyári-sziget\b/i, /\bÓbuda-sziget\b/i, /\bObuda Island\b/i],
  "prov-cov-island-cafe-ferencvaros": [/\bHajógyári-sziget\b/i, /\bÓbuda-sziget\b/i, /\bObuda Island\b/i],
  "prov-cov-park-party-ferencvaros": [/\bHajógyári-sziget\b/i, /\bÓbuda-sziget\b/i, /\bObuda Island\b/i],
  "prov-cov-rudas-buda-party": [/\bÚjbuda\b/i, /\bUjbuda\b/i, /\bKelenföld\b/i],
};

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

function validateCanonicalProvider(doc, pathPrefix) {
  const errors = [];
  if (LEGACY_PROVIDER_ID_ALIASES[doc.id]) {
    errors.push(
      `${pathPrefix}: id ${doc.id} is retired — use ${LEGACY_PROVIDER_ID_ALIASES[doc.id]} instead`,
    );
    return errors;
  }
  const canonicalId = doc.id;
  const canonical = CANONICAL_BY_ID[canonicalId];
  if (!canonical) return errors;

  if (doc.borough && doc.borough !== canonical.borough) {
    errors.push(
      `${pathPrefix}: borough must be ${canonical.borough} for ${doc.id} (official address — id suffix is legacy, not the district)`,
    );
  }
  if (doc.neighborhood && doc.neighborhood !== canonical.neighborhood) {
    errors.push(`${pathPrefix}: neighborhood must be ${canonical.neighborhood} for ${doc.id}`);
  }
  if (doc.address && doc.address.trim() && doc.address !== canonical.address) {
    errors.push(`${pathPrefix}: address must be ${canonical.address} for ${doc.id}`);
  }

  const forbidden = FORBIDDEN_DISTRICT_COPY[canonicalId];
  if (forbidden) {
    for (const text of collectProviderTextFields(doc)) {
      for (const pattern of forbidden) {
        if (pattern.test(text)) {
          errors.push(
            `${pathPrefix}: description mentions a wrong district for ${doc.id} — use ${canonical.borough}, ${canonical.address}`,
          );
          break;
        }
      }
    }
  }

  if (canonicalId === "prov-mvm-dome-terezvaros" && doc.website && !/^https:\/\/(www\.)?mvm-dome\.hu/i.test(doc.website)) {
    errors.push(`${pathPrefix}: website should be https://mvm-dome.hu (promoter pages go on events, not the venue row)`);
  }
  if (canonicalId === "prov-budapest-park-ferencvaros" && doc.website && !/^https:\/\/(www\.)?budapestpark\.hu/i.test(doc.website)) {
    errors.push(`${pathPrefix}: website should be https://www.budapestpark.hu/... for Budapest Park`);
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
  if (!canonical) return errors;

  if (doc.borough && doc.borough !== canonical.borough) {
    errors.push(
      `${pathPrefix}: borough must be ${canonical.borough} for host ${hostId} (1095 Fábián Juli = Ferencváros; 1143 Stefánia = Terézváros — not Óbuda/Újbuda)`,
    );
  }
  if (doc.neighborhood && doc.neighborhood !== canonical.neighborhood) {
    errors.push(`${pathPrefix}: neighborhood must be ${canonical.neighborhood} for host ${hostId}`);
  }

  const live = providersById?.get(hostId);
  if (live) {
    if (live.borough !== canonical.borough) {
      errors.push(
        `${pathPrefix}: host ${hostId} in live catalog has borough ${live.borough} but must be ${canonical.borough} — patch provider before ingesting events`,
      );
    }
    for (const pattern of FORBIDDEN_DISTRICT_COPY[hostId] || []) {
      const text = [live.longDescription, live.shortDescription].filter(Boolean).join("\n");
      if (pattern.test(text)) {
        errors.push(
          `${pathPrefix}: host ${hostId} still has wrong-district copy in catalog — run location fix payload before events`,
        );
        break;
      }
    }
  }

  return errors;
}

module.exports = {
  BOROUGHS,
  NEIGHBORHOODS,
  LEGACY_PROVIDER_ID_ALIASES,
  CANONICAL_BY_ID,
  suggestProviderLocation,
  locationNeedsFix,
  applyLocationToProvider,
  syncEventFromHost,
  validateCanonicalProvider,
  validateCanonicalEvent,
};
