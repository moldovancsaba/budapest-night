/**
 * Scarcity documentation required on cursor-curated listing payloads.
 */

const SCARCITY_KEYWORD =
  /(scarcit|catalog count|gap|fewest|sparsest|slice|borough|district|month|target|before ingest|underrepresented)/i;

function requiresScarcityNotes(operations) {
  return operations.some(
    (op) =>
      op &&
      op.action === "upsert" &&
      (op.resource === "provider" || op.resource === "event" || op.resource === "meetupGroup"),
  );
}

function isCuratedListingPayload(payloadPath) {
  const base = String(payloadPath || "")
    .split(/[/\\]/)
    .pop();
  if (!base) return false;
  if (/^patch-/i.test(base)) return false;
  if (/^fix-/i.test(base)) return false;
  if (/^migrate-/i.test(base)) return false;
  if (/^coverage-/i.test(base)) return false;
  if (/^seed-/i.test(base)) return false;
  return /cursor-curated/i.test(base);
}

function validateScarcityNotes(notes, payloadPath, operations) {
  if (!requiresScarcityNotes(operations)) return [];
  if (!isCuratedListingPayload(payloadPath)) return [];

  const errors = [];
  const n = String(notes || "").trim();
  if (n.length < 24) {
    errors.push(
      'payload notes: required for cursor-curated listing files — document catalog counts before ingest and which gap you fill (e.g. "providers 145; Cafés in Óbuda 3; gap: Újbuda neighborhood X")',
    );
    return errors;
  }
  if (!/\d/.test(n)) {
    errors.push(
      "payload notes: must include numeric catalog counts (e.g. events per month, providers per borough/category)",
    );
  }
  if (!SCARCITY_KEYWORD.test(n)) {
    errors.push(
      'payload notes: must name the scarcity target (use words like scarcity, gap, borough, district, month, catalog, slice, or target)',
    );
  }
  return errors;
}

/** Count providers by category and borough for discovery / reporting. */
function computeProviderScarcity(providers) {
  const byCategory = new Map();
  const byBorough = new Map();
  const byCategoryBorough = new Map();

  for (const p of providers) {
    const cat = p.category || "Unknown";
    const bor = p.borough || "Unknown";
    byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
    byBorough.set(bor, (byBorough.get(bor) || 0) + 1);
    const key = `${cat}|${bor}`;
    byCategoryBorough.set(key, (byCategoryBorough.get(key) || 0) + 1);
  }

  return { byCategory, byBorough, byCategoryBorough };
}

function findScarcestCategoryBorough(providers) {
  const { byCategoryBorough } = computeProviderScarcity(providers);
  let best = { category: "Cafés", borough: "Óbuda", count: Infinity };
  for (const [key, count] of byCategoryBorough) {
    if (count < best.count) {
      const [category, borough] = key.split("|");
      best = { category, borough, count };
    }
  }
  return best;
}

const SCARCITY_SEARCH_BY_SLICE = {
  "Cafés|Óbuda": "Budapest Óbuda café official site",
  "Cafés|Újbuda": "Budapest Újbuda specialty coffee official",
  "Restaurants|Óbuda": "Budapest Óbuda restaurant official reservation",
  "Restaurants|Újbuda": "Budapest Újbuda restaurant official menu",
  "Venues|Óbuda": "Budapest Óbuda cultural venue official",
  "Venues|Újbuda": "Budapest Újbuda concert hall gallery official",
  "Parties|Óbuda": "Budapest Óbuda bar club official",
  "Parties|Újbuda": "Budapest Újbuda nightlife bar official",
  "Cafés|Buda": "Budapest Buda hills café official",
  "Restaurants|Buda": "Budapest Buda restaurant official",
  "Venues|Terézváros": "Budapest Terézváros theatre venue official",
  "Venues|Ferencváros": "Budapest Ferencváros concert venue official",
};

function searchQueryForScarcestSlice(providers) {
  const { category, borough } = findScarcestCategoryBorough(providers);
  const key = `${category}|${borough}`;
  if (SCARCITY_SEARCH_BY_SLICE[key]) return { query: SCARCITY_SEARCH_BY_SLICE[key], category, borough };
  return {
    query: `Budapest ${borough} ${category} official website`,
    category,
    borough,
  };
}

module.exports = {
  validateScarcityNotes,
  requiresScarcityNotes,
  isCuratedListingPayload,
  computeProviderScarcity,
  findScarcestCategoryBorough,
  searchQueryForScarcestSlice,
};
