import type { Provider } from "@/types/provider";
import { computeMenuTagsFromMenu } from "@/lib/menu/computeMenuTags";

/** Recompute denormalized menuTags after menu / eventOfferings change. */
export function applyMenuToProvider(doc: Partial<Provider>): Partial<Provider> {
  const menuTags = computeMenuTagsFromMenu(doc.menu, doc.eventOfferings);
  return {
    ...doc,
    menuTags: menuTags.length ? menuTags : undefined,
  };
}
