import type { AppLocale } from "@/i18n/config";

export type VenueReviewStatus = "published" | "hidden";

export interface VenueReview {
  id: string;
  providerId: string;
  /** Anonymous visitor id from browser localStorage. */
  reviewerId: string;
  displayName: string;
  /** Whole stars 1–5. */
  rating: number;
  body: string;
  locale: AppLocale;
  status: VenueReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export type PublicVenueReview = Pick<
  VenueReview,
  "id" | "displayName" | "rating" | "body" | "createdAt"
>;

export type VenueReviewsSummary = {
  rating: number;
  reviewCount: number;
  reviewsSource: "budapest-night" | null;
};

export type VenueReviewsPayload = {
  summary: VenueReviewsSummary;
  reviews: PublicVenueReview[];
  mine: PublicVenueReview | null;
};
