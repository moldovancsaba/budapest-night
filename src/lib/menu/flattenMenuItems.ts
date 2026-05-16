import type { Provider } from "@/types/provider";
import type { MenuItem, MenuItemKind } from "@/types/menu";

export type FlatMenuItem = {
  item: MenuItem;
  providerId: string;
  providerName: string;
  category: Provider["category"];
  borough: Provider["borough"];
  neighborhood: string;
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

export function flattenProviderMenu(provider: Provider): FlatMenuItem[] {
  const out: FlatMenuItem[] = [];
  const menu = provider.menu;
  if (menu?.sections) {
    for (const sec of menu.sections) {
      for (const raw of sec.items ?? []) {
        const item: MenuItem = {
          ...raw,
          id: raw.id || slugId("item", raw.name),
          tags: raw.tags ?? [],
        };
        out.push({
          item,
          providerId: provider.id,
          providerName: provider.name,
          category: provider.category,
          borough: provider.borough,
          neighborhood: provider.neighborhood,
          sectionTitle: sec.title,
          source: "venue",
        });
      }
    }
  }
  for (const ev of provider.eventOfferings ?? []) {
    for (const raw of ev.items ?? []) {
      const item: MenuItem = {
        ...raw,
        id: raw.id || slugId(ev.id, raw.name),
        tags: raw.tags ?? [],
      };
      out.push({
        item,
        providerId: provider.id,
        providerName: provider.name,
        category: provider.category,
        borough: provider.borough,
        neighborhood: provider.neighborhood,
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
        row.sectionTitle.toLowerCase().includes(q),
    );
  }
  return list;
}
