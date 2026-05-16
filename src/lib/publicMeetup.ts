import {
  meetupLinksResolvable,
  resolveMeetupHostVenues,
  resolveMeetupOrganizedEvents,
} from "@/lib/meetupGroupLink";
import type { MeetupEventLink, MeetupGroup } from "@/types/meetup";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";
import type { VenueLink } from "@/types/venueLink";

export type PublicMeetupGroup = MeetupGroup & {
  venues: VenueLink[];
  events: MeetupEventLink[];
  venuesResolved: boolean;
  eventsResolved: boolean;
};

export function toPublicMeetupGroup(
  group: MeetupGroup,
  providersById: Map<string, Provider>,
  eventsById: Map<string, NightEvent>,
): PublicMeetupGroup {
  const { venuesResolved, eventsResolved } = meetupLinksResolvable(group, providersById, eventsById);
  return {
    ...group,
    venues: resolveMeetupHostVenues(group, providersById),
    events: resolveMeetupOrganizedEvents(group, eventsById),
    venuesResolved,
    eventsResolved,
  };
}
