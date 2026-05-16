import { describe, expect, it } from "vitest";
import {
  filterFlatMenuItems,
  flattenProviderMenu,
  inferMenuItemKind,
} from "@/lib/menu/flattenMenuItems";
import type { Provider } from "@/types/provider";

const provider = {
  id: "prov-test",
  name: "Test",
  category: "Restaurants",
  borough: "Belváros",
  neighborhood: "Inner City",
  address: "Budapest",
  menu: {
    sourceUrls: ["https://example.com"],
    lastVerifiedAt: "2026-05-16",
    sections: [
      {
        id: "food-sec",
        title: "Mains",
        kind: "food",
        items: [
          {
            id: "goulash",
            kind: "food",
            name: "Goulash",
            tags: ["goulash", "hungarian"],
            price: { amount: 1000, currency: "HUF", source: "published" },
          },
        ],
      },
      {
        id: "drink-sec",
        title: "Drinks",
        kind: "drink",
        items: [
          {
            id: "beer",
            kind: "drink",
            name: "Lager",
            tags: ["beer"],
            price: { amount: 500, currency: "HUF", source: "published" },
          },
        ],
      },
    ],
  },
} as unknown as Provider;

describe("inferMenuItemKind", () => {
  it("infers drink from drink tags when kind omitted", () => {
    expect(
      inferMenuItemKind({
        id: "x",
        name: "Espresso",
        tags: ["coffee"],
      }),
    ).toBe("drink");
  });
});

describe("filterFlatMenuItems", () => {
  const flat = flattenProviderMenu(provider);

  it("filters by food kind only", () => {
    const food = filterFlatMenuItems(flat, { kind: "food" });
    expect(food).toHaveLength(1);
    expect(food[0]?.item.name).toBe("Goulash");
  });

  it("filters by drink kind only", () => {
    const drink = filterFlatMenuItems(flat, { kind: "drink" });
    expect(drink).toHaveLength(1);
    expect(drink[0]?.item.name).toBe("Lager");
  });
});
