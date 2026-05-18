/**
 * Verified contact + copy corrections applied before location resolution in fix-venue-locations.cjs.
 * Source URLs must be official venue sites.
 */
const FRICI_COPY = {
  shortDescription:
    "Classic Hungarian canteen on Király utca 55 — hearty lunch plates and daily specials near the Jewish Quarter.",
  longDescription:
    "Frici Papa at Király utca 55 serves generous Hungarian home cooking at wallet-friendly prices. Regulars come for schnitzel, soups, and daily chalkboard specials. Contact and hours on fricipapa.hu.\n\nSources: https://www.fricipapa.hu/",
};

const CONTACT_PATCHES = {
  "prov-cov-frici-jewish-q": {
    address: "1077 Budapest, Király utca 55, Hungary",
    borough: "Erzsébetváros",
    neighborhood: "Király utca",
    phone: "+36 1 351 0197",
    email: "fricipapa55@gmail.com",
    ...FRICI_COPY,
    locales: {
      en: {
        slug: "frici-papa-kiraly-utca",
        ...FRICI_COPY,
      },
    },
  },
};

function scrubWrongFriciCopy(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/\bKertész utca\b/gi, "Király utca")
    .replace(/\bKertész\b/gi, "Király")
    .replace(/\b1075\b/g, "1077");
}

function applyContactPatch(provider) {
  const patch = CONTACT_PATCHES[provider.id];
  if (!patch) return provider;

  const locales = { ...(provider.locales || {}) };
  for (const [lang, locPatch] of Object.entries(patch.locales || {})) {
    const prev = locales[lang] || {};
    locales[lang] = {
      ...prev,
      ...locPatch,
      shortDescription: scrubWrongFriciCopy(
        locPatch.shortDescription ?? prev.shortDescription ?? patch.shortDescription,
      ),
      longDescription: scrubWrongFriciCopy(
        locPatch.longDescription ?? prev.longDescription ?? patch.longDescription,
      ),
    };
  }
  for (const [lang, loc] of Object.entries(locales)) {
    if (!loc || typeof loc !== "object") continue;
    locales[lang] = {
      ...loc,
      shortDescription: scrubWrongFriciCopy(loc.shortDescription),
      longDescription: scrubWrongFriciCopy(loc.longDescription),
    };
  }

  const { locales: _locales, ...rest } = patch;
  return {
    ...provider,
    ...rest,
    shortDescription: scrubWrongFriciCopy(patch.shortDescription ?? provider.shortDescription),
    longDescription: scrubWrongFriciCopy(patch.longDescription ?? provider.longDescription),
    locales,
  };
}

module.exports = { CONTACT_PATCHES, applyContactPatch, scrubWrongFriciCopy };
