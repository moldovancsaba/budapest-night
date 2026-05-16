import { resolveProviderLocation } from "@/lib/budapestLocation";
import type { EventVenueLink, NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

const PROVIDER_ID_RE = /^prov-[a-z0-9-]+$/;

export function isValidProviderId(id: string): boolean {
  return PROVIDER_ID_RE.test(id);
}

/** Snapshot host venues on the event for filters, cards, and broken-link fallback. */
export function buildEventVenueLinks(hosts: Provider[]): EventVenueLink[] {
  return hosts.map((host) => {
    const loc = resolveProviderLocation(host);
    return {
      id: host.id,
      name: host.name,
      category: host.category,
      borough: loc.borough,
      neighborhood: loc.neighborhood,
      address: loc.address,
    };
  });
}

export function providerToEventVenueLink(host: Provider): EventVenueLink {
  return buildEventVenueLinks([host])[0]!;
}

/** Merge live catalog hosts with stored venueLinks (order follows venueIds). */
export function resolveEventHostVenues(
  event: Pick<NightEvent, "venueIds" | "venueLinks">,
  providersById: Map<string, Provider>,
): EventVenueLink[] {
  const linksById = new Map((event.venueLinks ?? []).map((v) => [v.id, v]));
  return event.venueIds
    .map((id) => {
      const live = providersById.get(id);
      if (live) return providerToEventVenueLink(live);
      return linksById.get(id) ?? null;
    })
    .filter((v): v is EventVenueLink => v !== null);
}

export function primaryEventHost(
  event: Pick<NightEvent, "venueIds" | "venueLinks">,
  providersById: Map<string, Provider>,
): EventVenueLink | null {
  return resolveEventHostVenues(event, providersById)[0] ?? null;
}

export function eventVenueIdsResolvable(
  event: Pick<NightEvent, "venueIds" | "venueLinks">,
  providersById: Map<string, Provider>,
): boolean {
  return event.venueIds.every(
    (id) => providersById.has(id) || (event.venueLinks ?? []).some((v) => v.id === id),
  );
}

export type PreparedNightEvent = NightEvent & { venueLinks: EventVenueLink[] };

/** Align district fields and persist venue snapshots for the primary and secondary hosts. */
export function prepareNightEventWithVenues(
  event: NightEvent,
  hosts: Provider[],
): PreparedNightEvent {
  const primary = hosts[0] ?? null;
  const located = primary
    ? { borough: primary.borough, neighborhood: primary.neighborhood }
    : { borough: event.borough, neighborhood: event.neighborhood };
  const loc = primary ? resolveProviderLocation(primary) : located;
  return {
    ...event,
    borough: loc.borough,
    neighborhood: loc.neighborhood,
    venueLinks: buildEventVenueLinks(hosts),
  };
}

export function missingVenueIds(
  venueIds: string[],
  knownIds: Set<string>,
): string[] {
  return venueIds.filter((id) => !knownIds.has(id));
}
