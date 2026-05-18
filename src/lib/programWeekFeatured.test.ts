import { describe, expect, it } from "vitest";
import { splitFeaturedProgramEvents } from "./programWeekFeatured";
import type { PublicNightEvent } from "@/lib/publicEvent";

function ev(id: string, startsAt: string): PublicNightEvent {
  return {
    id,
    title: id,
    shortDescription: "",
    longDescription: "",
    startsAt,
    endsAt: startsAt,
    timezone: "Europe/Budapest",
    venueIds: [],
    borough: "Belváros",
    neighborhood: "Inner City",
    entryFees: [],
    activityTypes: [],
    ageRanges: [],
    dayTimeTags: [],
    badges: [],
    image: "",
    website: "",
    bookingUrl: "",
    email: "",
    phone: "",
    status: "scheduled",
    venues: [],
    venuesResolved: true,
  };
}

describe("splitFeaturedProgramEvents", () => {
  const weekId = "2026-05-14";

  it("puts in-week and later events in separate buckets", () => {
    const upcoming = [
      ev("a", "2026-05-19T19:30:00+02:00"),
      ev("b", "2026-06-18T20:00:00+02:00"),
    ];
    const { thisWeek, spotlight } = splitFeaturedProgramEvents(["a", "b"], upcoming, weekId);
    expect(thisWeek.map((e) => e.id)).toEqual(["a"]);
    expect(spotlight.map((e) => e.id)).toEqual(["b"]);
    expect(spotlight[0].outsideProgramWeek).toBe(true);
  });
});
