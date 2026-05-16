/** Canonical menu tags for search, tours, and curator mapping. */

/** Drinks — show when browse filter is Drink or All. */
export const MENU_TAGS_DRINK = [
  "palinka",
  "wine",
  "beer",
  "craft-beer",
  "cocktail",
  "coffee",
  "specialty-coffee",
] as const;

/** Food — show when browse filter is Food or All. */
export const MENU_TAGS_FOOD = [
  "goulash",
  "hungarian",
  "street-food",
  "dessert",
  "vegan",
  "vegetarian",
] as const;

/**
 * Venue / vibe tags (ruin bar, rooftop, Danube view).
 * Valid on provider `menuTags` / discovery — not shown on Eat & Drink menu-board chips.
 */
export const MENU_TAGS_VENUE = ["ruin-bar", "rooftop", "danube-view"] as const;

/** All tags accepted on menu items at ingest. */
export const MENU_TAGS = [
  ...MENU_TAGS_DRINK,
  ...MENU_TAGS_FOOD,
  ...MENU_TAGS_VENUE,
] as const;

export type MenuTag = (typeof MENU_TAGS)[number];
export type MenuTagDrink = (typeof MENU_TAGS_DRINK)[number];
export type MenuTagFood = (typeof MENU_TAGS_FOOD)[number];

const MENU_TAG_SET = new Set<string>(MENU_TAGS);
const DRINK_TAG_SET = new Set<string>(MENU_TAGS_DRINK);
const FOOD_TAG_SET = new Set<string>(MENU_TAGS_FOOD);

export function isMenuTag(value: string): value is MenuTag {
  return MENU_TAG_SET.has(value);
}

export function isDrinkMenuTag(value: string): value is MenuTagDrink {
  return DRINK_TAG_SET.has(value);
}

export function isFoodMenuTag(value: string): value is MenuTagFood {
  return FOOD_TAG_SET.has(value);
}

/** Tags for the menu-board chip row — excludes venue/vibe tags. */
export function menuBoardTagsForKind(kind: "food" | "drink" | null): readonly MenuTag[] {
  if (kind === "food") return MENU_TAGS_FOOD;
  if (kind === "drink") return MENU_TAGS_DRINK;
  return [...MENU_TAGS_FOOD, ...MENU_TAGS_DRINK];
}

/** i18n key under `menuTag.*` */
export function menuTagMessageKey(tag: string): string | undefined {
  return isMenuTag(tag) ? tag : undefined;
}
