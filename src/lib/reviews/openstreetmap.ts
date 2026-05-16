/**
 * OpenStreetMap — free, open-data venue lookup (ODbL).
 * Nominatim search + Overpass tags; optional Wikidata P444 review score.
 *
 * @see https://operations.osmfoundation.org/policies/nominatim/
 * @see https://wiki.openstreetmap.org/wiki/Overpass_API
 */

export type OsmPlaceSnapshot = {
  osmPlaceRef: string;
  osmType: "node" | "way" | "relation";
  osmId: number;
  rating: number;
  reviewCount: number;
  profileUrl: string;
  displayName?: string;
  wikidataId?: string;
};

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function osmUserAgent(): string {
  const email = process.env.OSM_CONTACT_EMAIL?.trim();
  const base = "BudapestNight/1.0 (+https://budapest-night.vercel.app)";
  return email ? `${base}; contact=${email}` : base;
}

function nominatimParams(query: string): URLSearchParams {
  const p = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "hu",
    addressdetails: "0",
  });
  const email = process.env.OSM_CONTACT_EMAIL?.trim();
  if (email) p.set("email", email);
  return p;
}

export function buildOsmSearchQuery(name: string, address: string): string {
  const parts = [name.trim(), address.trim()].filter(Boolean);
  const q = parts.join(", ");
  return q.toLowerCase().includes("budapest") ? q : `${q}, Budapest, Hungary`;
}

export function osmProfileUrl(type: string, id: number): string {
  const t = type === "node" || type === "way" || type === "relation" ? type : "node";
  return `https://www.openstreetmap.org/${t}/${id}`;
}

export function parseOsmPlaceRef(ref: string): { type: "node" | "way" | "relation"; id: number } | null {
  const m = ref.trim().match(/^(node|way|relation)\/(\d+)$/i);
  if (!m) return null;
  return { type: m[1].toLowerCase() as "node" | "way" | "relation", id: Number(m[2]) };
}

/** Parse voluntary OSM tags when mappers publish scores (no Google imports). */
export function ratingFromOsmTags(tags: Record<string, string>): {
  rating: number;
  reviewCount: number;
} {
  let rating = 0;
  let reviewCount = 0;

  const stars = tags.stars ?? tags["stars:hotel"];
  if (stars) {
    const n = Number.parseFloat(stars);
    if (n >= 1 && n <= 5) rating = Math.round(n * 10) / 10;
  }

  const rawRating = tags.rating ?? tags["aggregate:rated"];
  if (rawRating && rating === 0) {
    const n = Number.parseFloat(rawRating);
    if (n >= 1 && n <= 5) rating = Math.round(n * 10) / 10;
    else if (n > 5 && n <= 10) rating = Math.round((n / 2) * 10) / 10;
  }

  const countRaw = tags["review:count"] ?? tags.reviews ?? tags["rating:count"];
  if (countRaw) {
    const c = Number.parseInt(countRaw, 10);
    if (c >= 1 && c <= 1_000_000) reviewCount = c;
  }

  return { rating, reviewCount };
}

/** Wikidata claim P444 (review score), when present. */
export async function wikidataReviewScore(
  qid: string,
): Promise<{ rating: number; reviewCount: number }> {
  const id = qid.startsWith("Q") ? qid : `Q${qid}`;
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(id)}&props=claims&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": osmUserAgent() } });
  if (!res.ok) return { rating: 0, reviewCount: 0 };
  const json = (await res.json()) as {
    entities?: Record<string, { claims?: Record<string, { mainsnak?: { datavalue?: { value?: unknown } } }[]> }>;
  };
  const claims = json.entities?.[id]?.claims;
  const p444 = claims?.P444?.[0]?.mainsnak?.datavalue?.value;
  let rating = 0;
  if (typeof p444 === "number" && p444 >= 1 && p444 <= 5) rating = p444;
  return { rating, reviewCount: 0 };
}

type NominatimHit = {
  osm_type?: string;
  osm_id?: number;
  display_name?: string;
  name?: string;
};

function hitToRef(hit: NominatimHit): OsmPlaceSnapshot | null {
  const type = hit.osm_type;
  const id = hit.osm_id;
  if (!type || typeof id !== "number") return null;
  if (type !== "node" && type !== "way" && type !== "relation") return null;
  return {
    osmPlaceRef: `${type}/${id}`,
    osmType: type,
    osmId: id,
    rating: 0,
    reviewCount: 0,
    profileUrl: osmProfileUrl(type, id),
    displayName: hit.display_name ?? hit.name,
  };
}

export async function searchOsmPlace(query: string): Promise<OsmPlaceSnapshot | null> {
  const res = await fetch(`${NOMINATIM}?${nominatimParams(query)}`, {
    headers: { "User-Agent": osmUserAgent(), Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Nominatim ${res.status}: ${body.slice(0, 300)}`);
  }
  const hits = (await res.json()) as NominatimHit[];
  return hits[0] ? hitToRef(hits[0]) : null;
}

async function overpassTags(
  type: "node" | "way" | "relation",
  id: number,
): Promise<Record<string, string>> {
  const q = `[out:json][timeout:25];${type}(${id});out tags;`;
  let lastErr = "Overpass failed";
  for (const base of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(`${base}?data=${encodeURIComponent(q)}`, {
        headers: { "User-Agent": osmUserAgent(), Accept: "application/json" },
      });
      if (!res.ok) {
        lastErr = `Overpass ${res.status} at ${base}`;
        continue;
      }
      const json = (await res.json()) as {
        elements?: { tags?: Record<string, string> }[];
      };
      const tags = json.elements?.[0]?.tags;
      return tags ?? {};
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(lastErr);
}

export async function enrichOsmPlace(base: OsmPlaceSnapshot): Promise<OsmPlaceSnapshot> {
  const tags = await overpassTags(base.osmType, base.osmId);
  const fromTags = ratingFromOsmTags(tags);
  let rating = fromTags.rating;
  let reviewCount = fromTags.reviewCount;
  const wikidataId = tags.wikidata?.trim();

  if (wikidataId && rating === 0) {
    const wd = await wikidataReviewScore(wikidataId);
    rating = wd.rating;
    reviewCount = reviewCount || wd.reviewCount;
  }

  return {
    ...base,
    rating,
    reviewCount,
    wikidataId,
    displayName: tags.name ?? base.displayName,
  };
}

export async function fetchOsmPlaceByRef(ref: string): Promise<OsmPlaceSnapshot | null> {
  const parsed = parseOsmPlaceRef(ref);
  if (!parsed) return null;
  const base: OsmPlaceSnapshot = {
    osmPlaceRef: `${parsed.type}/${parsed.id}`,
    osmType: parsed.type,
    osmId: parsed.id,
    rating: 0,
    reviewCount: 0,
    profileUrl: osmProfileUrl(parsed.type, parsed.id),
  };
  return enrichOsmPlace(base);
}

export async function resolveOsmPlaceForVenue(
  name: string,
  address: string,
  existingRef?: string,
): Promise<OsmPlaceSnapshot | null> {
  if (existingRef?.trim()) {
    const byRef = await fetchOsmPlaceByRef(existingRef.trim());
    if (byRef) return byRef;
  }
  const query = buildOsmSearchQuery(name, address);
  const hit = await searchOsmPlace(query);
  if (!hit) return null;
  return enrichOsmPlace(hit);
}

export function isLikelyBudapestPlace(place: OsmPlaceSnapshot): boolean {
  const dn = (place.displayName ?? "").toLowerCase();
  return dn.includes("budapest") || dn.includes("magyarország") || dn.includes("hungary");
}
