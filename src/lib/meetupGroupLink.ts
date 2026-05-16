import { isValidProviderId } from "@/lib/eventVenueLink";
import { buildMenuVenueLink } from "@/lib/menu/menuVenueLink";
import { COL } from "@/lib/mongodb";
import type { NightEvent } from "@/types/event";
import type { MeetupEventLink, MeetupGroup } from "@/types/meetup";
import type { Provider } from "@/types/provider";
import type { VenueLink } from "@/types/venueLink";

const EVENT_ID_RE = /^event-[a-z0-9-]+$/;

export function isValidEventId(id: string): boolean {
  return EVENT_ID_RE.test(id);
}

export function buildMeetupEventLink(event: NightEvent): MeetupEventLink {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    borough: event.borough,
    neighborhood: event.neighborhood,
    status: event.status,
  };
}

export function buildMeetupVenueLinks(hosts: Provider[]): VenueLink[] {
  return hosts.map((host) => buildMenuVenueLink(host));
}

export type PreparedMeetupGroup = MeetupGroup & {
  venueLinks: VenueLink[];
  eventLinks: MeetupEventLink[];
};

export async function loadMeetupGroupHosts(
  db: { collection: (name: string) => { findOne: (q: object) => Promise<unknown> } },
  venueIds: string[],
): Promise<{ hosts: Provider[] } | { error: string }> {
  const hosts: Provider[] = [];
  for (const id of venueIds) {
    if (!isValidProviderId(id)) {
      return { error: `meetupGroup: invalid venueId ${JSON.stringify(id)} (expected prov-...)` };
    }
    const raw = (await db.collection(COL.providers).findOne({ id })) as Provider | null;
    if (!raw) {
      return {
        error: `meetupGroup: unknown venueId ${id} — upsert the venue first (same payload, before the meetup)`,
      };
    }
    hosts.push(raw);
  }
  return { hosts };
}

export async function loadMeetupGroupEvents(
  db: { collection: (name: string) => { findOne: (q: object) => Promise<unknown> } },
  eventIds: string[],
): Promise<{ events: NightEvent[] } | { error: string }> {
  const events: NightEvent[] = [];
  for (const id of eventIds) {
    if (!isValidEventId(id)) {
      return { error: `meetupGroup: invalid eventId ${JSON.stringify(id)} (expected event-...)` };
    }
    const raw = (await db.collection(COL.events).findOne({ id })) as NightEvent | null;
    if (!raw) {
      return {
        error: `meetupGroup: unknown eventId ${id} — upsert the timed event first (same payload, before the meetup)`,
      };
    }
    events.push(raw);
  }
  return { events };
}

/** Attach venue/event snapshots; empty arrays when ids omitted. */
export function prepareMeetupGroupWithLinks(
  group: MeetupGroup,
  hosts: Provider[],
  events: NightEvent[],
): PreparedMeetupGroup {
  const venueIds = group.venueIds ?? [];
  const eventIds = group.eventIds ?? [];
  return {
    ...group,
    venueIds,
    eventIds,
    venueLinks: buildMeetupVenueLinks(hosts),
    eventLinks: events.map(buildMeetupEventLink),
  };
}

export function resolveMeetupHostVenues(
  group: Pick<MeetupGroup, "venueIds" | "venueLinks">,
  providersById: Map<string, Provider>,
): VenueLink[] {
  const linksById = new Map((group.venueLinks ?? []).map((v) => [v.id, v]));
  return (group.venueIds ?? [])
    .map((id) => {
      const live = providersById.get(id);
      if (live) return buildMenuVenueLink(live);
      return linksById.get(id) ?? null;
    })
    .filter((v): v is VenueLink => v !== null);
}

export function resolveMeetupOrganizedEvents(
  group: Pick<MeetupGroup, "eventIds" | "eventLinks">,
  eventsById: Map<string, NightEvent>,
): MeetupEventLink[] {
  const linksById = new Map((group.eventLinks ?? []).map((e) => [e.id, e]));
  return (group.eventIds ?? [])
    .map((id) => {
      const live = eventsById.get(id);
      if (live) return buildMeetupEventLink(live);
      return linksById.get(id) ?? null;
    })
    .filter((e): e is MeetupEventLink => e !== null);
}

export function meetupLinksResolvable(
  group: Pick<MeetupGroup, "venueIds" | "venueLinks" | "eventIds" | "eventLinks">,
  providersById: Map<string, Provider>,
  eventsById: Map<string, NightEvent>,
): { venuesResolved: boolean; eventsResolved: boolean } {
  const venueIds = group.venueIds ?? [];
  const eventIds = group.eventIds ?? [];
  return {
    venuesResolved:
      venueIds.length === 0 ||
      venueIds.every((id) => providersById.has(id) || (group.venueLinks ?? []).some((v) => v.id === id)),
    eventsResolved:
      eventIds.length === 0 ||
      eventIds.every((id) => eventsById.has(id) || (group.eventLinks ?? []).some((e) => e.id === id)),
  };
}
