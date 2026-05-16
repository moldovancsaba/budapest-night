import { describe, expect, it } from "vitest";
import { generateTour } from "./generateTour";
import type { Provider } from "@/types/provider";

function mockProvider(overrides: Partial<Provider> & Pick<Provider, "id" | "name" | "category" | "borough">): Provider {
  return {
    id: overrides.id,
    name: overrides.name,
    category: overrides.category,
    borough: overrides.borough,
    neighborhood: overrides.neighborhood ?? "Center",
    address: overrides.address ?? "Test st 1",
    activityTypes: overrides.activityTypes ?? [],
    ageRanges: overrides.ageRanges ?? ["18+"],
    dayTimeTags: overrides.dayTimeTags ?? ["Evening"],
    pricePerClass: overrides.pricePerClass ?? 20,
    shortDescription: overrides.shortDescription ?? "Short",
    longDescription: overrides.longDescription ?? "Long",
    rating: overrides.rating ?? 4.5,
    reviewCount: overrides.reviewCount ?? 10,
    badges: overrides.badges ?? [],
    image: overrides.image ?? "",
    email: overrides.email ?? "",
    website: overrides.website ?? "https://example.com",
    phone: overrides.phone ?? "",
    menuTags: overrides.menuTags,
    menu: overrides.menu,
  } as Provider;
}

describe("generateTour", () => {
  const providers = [
    mockProvider({ id: "a", name: "A", category: "Restaurants", borough: "Belváros", menuTags: ["palinka"] }),
    mockProvider({ id: "b", name: "B", category: "Cafés", borough: "Terézváros", menuTags: ["palinka"] }),
    mockProvider({ id: "c", name: "C", category: "Parties", borough: "Buda", menuTags: ["palinka"] }),
    mockProvider({ id: "d", name: "D", category: "Restaurants", borough: "Újbuda", menuTags: ["palinka"] }),
  ];

  it("returns three stops for palinka tour with fixed seed", () => {
    const result = generateTour(providers, "palinka", "test-seed-1");
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.stops).toHaveLength(3);
    for (const stop of result.stops) {
      expect(stop.provider.menuTags).toContain("palinka");
    }
  });

  it("errors when not enough venues", () => {
    const result = generateTour(providers.slice(0, 1), "palinka", "x");
    expect(result).toEqual({ error: "not_enough_venues" });
  });
});
