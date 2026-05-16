import { describe, expect, it } from "vitest";
import { amountToHuf, formatHufAsDisplay, hufToDisplayAmount } from "./currency";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";

describe("amountToHuf", () => {
  it("treats legacy small EUR amounts as euro", () => {
    expect(amountToHuf(25, "EUR", DEFAULT_CURRENCY_RATES)).toBe(8750);
  });

  it("keeps large HUF ticket amounts", () => {
    expect(amountToHuf(26999, "HUF", DEFAULT_CURRENCY_RATES)).toBe(26999);
  });
});

describe("formatHufAsDisplay", () => {
  it("formats HUF", () => {
    expect(formatHufAsDisplay(8750, "HUF", "en", DEFAULT_CURRENCY_RATES)).toMatch(/8,750 Ft/);
  });

  it("converts to EUR", () => {
    expect(formatHufAsDisplay(8750, "EUR", "en", DEFAULT_CURRENCY_RATES)).toBe("€25");
  });

  it("converts to USD", () => {
    expect(formatHufAsDisplay(9000, "USD", "en", DEFAULT_CURRENCY_RATES)).toBe("$30");
  });
});

describe("hufToDisplayAmount", () => {
  it("divides by configured rates", () => {
    expect(hufToDisplayAmount(350, "EUR", DEFAULT_CURRENCY_RATES)).toBe(1);
    expect(hufToDisplayAmount(300, "USD", DEFAULT_CURRENCY_RATES)).toBe(1);
  });
});
