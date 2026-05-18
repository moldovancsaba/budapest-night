import { ACTIVITY_TYPES } from "@/data/catalogFilters";

/** Canonical activity tag → `activityType.*` message key. */
export const ACTIVITY_TYPE_KEY: Record<string, string> = {
  "Live Music": "liveMusic",
  "DJ Sets": "djSets",
  Rooftop: "rooftop",
  "Ruin Bar": "ruinBar",
  "Fine Dining": "fineDining",
  "Street Food": "streetFood",
  "Wine Bar": "wineBar",
  "Craft Beer": "craftBeer",
  "Coffee & Brunch": "coffeeBrunch",
  Gallery: "gallery",
  Theatre: "theatre",
  Cinema: "cinema",
  Exhibition: "exhibition",
  "Family Program": "familyProgram",
  Festival: "festival",
  "Boat Party": "boatParty",
  "Thermal Bath": "thermalBath",
  Jazz: "jazz",
  Electronic: "electronic",
  Cocktails: "cocktails",
  "Late Kitchen": "lateKitchen",
};

export function activityTypeMessageKey(canonical: string): string | undefined {
  return ACTIVITY_TYPE_KEY[canonical];
}

export const ALL_ACTIVITY_TYPES = ACTIVITY_TYPES;
