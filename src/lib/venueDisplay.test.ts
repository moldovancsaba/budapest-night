import { describe, expect, it } from "vitest";
import { formatVenuePrice, formatCrowdLabel, venueSharePriceLine } from "./venueDisplay";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";

const opts = { displayCurrency: "EUR" as const, rates: DEFAULT_CURRENCY_RATES };

describe("formatCrowdLabel", () => {
  it("returns age labels as-is", () => {
    expect(formatCrowdLabel("18+")).toBe("18+");
  });
});

describe("formatVenuePrice", () => {
  it("shows free entry for zero-price parties", () => {
    expect(formatVenuePrice({ category: "Parties", pricePerClass: 0 }, opts)).toEqual({
      main: "Free entry",
    });
  });

  it("shows cover suffix for priced parties in EUR display", () => {
    expect(
      formatVenuePrice({ category: "Parties", pricePerClass: 4200, priceCurrency: "HUF" }, opts),
    ).toEqual({
      main: "From €12",
      suffix: "/cover",
    });
  });

  it("shows price varies for ticketed venues without a listed price", () => {
    expect(formatVenuePrice({ category: "Venues", pricePerClass: 0 }, opts)).toEqual({
      main: "Price varies",
    });
  });

  it("shows from-price with ticket suffix for venues", () => {
    expect(
      formatVenuePrice({ category: "Venues", pricePerClass: 8750, priceCurrency: "HUF" }, opts),
    ).toEqual({
      main: "From €25",
      suffix: "/ticket",
    });
  });
});

describe("venueSharePriceLine", () => {
  it("formats share copy without class wording", () => {
    expect(formatVenuePrice({ category: "Parties", pricePerClass: 0 }, opts).main).toBe("Free entry");
    expect(
      venueSharePriceLine(
        { category: "Restaurants", pricePerClass: 15750, priceCurrency: "HUF" },
        opts,
      ),
    ).toBe("From €45/person");
  });
});
