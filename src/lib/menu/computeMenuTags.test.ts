import { describe, expect, it } from "vitest";
import { computeMenuTagsFromMenu } from "./computeMenuTags";

describe("computeMenuTagsFromMenu", () => {
  it("collects unique tags from sections and events", () => {
    const tags = computeMenuTagsFromMenu(
      {
        sourceUrls: ["https://example.com/menu"],
        lastVerifiedAt: "2026-05-16",
        sections: [
          {
            id: "drinks",
            title: "Drinks",
            kind: "drink",
            items: [
              { id: "1", kind: "drink", name: "Pálinka shot", tags: ["palinka", "wine"] },
            ],
          },
        ],
      },
      [
        {
          id: "ev1",
          title: "Friday night",
          items: [{ id: "2", kind: "drink", name: "Craft beer", tags: ["craft-beer", "invalid-tag"] }],
        },
      ],
    );
    expect(tags).toEqual(["craft-beer", "palinka", "wine"]);
  });
});
