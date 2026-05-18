import { describe, expect, it } from "vitest";
import {
  eventsInWeek,
  getCurrentWeekId,
  getWeekBounds,
} from "./programWeekCalendar";

describe("programWeekCalendar", () => {
  it("uses Thursday-start week id format", () => {
    const thu = new Date("2026-05-14T12:00:00+02:00");
    expect(getCurrentWeekId(thu)).toBe("2026-05-14");
  });

  it("bounds span seven days", () => {
    const { startsAt, endsAt } = getWeekBounds("2026-05-14");
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
    expect(end - start).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
    expect(end - start).toBeLessThan(7 * 24 * 60 * 60 * 1000);
  });

  it("eventsInWeek matches event inside bounds", () => {
    const weekId = "2026-05-14";
    const inside = `${weekId}T18:00:00+02:00`;
    expect(eventsInWeek(inside, weekId)).toBe(true);
    expect(eventsInWeek("2026-05-01T18:00:00+02:00", weekId)).toBe(false);
  });
});
