import { describe, expect, it } from "vitest";
import {
  buildGroupPath,
  buildPathForView,
  buildSectionPath,
  buildTourPath,
  buildVenuePath,
  parseAppRoute,
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

    const group = parseAppRoute("/group/art-walk", new URLSearchParams());
    expect(group.groupId).toBe("art-walk");
    expect(group.view).toBe("Meet-Up Groups");
  });

  it("builds shareable paths", () => {
    expect(buildPathForView("Parties")).toBe("/parties");
    expect(buildSectionPath("events", { location: { borough: "Buda" } })).toBe("/events?borough=buda");
    expect(buildVenuePath("abc", { from: "cafes" })).toBe("/venue/abc?from=cafes");
    expect(buildGroupPath("g1")).toBe("/group/g1");
  });
});
