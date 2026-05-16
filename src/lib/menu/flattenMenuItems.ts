import { resolveMenuItemForLocale, resolveMenuSectionForLocale } from "@/lib/menu/resolveMenuLocale";
import { resolveMenuVenueLink } from "@/lib/menu/menuVenueLink";
import type { AppLocale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import type { Provider } from "@/types/provider";
import { isDrinkMenuTag, isFoodMenuTag, menuTagMatchesItemKind } from "@/data/menuTags";
import type { MenuItem, MenuItemKind, MenuSectionKind } from "@/types/menu";
import type { VenueLink } from "@/types/venueLink";

export type FlatMenuItem = {
  item: MenuItem;
  providerId: string;
  providerName: string;
  category: Provider["category"];
  borough: Provider["borough"];
  neighborhood: string;
  address: string;
  venue: VenueLink;
  sectionTitle: string;
  sectionKind: MenuSectionKind;
  source: "venue" | "event";
  eventTitle?: string;
};

const DRINK_KIND: MenuItemKind = "drink";
const FOOD_KIND: MenuItemKind = "food";

/** When legacy rows omit item.kind, infer from tags (never from venue-vibe tags). */
export function inferMenuItemKind(item: MenuItem): MenuItemKind {
  if (item.kind === "food" || item.kind === "drink" || item.kind === "other") {
    return item.kind;
  }
  const tags = item.tags ?? [];
  const hasDrink = tags.some((t) => isDrinkMenuTag(t));
  const hasFood = tags.some((t) => isFoodMenuTag(t));
  if (hasDrink && !hasFood) return DRINK_KIND;
  if (hasFood && !hasDrink) return FOOD_KIND;
  if (hasDrink) return DRINK_KIND;
  if (hasFood) return FOOD_KIND;
  return "other";
}

function effectiveItemKind(row: FlatMenuItem): MenuItemKind {
  const fromItem = row.item.kind;
  if (fromItem === "food" || fromItem === "drink") return fromItem;
  if (fromItem === "other") return "other";
  const inferred = inferMenuItemKind(row.item);
  if (inferred !== "other") return inferred;
  if (row.sectionKind === "food" || row.sectionKind === "drink") return row.sectionKind;
  return inferred;
}

function slugId(prefix: string, name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${prefix}-${base || "item"}`;
}

export function flattenProviderMenu(
  provider: Provider,
  locale: AppLocale = defaultLocale,
): FlatMenuItem[] {
  const out: FlatMenuItem[] = [];
  const venue = resolveMenuVenueLink(provider);
  const menu = provider.menu;
  if (menu?.sections) {
    for (const sec of menu.sections) {
      const resolvedSec = resolveMenuSectionForLocale(sec, locale);
      for (const raw of sec.items ?? []) {
        const base: MenuItem = {
          ...raw,
          id: raw.id || slugId("item", raw.name),
          tags: raw.tags ?? [],
        };
        const item = resolveMenuItemForLocale(base, locale);
        out.push({
          item,
          providerId: provider.id,
          providerName: provider.name,
          category: venue.category,
          borough: venue.borough,
          neighborhood: venue.neighborhood,
          address: venue.address,
          venue,
          sectionTitle: resolvedSec.title,
          sectionKind: sec.kind ?? "mixed",
          source: "venue",
        });
      }
    }
  }
  for (const ev of provider.eventOfferings ?? []) {
    for (const raw of ev.items ?? []) {
      const base: MenuItem = {
        ...raw,
        id: raw.id || slugId(ev.id, raw.name),
        tags: raw.tags ?? [],
      };
      const item = resolveMenuItemForLocale(base, locale);
      out.push({
        item,
        providerId: provider.id,
        providerName: provider.name,
        category: venue.category,
        borough: venue.borough,
        neighborhood: venue.neighborhood,
        address: venue.address,
        venue,
        sectionTitle: ev.title,
        sectionKind: "mixed",
        source: "event",
        eventTitle: ev.title,
      });
    }
  }
  return out;
}

export function filterFlatMenuItems(
  items: FlatMenuItem[],
  opts: {
    tag?: string | null;
    q?: string | null;
    kind?: MenuItemKind | null;
    categories?: Provider["category"][] | null;
    borough?: Provider["borough"] | "All" | null;
  },
): FlatMenuItem[] {
  let list = items;
  if (opts.tag) {
    const tag = opts.tag;
    list = list.filter((row) => {
      if (!row.item.tags.includes(tag)) return false;
      return menuTagMatchesItemKind(tag, effectiveItemKind(row));
    });
  }
  if (opts.kind) {
    list = list.filter((row) => effectiveItemKind(row) === opts.kind);
  }
  if (opts.categories?.length) {
    const set = new Set(opts.categories);
    list = list.filter((row) => set.has(row.category));
  }
  if (opts.borough && opts.borough !== "All") {
    list = list.filter((row) => row.borough === opts.borough);
  }
  const q = opts.q?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (row) =>
        row.item.name.toLowerCase().includes(q) ||
        row.providerName.toLowerCase().includes(q) ||
        row.sectionTitle.toLowerCase().includes(q) ||
        row.address.toLowerCase().includes(q) ||
        row.venue.category.toLowerCase().includes(q),
    );
  }
  return list;
}
