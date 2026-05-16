import type { Category } from "@/types/provider";
import type { MenuTag } from "@/data/menuTags";

export type TourMatchMode = "any" | "all";

export type TourTemplate = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  requiredTags: MenuTag[];
  matchMode: TourMatchMode;
  categories: Category[];
  stopCount: number;
};

export const TOUR_TEMPLATES: TourTemplate[] = [
  {
    id: "palinka",
    titleKey: "palinka.title",
    descriptionKey: "palinka.description",
    requiredTags: ["palinka"],
    matchMode: "any",
    categories: ["Restaurants", "Cafés", "Parties", "Venues"],
    stopCount: 3,
  },
  {
    id: "foodie",
    titleKey: "foodie.title",
    descriptionKey: "foodie.description",
    requiredTags: ["hungarian", "goulash", "street-food"],
    matchMode: "any",
    categories: ["Restaurants", "Cafés", "Venues"],
    stopCount: 3,
  },
  {
    id: "coffee",
    titleKey: "coffee.title",
    descriptionKey: "coffee.description",
    requiredTags: ["coffee", "specialty-coffee"],
    matchMode: "any",
    categories: ["Cafés"],
    stopCount: 3,
  },
];

export function getTourTemplate(id: string): TourTemplate | undefined {
  return TOUR_TEMPLATES.find((t) => t.id === id);
}
