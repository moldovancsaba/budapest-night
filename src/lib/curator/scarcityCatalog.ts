import type { Provider } from "@/types/provider";

export type ScarcityCell = { category: string; borough: string; count: number };

export function computeProviderScarcity(providers: Pick<Provider, "category" | "borough">[]) {
  const byCategory = new Map<string, number>();
  const byBorough = new Map<string, number>();
  const byCategoryBorough = new Map<string, number>();

  for (const p of providers) {
    const cat = p.category || "Unknown";
    const bor = p.borough || "Unknown";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + 1);
    byBorough.set(bor, (byBorough.get(bor) ?? 0) + 1);
    const key = `${cat}|${bor}`;
    byCategoryBorough.set(key, (byCategoryBorough.get(key) ?? 0) + 1);
  }

  return { byCategory, byBorough, byCategoryBorough };
}

export function findScarcestCategoryBorough(
  providers: Pick<Provider, "category" | "borough">[],
): ScarcityCell {
  const { byCategoryBorough } = computeProviderScarcity(providers);
  let best: ScarcityCell = { category: "Cafés", borough: "Óbuda", count: Number.POSITIVE_INFINITY };
  for (const [key, count] of byCategoryBorough) {
    if (count < best.count) {
      const [category, borough] = key.split("|");
      best = { category, borough, count };
    }
  }
  return best;
}

const SCARCITY_SEARCH_BY_SLICE: Record<string, string> = {
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

export function searchQueryForScarcestSlice(
  providers: Pick<Provider, "category" | "borough">[],
): { query: string; category: string; borough: string; count: number } {
  const { category, borough, count } = findScarcestCategoryBorough(providers);
  const key = `${category}|${borough}`;
  const query =
    SCARCITY_SEARCH_BY_SLICE[key] ?? `Budapest ${borough} ${category} official website`;
  return { query, category, borough, count };
}
