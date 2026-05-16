import { computeMenuTagsFromMenu } from "@/lib/menu/computeMenuTags";
import type { Provider } from "@/types/provider";

/** Tags derived from menu items (source of truth). Falls back to stored menuTags only when no menu body exists. */
export function getEffectiveMenuTags(provider: Provider): string[] {
  const fromMenu = computeMenuTagsFromMenu(provider.menu, provider.eventOfferings);
  if (fromMenu.length > 0) return fromMenu;
  return provider.menuTags ?? [];
}

export function providerHasPublishedMenuItems(provider: Provider): boolean {
  if (provider.menu?.sections?.some((s) => (s.items?.length ?? 0) > 0)) return true;
  if (provider.eventOfferings?.some((e) => (e.items?.length ?? 0) > 0)) return true;
  return false;
}
