import { getTourTemplate, type TourTemplate } from "@/data/tourTemplates";
import type { Provider } from "@/types/provider";
import { flattenProviderMenu } from "@/lib/menu/flattenMenuItems";

export type TourStop = {
  provider: Provider;
  highlightItems: { name: string; priceLabel?: string }[];
};

export type GeneratedTour = {
  template: TourTemplate;
  seed: string;
  stops: TourStop[];
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function providerMatchesTemplate(provider: Provider, template: TourTemplate): boolean {
  if (!template.categories.includes(provider.category)) return false;
  const tags = new Set(provider.menuTags ?? []);
  if (tags.size === 0) return false;
  if (template.matchMode === "all") {
    return template.requiredTags.every((t) => tags.has(t));
  }
  return template.requiredTags.some((t) => tags.has(t));
}

function highlightForProvider(provider: Provider, template: TourTemplate) {
  const flat = flattenProviderMenu(provider);
  const tagSet = new Set(template.requiredTags);
  const matched = flat.filter((row) => row.item.tags.some((t) => tagSet.has(t as (typeof template.requiredTags)[number])));
  const pick = (matched.length ? matched : flat).slice(0, 3);
  return pick.map((row) => ({
    name: row.item.name,
    priceLabel: row.item.price
      ? `${row.item.price.amount} ${row.item.price.currency}${row.item.price.unit ? ` / ${row.item.price.unit}` : ""}`
      : undefined,
  }));
}

export function generateTour(
  providers: Provider[],
  tourId: string,
  seed: string,
): GeneratedTour | { error: string } {
  const template = getTourTemplate(tourId);
  if (!template) return { error: "unknown_tour" };

  const eligible = providers.filter((p) => providerMatchesTemplate(p, template));
  if (eligible.length < template.stopCount) {
    return { error: "not_enough_venues" };
  }

  const rng = mulberry32(hashSeed(seed || tourId));
  const pool = [...eligible];
  const stops: TourStop[] = [];
  const usedBoroughs = new Set<string>();

  while (stops.length < template.stopCount && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    const [provider] = pool.splice(idx, 1);
    if (!provider) break;
    // Prefer variety across districts when possible
    if (stops.length < template.stopCount - 1 && usedBoroughs.has(provider.borough) && pool.length > 1) {
      const alt = pool.find((p) => !usedBoroughs.has(p.borough));
      if (alt) {
        pool.push(provider);
        const altIdx = pool.indexOf(alt);
        pool.splice(altIdx, 1);
        usedBoroughs.add(alt.borough);
        stops.push({
          provider: alt,
          highlightItems: highlightForProvider(alt, template),
        });
        continue;
      }
    }
    usedBoroughs.add(provider.borough);
    stops.push({
      provider,
      highlightItems: highlightForProvider(provider, template),
    });
  }

  if (stops.length < template.stopCount) return { error: "not_enough_venues" };

  return { template, seed: seed || tourId, stops };
}
