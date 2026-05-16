import { describe, expect, it } from "vitest";
import { enrichProviderMenuVenueLink, buildMenuVenueLink } from "@/lib/menu/menuVenueLink";
import { flattenProviderMenu } from "@/lib/menu/flattenMenuItems";
import type { Provider } from "@/types/provider";

const cafe: Provider = {
  id: "prov-test-cafe",
  name: "Test Specialty Café",
  category: "Cafés",
  borough: "Erzsébetváros",
  neighborhood: "Gozsdu Udvar",
  address: "1075 Budapest, Kazinczy utca 1",
  activityTypes: ["Coffee"],
  ageRanges: ["All ages"],
  dayTimeTags: ["Morning", "Afternoon"],
  pricePerClass: 12,
  shortDescription: "Café",
  longDescription: "Café",
  rating: 4.5,
  reviewCount: 10,
  badges: [],
  image: "",
  email: "",
  website: "https://cafe.example",
  phone: "",
  menu: {
    menuUrl: "https://cafe.example/menu",
    sourceUrls: ["https://cafe.example/menu"],
    lastVerifiedAt: "2026-05-16",
    sections: [
      {
        id: "coffee",
        title: "Coffee",
        kind: "drink",
        items: [
          {
            id: "espresso",
            kind: "drink",
            name: "Espresso",
            tags: ["coffee", "specialty-coffee"],
            price: { amount: 890, currency: "HUF", unit: "each", source: "published" },
          },
        ],
      },
    ],
  },
};

describe("menuVenueLink", () => {
  it("writes venueLink on menu ingest prep", () => {
    const stored = enrichProviderMenuVenueLink(cafe);
    expect(stored.menu?.venueLink).toMatchObject({
      id: cafe.id,
      name: cafe.name,
      category: "Cafés",
      address: cafe.address,
    });
    expect(stored.menu?.venueLink?.menuUrl).toBe("https://cafe.example/menu");
  });

  it("flattens items with full venue on each row", () => {
    const stored = enrichProviderMenuVenueLink(cafe);
    const flat = flattenProviderMenu(stored);
    expect(flat[0]!.venue.id).toBe(cafe.id);
    expect(flat[0]!.address).toBe(cafe.address);
    expect(flat[0]!.venue.category).toBe("Cafés");
  });

  it("buildMenuVenueLink uses canonical location overrides", () => {
    const park: Provider = {
      ...cafe,
      id: "prov-budapest-park-ferencvaros",
      name: "Budapest Park",
      category: "Venues",
      borough: "Óbuda",
      neighborhood: "Wrong",
      address: "wrong",
    };
    const link = buildMenuVenueLink(park);
    expect(link.borough).toBe("Ferencváros");
    expect(link.neighborhood).toBe("Fábián Juli");
  });
});
