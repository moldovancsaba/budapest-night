import type { MeetupCadence, MeetupGroupType } from "@/types/meetup";

export const MEETUP_GROUP_TYPE_KEY: Record<MeetupGroupType, string> = {
  "Art & Gallery": "artGallery",
  "Live Culture": "liveCulture",
  "Food & Wine Circle": "foodWine",
  "Nightlife Crew": "nightlifeCrew",
  "Local Creators": "localCreators",
};

export const MEETUP_CADENCE_KEY: Record<MeetupCadence, string> = {
  Weekly: "weekly",
  Monthly: "monthly",
  Weekend: "weekend",
  "Pop-up": "popup",
};
