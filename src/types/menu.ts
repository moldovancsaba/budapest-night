import type { VenueLink } from "@/types/venueLink";

/** Eat & drink menu model — attached to providers in Mongo. */

export type MenuItemKind = "food" | "drink" | "other";
export type MenuSectionKind = "food" | "drink" | "mixed";
export type MenuPriceSource = "published" | "estimated";
export type MenuCurrency = "HUF" | "EUR";
export type MenuPriceUnit = "each" | "glass" | "bottle" | "portion" | "ticket";

export type MenuPrice = {
  amount: number;
  currency: MenuCurrency;
  unit?: MenuPriceUnit;
  source: MenuPriceSource;
};

export type MenuItem = {
  id: string;
  kind: MenuItemKind;
  name: string;
  description?: string;
  price?: MenuPrice;
  tags: string[];
  dietary?: ("vegan" | "vegetarian" | "gluten-free")[];
  available?: boolean;
};

export type MenuSection = {
  id: string;
  title: string;
  kind: MenuSectionKind;
  items: MenuItem[];
};

export type VenueMenu = {
  menuUrl?: string;
  sourceUrls: string[];
  lastVerifiedAt: string;
  sections: MenuSection[];
  /** Host venue snapshot — set on ingest from the provider row (do not author manually). */
  venueLink?: VenueLink;
};

export type EventOffering = {
  id: string;
  title: string;
  startsAt?: string;
  endsAt?: string;
  items: MenuItem[];
};
