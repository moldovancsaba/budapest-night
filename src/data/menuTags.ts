/** Canonical menu tags for search, tours, and curator mapping. */

export const MENU_TAGS = [
  "palinka",
  "wine",
  "beer",
  "craft-beer",
  "cocktail",
  "coffee",
  "specialty-coffee",
  "goulash",
  "hungarian",
  "street-food",
  "dessert",
  "vegan",
  "vegetarian",
  "ruin-bar",
  "rooftop",
  "danube-view",
] as const;

export type MenuTag = (typeof MENU_TAGS)[number];

const MENU_TAG_SET = new Set<string>(MENU_TAGS);

export function isMenuTag(value: string): value is MenuTag {
  return MENU_TAG_SET.has(value);
}

/** i18n key under `menuTag.*` */
export function menuTagMessageKey(tag: string): string | undefined {
  return isMenuTag(tag) ? tag : undefined;
}
