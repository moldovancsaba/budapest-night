import registry from "@/data/budapest-location-registry.json";
import { resolveLocationFromRegistry } from "@/lib/curator/locationIngestRules";
import type { Borough } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

/** Old ingest ids → current provider id (venue URL / venueIds resolution). */
export const LEGACY_PROVIDER_ID_ALIASES: Record<string, string> = {
  "prov-budapest-park-obuda": "prov-budapest-park-ferencvaros",
  "prov-mvm-dome-ujbuda": "prov-mvm-dome-terezvaros",
  "prov-cov-island-cafe-obuda": "prov-cov-island-cafe-ferencvaros",
  "prov-cov-park-party-obuda": "prov-cov-park-party-ferencvaros",
  "prov-cov-rudas-ujbuda-party": "prov-cov-rudas-buda-party",
};

export function resolveLegacyProviderId(idOrPathKey: string): string | undefined {
  return LEGACY_PROVIDER_ID_ALIASES[idOrPathKey];
}

/** Verified overrides from budapest-location-registry.json landmarks. */
export const CANONICAL_VENUE_LOCATIONS: Record<
  string,
  { borough: Borough; neighborhood: string; address: string }
> = Object.fromEntries(
  registry.landmarks.map((l) => [
    l.id,
    { borough: l.borough as Borough, neighborhood: l.neighborhood, address: l.address },
  ]),
) as Record<string, { borough: Borough; neighborhood: string; address: string }>;

/** Resolve listing location from canonical registry or high-confidence street hints. */
export function resolveProviderLocation(
  provider: Pick<Provider, "id" | "borough" | "neighborhood" | "address">,
): Pick<Provider, "borough" | "neighborhood" | "address"> {
  const canonical =
    CANONICAL_VENUE_LOCATIONS[provider.id] ??
    (resolveLegacyProviderId(provider.id)
      ? CANONICAL_VENUE_LOCATIONS[resolveLegacyProviderId(provider.id)!]
      : undefined);
  if (canonical) return canonical;

  const address = provider.address?.trim() ?? "";
  const resolved = resolveLocationFromRegistry({
    id: provider.id,
    address,
    borough: provider.borough,
    neighborhood: provider.neighborhood,
  });
  if ("error" in resolved) {
    return {
      borough: provider.borough,
      neighborhood: provider.neighborhood,
      address,
    };
  }

  return {
    borough: resolved.borough as Borough,
    neighborhood:
      resolved.source.startsWith("landmark") || resolved.source.startsWith("addressOverride")
        ? resolved.neighborhood
        : provider.neighborhood,
    address: resolved.address || address,
  };
}

/** Keep timed events aligned with their primary host venue for filters and cards. */
export function syncEventLocationFromHost(
  event: Pick<NightEvent, "borough" | "neighborhood" | "venueIds">,
  host: Pick<Provider, "borough" | "neighborhood"> | null | undefined,
): Pick<NightEvent, "borough" | "neighborhood"> {
  if (!host) return { borough: event.borough, neighborhood: event.neighborhood };
  return { borough: host.borough, neighborhood: host.neighborhood };
}
