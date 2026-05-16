import { describe, expect, it } from "vitest";
import { resolveMenuItemForLocale } from "@/lib/menu/resolveMenuLocale";
import type { MenuItem } from "@/types/menu";

const item: MenuItem = {
  id: "espresso",
  kind: "drink",
  name: "Espresso",
  tags: ["coffee"],
  locales: {
    it: { name: "Espresso" },
    hu: { name: "Eszpresszó" },
    es: { name: "Café expreso" },
    he: { name: "אספרסו" },
    ar: { name: "إسبريسو" },
  },
};

describe("resolveMenuLocale", () => {
  it("returns English root for en locale", () => {
    expect(resolveMenuItemForLocale(item, "en").name).toBe("Espresso");
  });

  it("returns translated name for it locale", () => {
    expect(resolveMenuItemForLocale(item, "it").name).toBe("Espresso");
    expect(resolveMenuItemForLocale(item, "hu").name).toBe("Eszpresszó");
  });

  it("falls back to English when locale overlay missing", () => {
    const sparse = { ...item, locales: { it: { name: "Caffè espresso" } } };
    expect(resolveMenuItemForLocale(sparse, "hu").name).toBe("Espresso");
    expect(resolveMenuItemForLocale(sparse, "it").name).toBe("Caffè espresso");
  });
});
