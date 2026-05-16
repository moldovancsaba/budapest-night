/** Where `rating` / `reviewCount` on a provider were last synced from. */
export type ReviewsSource = "osm" | "budapest-night";

export type ProviderReviewsMeta = {
  /** OSM element ref, e.g. `node/419017259` or `way/123`. */
  osmPlaceRef?: string;
  reviewsSource?: ReviewsSource;
  /** ISO date (YYYY-MM-DD) of last successful sync. */
  reviewsSyncedAt?: string;
  /** Public place page (OpenStreetMap). */
  reviewsProfileUrl?: string;
};
