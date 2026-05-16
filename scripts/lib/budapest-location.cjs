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

/** Verified overrides — official address + district (do not guess from postal alone). */
const CANONICAL_BY_ID = {
  "prov-mvm-dome-ujbuda": {
    borough: "Terézváros",
    neighborhood: "Stefánia út",
    address: "1143 Budapest, Stefánia út 2, Hungary",
  },
  "prov-budapest-park-obuda": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-cov-island-cafe-obuda": {
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

module.exports = {
  BOROUGHS,
  NEIGHBORHOODS,
  CANONICAL_BY_ID,
  suggestProviderLocation,
  locationNeedsFix,
  applyLocationToProvider,
  syncEventFromHost,
};
