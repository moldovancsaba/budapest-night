/** Shared with ingest automation + Zod curator schema (keep in sync). */
export const CURATOR_CATEGORIES = ["Venues", "Parties", "Restaurants", "Cafés"] as const;
export const CURATOR_BOROUGHS = [
  "Belváros",
  "Terézváros",
  "Erzsébetváros",
  "Ferencváros",
  "Buda",
  "Óbuda",
  "Újbuda",
] as const;
export const CURATOR_AGE_RANGES = ["All ages", "Family", "18+", "21+", "Late night"] as const;
export const CURATOR_DAY_TAGS = ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"] as const;
export const CURATOR_BADGES = [
  "Featured",
  "Popular",
  "New",
  "Staff Pick",
  "Hidden Gem",
  "Weekend Vibes",
] as const;

export const CURATOR_SEARCH_QUERIES = [
  "Budapest ruin bar official opening hours",
  "Budapest rooftop restaurant official reservation",
  "Budapest electronic music club official tickets",
  "Jewish Quarter Budapest bar official site",
  "Budapest thermal bath spa official admission",
  "Budapest Danube boat party official booking",
  "Budapest art gallery exhibition official",
] as const;
