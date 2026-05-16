import { describe, expect, it } from "vitest";
import type { MenuTag } from "@/data/menuTags";
import { generateTour } from "./generateTour";
import type { Provider } from "@/types/provider";
import type { VenueMenu } from "@/types/menu";

function menuWithTag(tag: MenuTag): VenueMenu {
  return {
    menuUrl: "https://example.com/menu",
    sourceUrls: ["https://example.com/menu"],
    lastVerifiedAt: "2026-05-16",
    sections: [
      {
        id: "main",
        title: "Drinks",
        kind: "drink",
        items: [
          {
            id: `item-${tag}`,
            kind: "drink",
            name: `House ${tag}`,
            tags: [tag],
            price: { amount: 1200, currency: "HUF", unit: "glass", source: "published" },
          },
        ],
      },
    ],
  };
}

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
    mockProvider({ id: "a", name: "A", category: "Restaurants", borough: "Belváros", menu: menuWithTag("palinka") }),
    mockProvider({ id: "b", name: "B", category: "Cafés", borough: "Terézváros", menu: menuWithTag("palinka") }),
    mockProvider({ id: "c", name: "C", category: "Parties", borough: "Buda", menu: menuWithTag("palinka") }),
    mockProvider({ id: "d", name: "D", category: "Restaurants", borough: "Újbuda", menu: menuWithTag("palinka") }),
  ];

  it("returns three stops for palinka tour with fixed seed", () => {
    const result = generateTour(providers, "palinka", "test-seed-1");
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.stops).toHaveLength(3);
    for (const stop of result.stops) {
      expect(stop.highlightItems.length).toBeGreaterThan(0);
      expect(stop.highlightItems[0]?.name).toContain("palinka");
    }
  });

  it("errors when not enough venues", () => {
    const result = generateTour(providers.slice(0, 1), "palinka", "x");
    expect(result).toEqual({ error: "not_enough_venues" });
  });
});
