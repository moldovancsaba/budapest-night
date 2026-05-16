import { describe, expect, it } from "vitest";
import {
  BANNED_IMGBB_HASHES,
  getImageIngestRulesForPrompt,
  getMeetupCoverImageIngestRulesForPrompt,
  getProviderImageIngestRulesForPrompt,
} from "./imageIngestRules";

describe("imageIngestRules", () => {
  it("documents banned hashes from production incidents", () => {
    expect(BANNED_IMGBB_HASHES).toContain("cde3b78d5c56");
    expect(BANNED_IMGBB_HASHES).toContain("cb56a463140e");
  });

  it("exports prompt blocks for providers and meetups", () => {
    expect(getProviderImageIngestRulesForPrompt()).toMatch(/provider listing image/i);
    expect(getMeetupCoverImageIngestRulesForPrompt()).toMatch(/coverImageUrl/i);
    expect(getImageIngestRulesForPrompt()).toMatch(/Catalog-wide image uniqueness/i);
  });
});
