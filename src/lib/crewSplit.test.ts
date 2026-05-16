import { describe, expect, it } from "vitest";
import { computeCrewSplit } from "./crewSplit";

describe("computeCrewSplit", () => {
  it("splits with tip", () => {
    const r = computeCrewSplit(100, 4, 10, false);
    expect(r.tipAmount).toBe(10);
    expect(r.grandTotal).toBe(110);
    expect(r.perPerson).toBe(27.5);
  });

  it("rounds up per person", () => {
    const r = computeCrewSplit(100, 3, 0, true);
    expect(r.perPerson).toBe(34);
    expect(r.perPerson).toBeGreaterThan(r.perPersonRaw);
  });
});
