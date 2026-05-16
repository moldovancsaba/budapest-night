import type { Provider } from "@/types/provider";
import { computeMenuTagsFromMenu } from "@/lib/menu/computeMenuTags";
import { enrichProviderMenuVenueLink } from "@/lib/menu/menuVenueLink";

/** Recompute menuTags and menu.venueLink after menu / eventOfferings change. */
export function applyMenuToProvider(doc: Partial<Provider>): Partial<Provider> {
  const menuTags = computeMenuTagsFromMenu(doc.menu, doc.eventOfferings);
  const withTags: Provider = {
    ...(doc as Provider),
    menuTags: menuTags.length ? menuTags : undefined,
  };
  return enrichProviderMenuVenueLink(withTags);
}
