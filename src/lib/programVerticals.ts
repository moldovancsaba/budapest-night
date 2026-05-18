import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";

type ActivityType = string;

export type ProgramVerticalId = "mozi" | "szinhaz" | "kiallitas" | "koncert" | "csalad";

export type ProgramVertical = {
  id: ProgramVerticalId;
  activityTypes: ActivityType[];
  eventActivityTypes: ActivityType[];
  ageRanges?: string[];
};

export const PROGRAM_VERTICALS: ProgramVertical[] = [
  {
    id: "mozi",
    activityTypes: ["Cinema", "Theatre"],
    eventActivityTypes: ["Live Music", "Festival"],
  },
  {
    id: "szinhaz",
    activityTypes: ["Theatre"],
    eventActivityTypes: ["Theatre", "Live Music"],
  },
  {
    id: "kiallitas",
    activityTypes: ["Gallery", "Exhibition"],
    eventActivityTypes: ["Gallery", "Exhibition", "Festival"],
  },
  {
    id: "koncert",
    activityTypes: ["Live Music", "Jazz", "Electronic"],
    eventActivityTypes: ["Live Music", "Jazz", "Electronic", "Festival"],
  },
  {
    id: "csalad",
    activityTypes: ["Coffee & Brunch", "Thermal Bath", "Gallery"],
    eventActivityTypes: ["Festival", "Live Music"],
    ageRanges: ["All ages", "Family"],
  },
];

export function getVertical(id: string): ProgramVertical | undefined {
  return PROGRAM_VERTICALS.find((v) => v.id === id);
}

export function providerMatchesVertical(p: Provider, vertical: ProgramVertical): boolean {
  const acts = p.activityTypes ?? [];
  if (vertical.activityTypes.some((a) => acts.includes(a))) return true;
  if (vertical.id === "mozi" && acts.some((a) => /cinema|mozi/i.test(a))) return true;
  if (vertical.id === "csalad" && (p.ageRanges ?? []).some((a) => vertical.ageRanges?.includes(a)))
    return true;
  return false;
}

export function eventMatchesVertical(e: NightEvent, vertical: ProgramVertical): boolean {
  const acts = e.activityTypes ?? [];
  if (vertical.eventActivityTypes.some((a) => acts.includes(a))) return true;
  if (vertical.id === "csalad" && (e.ageRanges ?? []).some((a) => vertical.ageRanges?.includes(a)))
    return true;
  return false;
}
