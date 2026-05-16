import type { Borough } from "./provider";
import type { EventStatus } from "./event";
import type { VenueLink } from "./venueLink";

export type MeetupGroupType =
  | "Art & Gallery"
  | "Live Culture"
  | "Food & Wine Circle"
  | "Nightlife Crew"
  | "Local Creators";

export type MeetupCadence = "Weekly" | "Monthly" | "Weekend" | "Pop-up";

export type MeetupAgeRange = "All ages" | "18+" | "21+" | "Family" | "Late night";

export type MeetupIcon = "stroller" | "skyline" | "heart" | "coffee" | "playground" | "community";

/** Denormalized timed event snapshot for culture circles that organize shows. */
export type MeetupEventLink = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  borough: Borough;
  neighborhood: string;
  status: EventStatus;
};

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
  /** Host venues this circle meets at or organizes at (prov-*). */
  venueIds?: string[];
  /** Timed events this circle organizes (event-*). */
  eventIds?: string[];
  /** Venue snapshots — set on ingest; do not author manually. */
  venueLinks?: VenueLink[];
  /** Event snapshots — set on ingest; do not author manually. */
  eventLinks?: MeetupEventLink[];
}
