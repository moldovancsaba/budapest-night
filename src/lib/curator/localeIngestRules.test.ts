import { describe, expect, it } from "vitest";
import {
  PROVIDER_INGEST_LOCALES,
  validateProviderLocalesForIngest,
} from "@/lib/curator/localeIngestRules";

const validEntry = {
  name: "Test Venue",
  shortDescription: "Short copy for the venue card in this language.",
  longDescription:
    "Longer marketing copy with facts from the official site only.\n\nSources: https://example.hu/",
  slug: "test-venue-hu",
};

describe("validateProviderLocalesForIngest", () => {
  it("requires all non-English ingest locales", () => {
    const errors = validateProviderLocalesForIngest(undefined, "doc");
    expect(errors.some((e) => e.includes("hu"))).toBe(true);
    expect([...PROVIDER_INGEST_LOCALES].sort()).toEqual(["ar", "es", "he", "hu", "it"]);
  });

  it("accepts a full locales map", () => {
    const locales = Object.fromEntries(
      PROVIDER_INGEST_LOCALES.map((code) => [code, { ...validEntry, slug: `test-${code}` }]),
    );
    expect(validateProviderLocalesForIngest(locales, "doc")).toEqual([]);
  });

  it("rejects activityTypes inside a locale", () => {
    const locales = Object.fromEntries(
      PROVIDER_INGEST_LOCALES.map((code) => [
        code,
        { ...validEntry, slug: `test-${code}`, activityTypes: ["Live Music"] },
      ]),
    );
    const errors = validateProviderLocalesForIngest(locales, "doc");
    expect(errors.some((e) => e.includes("activityTypes"))).toBe(true);
  });
});
