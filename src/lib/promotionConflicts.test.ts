import { describe, expect, it } from "vitest";
import { findPromotionConflicts } from "./promotionConflicts";
import type { PromotionDoc } from "@/types/promotion";

const base: PromotionDoc = {
  _id: "a",
  type: "featured_venue",
  targetId: "prov-1",
  label: "A",
  startsAt: "2026-05-01T00:00:00.000Z",
  endsAt: "2026-05-31T23:59:59.000Z",
  priority: 1,
};

describe("findPromotionConflicts", () => {
  it("flags duplicate target overlap", () => {
    const warnings = findPromotionConflicts([base], {
      type: "featured_venue",
      targetId: "prov-1",
      label: "B",
      startsAt: "2026-05-10T00:00:00.000Z",
      endsAt: "2026-05-20T00:00:00.000Z",
      priority: 2,
    });
    expect(warnings.some((w) => w.includes("Duplicate"))).toBe(true);
  });

  it("flags second week sponsor", () => {
    const sponsor: PromotionDoc = { ...base, _id: "s", type: "week_sponsor", targetId: "https://x.hu" };
    const warnings = findPromotionConflicts([sponsor], {
      type: "week_sponsor",
      targetId: "https://y.hu",
      label: "Y",
      startsAt: "2026-05-05T00:00:00.000Z",
      endsAt: "2026-05-25T00:00:00.000Z",
      priority: 1,
    });
    expect(warnings.some((w) => w.includes("week_sponsor"))).toBe(true);
  });
});
