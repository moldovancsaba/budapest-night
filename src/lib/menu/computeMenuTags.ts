import type { EventOffering, MenuItem, VenueMenu } from "@/types/menu";
import { isMenuTag } from "@/data/menuTags";

function collectFromItems(items: MenuItem[], out: Set<string>) {
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      if (isMenuTag(tag)) out.add(tag);
    }
  }
}

export function computeMenuTagsFromMenu(menu?: VenueMenu | null, eventOfferings?: EventOffering[] | null): string[] {
  const tags = new Set<string>();
  if (menu?.sections) {
    for (const sec of menu.sections) {
      collectFromItems(sec.items ?? [], tags);
    }
  }
  if (eventOfferings) {
    for (const ev of eventOfferings) {
      collectFromItems(ev.items ?? [], tags);
    }
  }
  return [...tags].sort();
}
