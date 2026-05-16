import { describe, expect, it } from "vitest";
import type { Provider } from "@/types/provider";
import {
  getCanonicalVenueSlug,
  legacyVenuePathKeys,
  sanitizeVenueSlug,
  venuePathKeyForLocale,
} from "./venueSlug";

const budapestPark: Provider = {
  id: "prov-budapest-park-ferencvaros",
  name: "Budapest Park",
  category: "Venues",
  borough: "Ferencváros",
  neighborhood: "Fábián Juli",
  address: "1095 Budapest",
  activityTypes: [],
  ageRanges: ["18+"],
  dayTimeTags: [],
  pricePerClass: 0,
  shortDescription: "",
  longDescription: "",
  rating: 0,
  reviewCount: 0,
  badges: [],
  image: "",
  email: "",
  website: "",
  phone: "",
  locales: {
    hu: { slug: "budapest-park", name: "Budapest Park" },
  },
};

describe("venueSlug", () => {
  it("canonical slug drops wrong district from id", () => {
    expect(getCanonicalVenueSlug(budapestPark)).toBe("budapest-park");
    expect(venuePathKeyForLocale(budapestPark, "en")).toBe("budapest-park");
  });

  it("sanitizes misleading obuda token for Ferencváros", () => {
    expect(sanitizeVenueSlug("park-party-obuda-hu", "Ferencváros")).toBe("park-party-hu");
  });

  it("legacy keys include provider id and canonical slug", () => {
    const keys = legacyVenuePathKeys(budapestPark);
    expect(keys).toContain("prov-budapest-park-ferencvaros");
    expect(keys).toContain("budapest-park");
  });
});
