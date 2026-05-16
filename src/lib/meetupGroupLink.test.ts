import { describe, expect, it } from "vitest";
import {
  buildMeetupEventLink,
  buildMeetupVenueLinks,
  prepareMeetupGroupWithLinks,
  resolveMeetupHostVenues,
  resolveMeetupOrganizedEvents,
  meetupLinksResolvable,
} from "@/lib/meetupGroupLink";
import type { MeetupGroup } from "@/types/meetup";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

const host: Provider = {
  id: "prov-test-venue",
  name: "Test Venue",
  category: "Venues",
  borough: "Belváros",
  neighborhood: "District V",
  address: "Budapest",
  activityTypes: ["Live Music"],
  ageRanges: ["18+"],
  dayTimeTags: ["Evening"],
  pricePerClass: 0,
  shortDescription: "Venue",
  longDescription: "Venue",
  rating: 0,
  reviewCount: 0,
  badges: [],
  image: "",
  email: "",
  website: "https://example.com",
  phone: "",
};

const event: NightEvent = {
  id: "event-test-show",
  title: "Circle Night",
  shortDescription: "Show",
  longDescription: "Show",
  startsAt: "2026-09-01T20:00:00+02:00",
  endsAt: "2026-09-01T23:00:00+02:00",
  venueIds: [host.id],
  borough: "Belváros",
  neighborhood: "District V",
  entryFees: [],
  activityTypes: ["Live Music"],
  ageRanges: ["18+"],
  dayTimeTags: ["Evening"],
  badges: [],
  image: "",
  website: "https://example.com",
  bookingUrl: "",
  email: "",
  phone: "",
  status: "scheduled",
};

const baseGroup: MeetupGroup = {
  id: "grp-test",
  name: "Test Circle",
  borough: "Belváros",
  neighborhood: "District V",
  groupType: "Live Culture",
  ageRange: "18+",
  cadence: "Monthly",
  instagram: "@test",
  website: "https://example.com",
  description: "A test culture circle.",
  initials: "TC",
  icon: "community",
  palette: "teal",
  venueIds: [host.id],
  eventIds: [event.id],
};

describe("meetupGroupLink", () => {
  it("builds venue and event link snapshots", () => {
    const venueLinks = buildMeetupVenueLinks([host]);
    expect(venueLinks[0]).toMatchObject({ id: host.id, name: host.name });

    const eventLink = buildMeetupEventLink(event);
    expect(eventLink.title).toBe("Circle Night");
  });

  it("prepares stored group with venueLinks and eventLinks", () => {
    const stored = prepareMeetupGroupWithLinks(baseGroup, [host], [event]);
    expect(stored.venueLinks).toHaveLength(1);
    expect(stored.eventLinks).toHaveLength(1);
    expect(stored.eventLinks![0]!.id).toBe(event.id);
  });

  it("resolves hosts and events from catalog or snapshots", () => {
    const stored = prepareMeetupGroupWithLinks(baseGroup, [host], [event]);
    const providersById = new Map([[host.id, host]]);
    const eventsById = new Map([[event.id, event]]);

    const venues = resolveMeetupHostVenues(stored, providersById);
    expect(venues[0]!.name).toBe("Test Venue");

    const events = resolveMeetupOrganizedEvents(stored, eventsById);
    expect(events[0]!.title).toBe("Circle Night");

    const venuesFromSnapshot = resolveMeetupHostVenues(stored, new Map());
    expect(venuesFromSnapshot[0]!.name).toBe("Test Venue");

    const eventsFromSnapshot = resolveMeetupOrganizedEvents(stored, new Map());
    expect(eventsFromSnapshot[0]!.title).toBe("Circle Night");
  });

  it("reports resolvable flags", () => {
    const stored = prepareMeetupGroupWithLinks(baseGroup, [host], [event]);
    const resolved = meetupLinksResolvable(
      stored,
      new Map([[host.id, host]]),
      new Map([[event.id, event]]),
    );
    expect(resolved.venuesResolved).toBe(true);
    expect(resolved.eventsResolved).toBe(true);
  });
});
