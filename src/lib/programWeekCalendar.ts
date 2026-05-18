/**
 * Program week runs Thursday 00:00 → Wednesday 23:59:59 (Europe/Budapest).
 */
const TZ = "Europe/Budapest";

function budapestParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    y: Number(get("year")),
    m: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  };
}

function utcFromBudapest(y: number, m: number, day: number, hour = 0) {
  const guess = new Date(Date.UTC(y, m - 1, day, hour - 1, 0, 0));
  const off = new Intl.DateTimeFormat("en", {
    timeZone: TZ,
    timeZoneName: "shortOffset",
  })
    .formatToParts(guess)
    .find((p) => p.type === "timeZoneName")?.value;
  const match = off?.match(/GMT([+-])(\d+)/);
  const hours = match ? Number(match[2]) * (match[1] === "+" ? 1 : -1) : 1;
  return new Date(Date.UTC(y, m - 1, day, hour - hours, 0, 0));
}

const WEEKDAY_INDEX: Record<string, number> = {
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
};

export function getCurrentWeekId(at = new Date()): string {
  const { y, m, day, weekday } = budapestParts(at);
  const wIdx = WEEKDAY_INDEX[weekday] ?? 0;
  const daysSinceThu = (wIdx + 7 - 4) % 7;
  const thuDay = day - daysSinceThu;
  const thu = utcFromBudapest(y, m, thuDay);
  const p = budapestParts(thu);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function getWeekBounds(weekId: string): { startsAt: string; endsAt: string } {
  const [y, m, d] = weekId.split("-").map(Number);
  const start = utcFromBudapest(y, m, d, 0);
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

export function eventsInWeek(
  startsAt: string,
  weekId: string,
): boolean {
  const { startsAt: wStart, endsAt: wEnd } = getWeekBounds(weekId);
  const t = new Date(startsAt).getTime();
  return t >= new Date(wStart).getTime() && t <= new Date(wEnd).getTime();
}
