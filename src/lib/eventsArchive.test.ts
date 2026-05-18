import { describe, expect, it } from "vitest";
import { isEventFinished, isPubliclyListedEvent } from "./eventsArchive";
import { isUpcoming } from "./eventDisplay";

describe("eventsArchive", () => {
  it("detects finished events", () => {
    expect(
      isEventFinished({ endsAt: "2020-01-01T12:00:00+01:00", timezone: "Europe/Budapest" }),
    ).toBe(true);
    expect(
      isEventFinished({ endsAt: "2099-01-01T12:00:00+01:00", timezone: "Europe/Budapest" }),
    ).toBe(false);
  });

  it("excludes archived and past from public listing", () => {
    expect(
      isPubliclyListedEvent({
        status: "archived",
        endsAt: "2099-01-01T12:00:00+01:00",
      }),
    ).toBe(false);
    expect(
      isPubliclyListedEvent({
        status: "scheduled",
        endsAt: "2020-01-01T12:00:00+01:00",
      }),
    ).toBe(false);
    expect(
      isPubliclyListedEvent({
        status: "scheduled",
        endsAt: "2099-01-01T12:00:00+01:00",
      }),
    ).toBe(true);
  });

  it("isUpcoming rejects archived status", () => {
    expect(
      isUpcoming({ status: "archived", endsAt: "2099-01-01T12:00:00+01:00" }),
    ).toBe(false);
  });
});
