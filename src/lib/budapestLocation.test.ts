import { describe, expect, it } from "vitest";
import {
  CANONICAL_VENUE_LOCATIONS,
  resolveLegacyProviderId,
  resolveProviderLocation,
} from "@/lib/budapestLocation";
import { findProviderByVenueKey } from "@/lib/providerLocale";

describe("resolveProviderLocation", () => {
  it("fixes MVM Dome away from Kelenföld / Infopark address", () => {
    const loc = resolveProviderLocation({
      id: "prov-mvm-dome-terezvaros",
      borough: "Újbuda",
      neighborhood: "Kelenföld",
      address: "1117 Budapest, Magyar tudósok körútja 3, Hungary",
    });
    expect(loc.borough).toBe("Terézváros");
    expect(loc.neighborhood).toBe("Stefánia út");
    expect(loc.address).toBe(CANONICAL_VENUE_LOCATIONS["prov-mvm-dome-terezvaros"].address);
  });

  it("maps retired provider ids to canonical ids", () => {
    expect(resolveLegacyProviderId("prov-budapest-park-obuda")).toBe("prov-budapest-park-ferencvaros");
    expect(resolveLegacyProviderId("prov-mvm-dome-ujbuda")).toBe("prov-mvm-dome-terezvaros");
    expect(resolveLegacyProviderId("prov-cov-island-cafe-obuda")).toBe("prov-cov-island-cafe-ferencvaros");
    expect(resolveLegacyProviderId("prov-cov-rudas-ujbuda-party")).toBe("prov-cov-rudas-buda-party");
  });

  it("resolves venue URLs that still use retired provider ids", () => {
    const providers = [
      {
        id: "prov-budapest-park-ferencvaros",
        name: "Budapest Park",
        borough: "Ferencváros",
        locales: { en: { slug: "budapest-park" } },
      },
    ] as Parameters<typeof findProviderByVenueKey>[0];
    expect(findProviderByVenueKey(providers, "prov-budapest-park-obuda")?.id).toBe(
      "prov-budapest-park-ferencvaros",
    );
  });

  it("maps Budapest Park café listing away from Óbuda Island", () => {
    const loc = resolveProviderLocation({
      id: "prov-cov-island-cafe-ferencvaros",
      borough: "Óbuda",
      neighborhood: "Óbuda Island",
      address: "1095 Budapest, Fábián Juli tér 1, Hungary",
    });
    expect(loc.borough).toBe("Ferencváros");
    expect(loc.neighborhood).toBe("Fábián Juli");
  });
});
