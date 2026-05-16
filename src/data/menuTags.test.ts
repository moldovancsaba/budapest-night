import { describe, expect, it } from "vitest";
import { menuBoardTagsForKind, MENU_TAGS_VENUE } from "@/data/menuTags";

describe("menuBoardTagsForKind", () => {
  it("excludes venue vibe tags from menu board", () => {
    const all = menuBoardTagsForKind(null);
    for (const v of MENU_TAGS_VENUE) {
      expect(all).not.toContain(v);
    }
  });

  it("shows only food tags when kind is food", () => {
    const food = menuBoardTagsForKind("food");
    expect(food).toContain("goulash");
    expect(food).not.toContain("beer");
    expect(food).not.toContain("ruin-bar");
  });

  it("shows only drink tags when kind is drink", () => {
    const drink = menuBoardTagsForKind("drink");
    expect(drink).toContain("beer");
    expect(drink).not.toContain("goulash");
    expect(drink).not.toContain("danube-view");
  });
});
