import { describe, expect, it } from "vitest";
import {
  buildEventFullPath,
  buildGroupFullPath,
  buildGroupPath,
  buildProgramPath,
  buildPathForView,
  buildSectionPath,
  buildTourPath,
  buildVenueFullPath,
  buildVenuePath,
  parseAppRoute,
  parseEntityRouteKey,
} from "./appPaths";

describe("appPaths", () => {
  it("maps home and sections", () => {
    expect(parseAppRoute("/", new URLSearchParams()).view).toBe("Home");
    expect(parseAppRoute("/events", new URLSearchParams()).view).toBe("Events");
    expect(parseAppRoute("/venues", new URLSearchParams()).view).toBe("Venues");
    expect(parseAppRoute("/cafes", new URLSearchParams()).view).toBe("Cafés");
    expect(parseAppRoute("/culture", new URLSearchParams()).view).toBe("Meet-Up Groups");
    expect(parseAppRoute("/budget", new URLSearchParams()).view).toBe("Calculator");
    expect(parseAppRoute("/split", new URLSearchParams()).view).toBe("Split Check");
    expect(parseAppRoute("/eat-drink", new URLSearchParams()).view).toBe("Eat & Drink");
    expect(parseAppRoute("/program", new URLSearchParams()).view).toBe("Program");
    expect(parseAppRoute("/ez-a-het", new URLSearchParams()).view).toBe("Program");
    const vertical = parseAppRoute("/program/mozi", new URLSearchParams());
    expect(vertical.view).toBe("Program");
    expect(vertical.programVertical).toBe("mozi");
    expect(buildProgramPath()).toBe("/program");
    expect(buildProgramPath(undefined, { locale: "hu" })).toBe("/ez-a-het");
    expect(buildProgramPath("szinhaz")).toBe("/program/szinhaz");
  });

  it("parses tour routes", () => {
    const route = parseAppRoute("/tours/palinka", new URLSearchParams("seed=abc"));
    expect(route.tourId).toBe("palinka");
    expect(route.view).toBe("Eat & Drink");
    expect(buildTourPath("palinka", "abc")).toBe("/tours/palinka?seed=abc");
  });

  it("parses district filters", () => {
    const route = parseAppRoute("/events", new URLSearchParams("borough=belvaros&hood=Inner%20City"));
    expect(route.location?.borough).toBe("Belváros");
    expect(route.location?.neighborhood).toBe("Inner City");
  });

  it("parses venue and group deep links", () => {
    const venue = parseAppRoute("/venue/ny-cafe", new URLSearchParams("from=restaurants"));
    expect(venue.venueId).toBe("ny-cafe");
    expect(venue.view).toBe("Restaurants");

    const short = parseAppRoute("/v/ny-cafe", new URLSearchParams("utm_medium=qr"));
    expect(short.venueId).toBe("ny-cafe");
    expect(short.view).toBe("Venues");

    const group = parseAppRoute("/group/art-walk", new URLSearchParams());
    expect(group.groupId).toBe("art-walk");
    expect(group.view).toBe("Meet-Up Groups");
  });

  it("builds shareable paths", () => {
    expect(buildPathForView("Parties")).toBe("/parties");
    expect(buildSectionPath("events", { location: { borough: "Buda" } })).toBe("/events?borough=buda");
    expect(buildVenuePath("abc", { from: "cafes" })).toBe("/venue/abc?from=cafes");
    expect(buildGroupPath("g1")).toBe("/group/g1");
    expect(buildVenueFullPath("abc", { from: "cafes" })).toBe("/venue/abc/full?from=cafes");
    expect(buildEventFullPath("moby", { from: "events" })).toBe("/event/moby/full?from=events");
    expect(buildGroupFullPath("g1")).toBe("/group/g1/full");
  });

  it("parses full-page entity routes", () => {
    const slash = parseAppRoute(
      "/event/event-moby-budapest-park-2026/full",
      new URLSearchParams("from=events"),
    );
    expect(slash.fullPage).toBe(true);
    expect(slash.eventId).toBe("event-moby-budapest-park-2026");

    const suffix = parseAppRoute(
      "/event/event-moby-budapest-park-2026-full",
      new URLSearchParams(),
    );
    expect(suffix.fullPage).toBe(true);
    expect(suffix.eventId).toBe("event-moby-budapest-park-2026");

    expect(parseEntityRouteKey("foo-full", undefined)).toEqual({
      entityKey: "foo",
      fullPage: true,
    });
  });
});
