import { describe, expect, it } from "vitest";
import { formatVenuePrice, formatCrowdLabel, venueSharePriceLine } from "./venueDisplay";

describe("formatCrowdLabel", () => {
  it("returns age labels as-is", () => {
    expect(formatCrowdLabel("18+")).toBe("18+");
    expect(formatCrowdLabel("All ages")).toBe("All ages");
  });
});

describe("formatVenuePrice", () => {
  it("shows free entry for zero-price parties", () => {
    expect(formatVenuePrice({ category: "Parties", pricePerClass: 0 })).toEqual({ main: "Free entry" });
  });

  it("shows cover suffix for priced parties", () => {
    expect(formatVenuePrice({ category: "Parties", pricePerClass: 12 })).toEqual({
      main: "From €12",
      suffix: "/cover",
    });
  });

  it("shows price varies for ticketed venues without a listed price", () => {
    expect(formatVenuePrice({ category: "Venues", pricePerClass: 0 })).toEqual({
      main: "Price varies",
    });
  });

  it("shows from-price with ticket suffix for venues", () => {
    expect(formatVenuePrice({ category: "Venues", pricePerClass: 25 })).toEqual({
      main: "From €25",
      suffix: "/ticket",
    });
  });
});

describe("venueSharePriceLine", () => {
  it("formats share copy without class wording", () => {
    expect(venueSharePriceLine({ category: "Parties", pricePerClass: 0 })).toBe("Free entry");
    expect(venueSharePriceLine({ category: "Restaurants", pricePerClass: 45 })).toBe("From €45/person");
  });
});
