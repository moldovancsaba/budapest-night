import { describe, expect, it } from "vitest";
import {
  resolveLocationFromRegistry,
  validateProviderLocationForIngest,
} from "@/lib/curator/locationIngestRules";
import { resolveProviderLocation } from "@/lib/budapestLocation";

describe("location registry", () => {
  it("resolves 1124 Csörsz to Buda / MOM Park (XII. ker., not Ferencváros)", () => {
    const loc = resolveLocationFromRegistry({
      id: "prov-cov-cafe-mom-infopark",
      address: "1124 Budapest, Csörsz utca 18, Hungary",
    });
    expect("error" in loc).toBe(false);
    if ("error" in loc) return;
    expect(loc.borough).toBe("Buda");
    expect(loc.neighborhood).toBe("MOM Park");
    expect(loc.kerulet).toBe("XII");
  });

  it("resolveProviderLocation matches registry for MOM", () => {
    const loc = resolveProviderLocation({
      id: "prov-cov-cafe-mom-infopark",
      borough: "Újbuda",
      neighborhood: "Infopark",
      address: "1124 Budapest, Csörsz utca 18, Hungary",
    });
    expect(loc.borough).toBe("Buda");
    expect(loc.neighborhood).toBe("MOM Park");
  });

  it("rejects Infopark labeling on Csörsz at ingest", () => {
    const errors = validateProviderLocationForIngest(
      {
        id: "prov-cov-cafe-mom-infopark",
        borough: "Újbuda",
        neighborhood: "Infopark",
        address: "1124 Budapest, Csörsz utca 18, Hungary",
        longDescription: "Infopark workers. Sources: https://momkult.hu/",
      },
      "doc",
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
