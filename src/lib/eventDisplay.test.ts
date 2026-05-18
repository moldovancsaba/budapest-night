import { describe, expect, it } from "vitest";
import { formatEntryFee, formatEventDateRange, isUpcoming, lowestEntryFee } from "./eventDisplay";

describe("eventDisplay", () => {
  it("formats date range in Budapest timezone", () => {
    const { dateLine, timeLine } = formatEventDateRange(
      {
        startsAt: "2026-08-01T20:00:00+02:00",
        endsAt: "2026-08-01T23:30:00+02:00",
        timezone: "Europe/Budapest",
      },
      "en-GB",
    );
    expect(dateLine).toContain("2026");
    expect(timeLine).toMatch(/\d{2}:\d{2}/);
  });

  it("detects upcoming events", () => {
    expect(isUpcoming({ endsAt: "2099-01-01T00:00:00+01:00", status: "scheduled" })).toBe(
      true,
    );
    expect(isUpcoming({ endsAt: "2020-01-01T00:00:00+01:00", status: "scheduled" })).toBe(
      false,
    );
    expect(isUpcoming({ endsAt: "2099-01-01T00:00:00+01:00", status: "archived" })).toBe(
      false,
    );
  });

  it("formats HUF entry fees without euro symbol", () => {
    expect(
      formatEntryFee(
        { id: "ga", label: "GA", amount: 26999, currency: "HUF", source: "published" },
        "en",
      ),
    ).toBe("26,999 Ft");
  });

  it("picks lowest entry fee", () => {
    const low = lowestEntryFee([
      { id: "a", label: "VIP", amount: 120, currency: "EUR", source: "published" },
      { id: "b", label: "GA", amount: 45, currency: "EUR", source: "published" },
    ]);
    expect(low?.amount).toBe(45);
  });
});
