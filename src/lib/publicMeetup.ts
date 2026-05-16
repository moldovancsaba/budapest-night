import {
  meetupLinksResolvable,
  resolveMeetupHostVenues,
  resolveMeetupOrganizedEvents,
} from "@/lib/meetupGroupLink";
import type { MeetupEventLink, MeetupGroup } from "@/types/meetup";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";
import type { VenueLink } from "@/types/venueLink";
import type { PublicNightEvent } from "@/lib/publicEvent";

export type PublicMeetupGroup = MeetupGroup & {
  venues: VenueLink[];
  events: MeetupEventLink[];
  venuesResolved: boolean;
  eventsResolved: boolean;
};

/** Minimal event row for profile navigation when the catalog row is not loaded yet. */
export function eventStubFromMeetupLink(
  link: MeetupEventLink,
  group: Pick<MeetupGroup, "description" | "website">,
): PublicNightEvent {
  return {
    id: link.id,
    title: link.title,
    shortDescription: group.description.slice(0, 160),
    longDescription: group.description,
    startsAt: link.startsAt,
    endsAt: link.endsAt,
    venueIds: [],
    borough: link.borough,
    neighborhood: link.neighborhood,
    entryFees: [],
    activityTypes: [],
    ageRanges: ["18+"],
    dayTimeTags: ["Evening"],
    badges: [],
    image: "",
    website: group.website,
    bookingUrl: "",
    email: "",
    phone: "",
    status: link.status,
    venues: [],
    venuesResolved: false,
  };
}

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
