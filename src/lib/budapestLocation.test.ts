import { describe, expect, it } from "vitest";
import { CANONICAL_VENUE_LOCATIONS, resolveProviderLocation } from "@/lib/budapestLocation";

describe("resolveProviderLocation", () => {
  it("fixes MVM Dome away from Kelenföld / Infopark address", () => {
    const loc = resolveProviderLocation({
      id: "prov-mvm-dome-ujbuda",
      borough: "Újbuda",
      neighborhood: "Kelenföld",
      address: "1117 Budapest, Magyar tudósok körútja 3, Hungary",
    });
    expect(loc.borough).toBe("Terézváros");
    expect(loc.neighborhood).toBe("Stefánia út");
    expect(loc.address).toBe(CANONICAL_VENUE_LOCATIONS["prov-mvm-dome-ujbuda"].address);
  });

  it("maps Budapest Park café listing away from Óbuda Island", () => {
    const loc = resolveProviderLocation({
      id: "prov-cov-island-cafe-obuda",
      borough: "Óbuda",
      neighborhood: "Óbuda Island",
      address: "1095 Budapest, Fábián Juli tér 1, Hungary",
    });
    expect(loc.borough).toBe("Ferencváros");
    expect(loc.neighborhood).toBe("Fábián Juli");
  });
});
