import type { Borough, Category } from "@/types/provider";

/** Denormalized venue snapshot for menus, events, and public APIs. */
export type VenueLink = {
  id: string;
  name: string;
  category: Category;
  borough: Borough;
  neighborhood: string;
  address: string;
  website?: string;
  menuUrl?: string;
};
