import type { Borough } from "./provider";

export type MeetupGroupType =
  | "Art & Gallery"
  | "Live Culture"
  | "Food & Wine Circle"
  | "Nightlife Crew"
  | "Local Creators";

export type MeetupCadence = "Weekly" | "Monthly" | "Weekend" | "Pop-up";

export type MeetupAgeRange = "All ages" | "18+" | "21+" | "Family" | "Late night";

export type MeetupIcon = "stroller" | "skyline" | "heart" | "coffee" | "playground" | "community";

export interface MeetupGroup {
  id: string;
  name: string;
  borough: Borough;
  neighborhood: string;
  groupType: MeetupGroupType;
  ageRange: MeetupAgeRange;
  cadence: MeetupCadence;
  instagram: string;
  website: string;
  description: string;
  initials: string;
  icon: MeetupIcon;
  palette: "teal" | "orange" | "beige" | "charcoal";
  coverImageUrl?: string;
}
