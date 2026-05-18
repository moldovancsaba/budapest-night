import { eventsInWeek } from "@/lib/programWeekCalendar";
import type { PublicNightEvent } from "@/lib/publicEvent";

/** Split editorial featured IDs into this-week vs later spotlight slots. */
export function splitFeaturedProgramEvents(
  featuredIds: string[],
  upcoming: PublicNightEvent[],
  weekId: string,
): { thisWeek: PublicNightEvent[]; spotlight: PublicNightEvent[] } {
  if (!featuredIds.length) {
    return { thisWeek: upcoming.filter((e) => eventsInWeek(e.startsAt, weekId)).slice(0, 8), spotlight: [] };
  }

  const ordered = featuredIds
    .map((id) => upcoming.find((e) => e.id === id))
    .filter((e): e is PublicNightEvent => !!e);

  const thisWeek: PublicNightEvent[] = [];
  const spotlight: PublicNightEvent[] = [];
  for (const e of ordered) {
    if (eventsInWeek(e.startsAt, weekId)) {
      thisWeek.push({ ...e, outsideProgramWeek: false });
    } else {
      spotlight.push({ ...e, outsideProgramWeek: true });
    }
  }
  return { thisWeek, spotlight };
}
