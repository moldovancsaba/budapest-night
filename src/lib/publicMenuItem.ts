import type { MenuItemKind } from "@/types/menu";
import type { MenuPrice } from "@/types/menu";
import type { VenueLink } from "@/types/venueLink";
import { inferMenuItemKind, type FlatMenuItem } from "@/lib/menu/flattenMenuItems";

/** Menu board row from GET /api/public/menu-items. */
export type PublicMenuItemRow = {
  id: string;
  name: string;
  kind: MenuItemKind;
  tags: string[];
  price: MenuPrice | null;
  providerId: string;
  providerName: string;
  category: VenueLink["category"];
  borough: VenueLink["borough"];
  neighborhood: string;
  address: string;
  venue: VenueLink;
  sectionTitle: string;
  source: "venue" | "event";
  eventTitle: string | null;
  venueResolved: boolean;
};

export function toPublicMenuItemRow(row: FlatMenuItem): PublicMenuItemRow {
  return {
    id: `${row.providerId}:${row.item.id}`,
    name: row.item.name,
    kind: row.item.kind === "food" || row.item.kind === "drink" ? row.item.kind : inferMenuItemKind(row.item),
    tags: row.item.tags,
    price: row.item.price ?? null,
    providerId: row.providerId,
    providerName: row.providerName,
    category: row.venue.category,
    borough: row.venue.borough,
    neighborhood: row.venue.neighborhood,
    address: row.venue.address,
    venue: row.venue,
    sectionTitle: row.sectionTitle,
    source: row.source,
    eventTitle: row.eventTitle ?? null,
    venueResolved: row.venue.id === row.providerId,
  };
}
