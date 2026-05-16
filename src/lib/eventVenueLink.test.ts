import { describe, expect, it } from "vitest";
import {
  buildEventVenueLinks,
  prepareNightEventWithVenues,
  resolveEventHostVenues,
} from "@/lib/eventVenueLink";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

const host: Provider = {
  id: "prov-budapest-park-obuda",
  name: "Budapest Park",
  category: "Venues",
  borough: "Ferencváros",
  neighborhood: "Fábián Juli",
  address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  activityTypes: ["Live Music"],
  ageRanges: ["18+"],
  dayTimeTags: ["Evening"],
  pricePerClass: 0,
  shortDescription: "Park",
  longDescription: "Park",
  rating: 0,
  reviewCount: 0,
  badges: [],
  image: "",
  email: "",
  website: "https://budapestpark.hu",
  phone: "",
};

const baseEvent: NightEvent = {
  id: "event-test",
  title: "Test show",
  shortDescription: "Test",
  longDescription: "Test",
  startsAt: "2026-08-01T20:00:00+02:00",
  endsAt: "2026-08-01T23:00:00+02:00",
  venueIds: [host.id],
  borough: "Óbuda",
  neighborhood: "Wrong",
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

describe("eventVenueLink", () => {
  it("builds venue link snapshots from providers", () => {
    const links = buildEventVenueLinks([host]);
    expect(links[0]).toMatchObject({
      id: host.id,
      name: host.name,
      borough: "Ferencváros",
      neighborhood: "Fábián Juli",
    });
  });

  it("syncs event district from primary host on ingest prep", () => {
    const stored = prepareNightEventWithVenues(baseEvent, [host]);
    expect(stored.borough).toBe("Ferencváros");
    expect(stored.neighborhood).toBe("Fábián Juli");
    expect(stored.venueLinks).toHaveLength(1);
    expect(stored.venueLinks![0]!.name).toBe("Budapest Park");
  });

  it("resolves hosts from catalog or stored venueLinks", () => {
    const stored = prepareNightEventWithVenues(baseEvent, [host]);
    const fromCatalog = resolveEventHostVenues(stored, new Map([[host.id, host]]));
    expect(fromCatalog[0]!.name).toBe("Budapest Park");

    const fromSnapshot = resolveEventHostVenues(stored, new Map());
    expect(fromSnapshot[0]!.name).toBe("Budapest Park");
  });
});
