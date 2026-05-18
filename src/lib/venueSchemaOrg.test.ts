import { describe, expect, it } from "vitest";
import { venueSchemaOrgType } from "@/components/seo/JsonLd";

describe("venueSchemaOrgType", () => {
  it("maps cinema to MovieTheater", () => {
    expect(venueSchemaOrgType(["Cinema"])).toBe("MovieTheater");
  });

  it("maps theatre to PerformingArtsTheater", () => {
    expect(venueSchemaOrgType(["Theatre"])).toBe("PerformingArtsTheater");
  });

  it("falls back to LocalBusiness", () => {
    expect(venueSchemaOrgType(["Ruin Bar"])).toBe("LocalBusiness");
  });
});
