import { describe, expect, it } from "vitest";
import {
  isMenuBoardTag,
  menuBoardTagsForKind,
  menuTagMatchesItemKind,
  MENU_TAGS_VENUE,
} from "@/data/menuTags";

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

describe("menuTagMatchesItemKind", () => {
  it("rejects venue vibe tags on items", () => {
    expect(menuTagMatchesItemKind("ruin-bar", "food")).toBe(false);
    expect(isMenuBoardTag("ruin-bar")).toBe(false);
  });

  it("keeps food and drink tags aligned with item kind", () => {
    expect(menuTagMatchesItemKind("goulash", "food")).toBe(true);
    expect(menuTagMatchesItemKind("goulash", "drink")).toBe(false);
    expect(menuTagMatchesItemKind("beer", "drink")).toBe(true);
    expect(menuTagMatchesItemKind("beer", "food")).toBe(false);
  });
});
