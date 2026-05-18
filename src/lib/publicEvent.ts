import { resolveEventHostVenues, eventVenueIdsResolvable } from "@/lib/eventVenueLink";
import type { EventVenueLink, NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

/** Event as returned by GET /api/public/events — hosts resolved for UI and tours. */
export type PublicNightEvent = NightEvent & {
  venues: EventVenueLink[];
  /** True when every venueId matched a live provider or stored venueLinks snapshot. */
  venuesResolved: boolean;
  /** Active featured_event promotion (public API only). */
  isFeatured?: boolean;
  promotionLabel?: string;
  /** Editorial pick scheduled outside the current Thu–Wed program week. */
  outsideProgramWeek?: boolean;
};

export function toPublicNightEvent(
  event: NightEvent,
  providersById: Map<string, Provider>,
): PublicNightEvent {
  const venues = resolveEventHostVenues(event, providersById);
  return {
    ...event,
    venues,
    venuesResolved: eventVenueIdsResolvable(event, providersById),
  };
}
