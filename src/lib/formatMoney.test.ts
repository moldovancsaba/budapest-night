import { describe, expect, it } from "vitest";
import { formatMoneyAmount, providerPriceCurrency } from "./formatMoney";

describe("formatMoneyAmount", () => {
  it("formats HUF with Ft suffix, not euro", () => {
    expect(formatMoneyAmount(26999, "HUF", "hu-HU")).toBe("26 999 Ft");
    expect(formatMoneyAmount(26999, "HUF", "en")).toMatch(/26,999 Ft/);
  });

  it("formats EUR with euro symbol", () => {
    expect(formatMoneyAmount(25, "EUR", "en")).toBe("€25");
  });
});

describe("providerPriceCurrency", () => {
  it("respects explicit currency", () => {
    expect(providerPriceCurrency(100, "HUF")).toBe("HUF");
  });

  it("defaults to EUR", () => {
    expect(providerPriceCurrency(25, undefined)).toBe("EUR");
  });
});
