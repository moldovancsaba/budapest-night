import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildOsmSearchQuery,
  parseOsmPlaceRef,
  ratingFromOsmTags,
  wikidataReviewScore,
} from "@/lib/reviews/openstreetmap";

describe("openstreetmap reviews", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("buildOsmSearchQuery adds Budapest when missing", () => {
    expect(buildOsmSearchQuery("Szimpla Kert", "Kazinczy 14")).toContain("Budapest");
  });

  it("parseOsmPlaceRef accepts node/way/relation", () => {
    expect(parseOsmPlaceRef("node/419017259")).toEqual({ type: "node", id: 419017259 });
  });

  it("ratingFromOsmTags reads stars and review count", () => {
    expect(ratingFromOsmTags({ stars: "4", "review:count": "120" })).toEqual({
      rating: 4,
      reviewCount: 120,
    });
  });

  it("wikidataReviewScore parses P444", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          entities: {
            Q1: {
              claims: {
                P444: [{ mainsnak: { datavalue: { value: 4.2 } } }],
              },
            },
          },
        }),
      }),
    );
    const score = await wikidataReviewScore("Q1");
    expect(score.rating).toBe(4.2);
  });
});
