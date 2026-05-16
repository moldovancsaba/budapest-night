import { resolveMenuItemForLocale, resolveMenuSectionForLocale } from "@/lib/menu/resolveMenuLocale";
import { resolveMenuVenueLink } from "@/lib/menu/menuVenueLink";
import type { AppLocale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import type { Provider } from "@/types/provider";
import type { MenuItem, MenuItemKind } from "@/types/menu";
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
  source: "venue" | "event";
  eventTitle?: string;
};

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
    list = list.filter((row) => row.item.tags.includes(opts.tag!));
  }
  if (opts.kind) {
    list = list.filter((row) => row.item.kind === opts.kind);
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
