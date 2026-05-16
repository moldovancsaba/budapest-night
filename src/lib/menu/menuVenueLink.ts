import { resolveProviderLocation } from "@/lib/budapestLocation";
import type { VenueMenu } from "@/types/menu";
import type { Provider } from "@/types/provider";
import type { VenueLink } from "@/types/venueLink";

export function buildMenuVenueLink(provider: Provider): VenueLink {
  const loc = resolveProviderLocation(provider);
  return {
    id: provider.id,
    name: provider.name,
    category: provider.category,
    borough: loc.borough,
    neighborhood: loc.neighborhood,
    address: loc.address,
    website: provider.website?.trim() || undefined,
    menuUrl: provider.menu?.menuUrl?.trim() || undefined,
  };
}

export function resolveMenuVenueLink(provider: Provider): VenueLink {
  const live = buildMenuVenueLink(provider);
  const stored = provider.menu?.venueLink;
  if (!stored) return live;
  return {
    ...stored,
    borough: live.borough,
    neighborhood: live.neighborhood,
    address: live.address,
    name: live.name,
    category: live.category,
    website: live.website,
    menuUrl: live.menuUrl ?? stored.menuUrl,
  };
}

/** Attach venue snapshot to menu; clear when menu has no sections. */
export function enrichProviderMenuVenueLink(provider: Provider): Provider {
  const sections = provider.menu?.sections ?? [];
  if (!sections.length) {
    if (!provider.menu) return provider;
    const { venueLink: _drop, ...menuRest } = provider.menu;
    const hasSections = (menuRest.sections?.length ?? 0) > 0;
    return { ...provider, menu: hasSections ? { ...menuRest, sections: menuRest.sections! } : undefined };
  }
  const link = buildMenuVenueLink(provider);
  return {
    ...provider,
    menu: {
      ...provider.menu!,
      venueLink: link,
    },
  };
}

export function providerHasPublishedMenu(provider: Pick<Provider, "menu" | "eventOfferings">): boolean {
  return (provider.menu?.sections?.length ?? 0) > 0 || (provider.eventOfferings?.length ?? 0) > 0;
}

export function menuVenueLinkFromMenu(
  menu: VenueMenu | undefined,
  fallback: Provider,
): VenueLink {
  if (menu?.venueLink?.id) {
    return menu.venueLink;
  }
  return buildMenuVenueLink(fallback);
}
