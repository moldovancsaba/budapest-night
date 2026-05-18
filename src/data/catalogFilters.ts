import type { AgeRange, DayTimeTag } from "@/types/provider";

/** Filter chips on Discover — nightlife & culture tags. */
export const ACTIVITY_TYPES = [
  "Live Music",
  "DJ Sets",
  "Rooftop",
  "Ruin Bar",
  "Fine Dining",
  "Street Food",
  "Wine Bar",
  "Craft Beer",
  "Coffee & Brunch",
  "Gallery",
  "Theatre",
  "Cinema",
  "Exhibition",
  "Festival",
  "Boat Party",
  "Thermal Bath",
  "Jazz",
  "Electronic",
  "Cocktails",
  "Late Kitchen",
  "Family Program",
];

export const AGE_RANGES: AgeRange[] = ["All ages", "Family", "18+", "21+", "Late night"];

export const DAY_TIME_TAGS: DayTimeTag[] = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"];
