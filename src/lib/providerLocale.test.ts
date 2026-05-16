import { describe, expect, it } from "vitest";
import type { Provider } from "@/types/provider";
import {
  findProviderByVenueKey,
  getVenuePathKey,
  resolveProviderForLocale,
} from "@/lib/providerLocale";

const base: Provider = {
  id: "prov-a38-ferencvaros",
  name: "A38 Ship",
  category: "Venues",
  borough: "Ferencváros",
  neighborhood: "Petőfi Bridge",
  address: "Petőfi rakpart, 1117 Budapest",
  activityTypes: ["Live Music"],
  ageRanges: ["18+"],
  dayTimeTags: ["Evening"],
  pricePerClass: 25,
  shortDescription: "Concert ship on the Danube.",
  longDescription: "English long description.",
  rating: 4.7,
  reviewCount: 100,
  badges: ["Featured"],
  image: "https://i.ibb.co/Wv8BgB2k/e0c2e2090035.jpg",
  email: "",
  website: "https://a38.hu/en/",
  phone: "",
  locales: {
    hu: {
      name: "A38 Hajó",
      shortDescription: "Koncert-hajó a Dunán.",
      longDescription: "Magyar leírás.",
      slug: "a38-hajo",
    },
  },
};

describe("resolveProviderForLocale", () => {
  it("uses Hungarian variant when available", () => {
    const hu = resolveProviderForLocale(base, "hu");
    expect(hu.name).toBe("A38 Hajó");
    expect(hu.shortDescription).toBe("Koncert-hajó a Dunán.");
    expect(hu.id).toBe(base.id);
  });

  it("falls back to English for missing locale", () => {
    const es = resolveProviderForLocale(base, "es");
    expect(es.name).toBe("A38 Ship");
  });
});

describe("venue routing keys", () => {
  it("prefers locale slug in path key", () => {
    expect(getVenuePathKey(base, "hu")).toBe("a38-hajo");
    expect(getVenuePathKey(base, "en")).toBe("a38-hajo");
  });

  it("finds provider by id or slug", () => {
    const resolved = [resolveProviderForLocale(base, "hu")];
    expect(findProviderByVenueKey(resolved, base.id)?.name).toBe("A38 Hajó");
    expect(findProviderByVenueKey(resolved, "a38-hajo")?.name).toBe("A38 Hajó");
  });
});
