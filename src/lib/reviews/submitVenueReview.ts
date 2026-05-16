import type { Db } from "mongodb";
import { COL } from "@/lib/mongodb";
import type { AppLocale } from "@/i18n/config";
import type { Provider } from "@/types/provider";
import type { VenueReview } from "@/types/venueReview";
import { reaggregateProviderReviews, toPublicReview } from "@/lib/reviews/aggregateProviderReviews";
import {
  isValidReviewerId,
  parseReviewRating,
  sanitizeDisplayName,
  sanitizeReviewBody,
} from "@/lib/reviews/venueReviewValidation";

const DAILY_REVIEW_LIMIT = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type SubmitVenueReviewInput = {
  providerId: string;
  reviewerId: string;
  rating: unknown;
  displayName?: string;
  body?: string;
  locale: AppLocale;
  /** Honeypot — must be empty. */
  website?: string;
};

export type SubmitVenueReviewResult =
  | { ok: true; review: ReturnType<typeof toPublicReview>; summary: { rating: number; reviewCount: number } }
  | { ok: false; error: string; status: number };

function reviewDocId(providerId: string, reviewerId: string): string {
  return `vrev-${providerId}-${reviewerId}`.slice(0, 120);
}

export async function submitVenueReview(
  db: Db,
  input: SubmitVenueReviewInput,
): Promise<SubmitVenueReviewResult> {
  if (input.website?.trim()) {
    return { ok: false, error: "spam_detected", status: 400 };
  }

  if (!isValidReviewerId(input.reviewerId)) {
    return { ok: false, error: "invalid_reviewer_id", status: 400 };
  }

  const rating = parseReviewRating(input.rating);
  if (rating === null) {
    return { ok: false, error: "invalid_rating", status: 400 };
  }

  const provider = (await db.collection(COL.providers).findOne({
    id: input.providerId,
  })) as unknown as Provider | null;
  if (!provider) {
    return { ok: false, error: "provider_not_found", status: 404 };
  }

  const since = new Date(Date.now() - MS_PER_DAY).toISOString();
  const recentCount = await db.collection(COL.venueReviews).countDocuments({
    reviewerId: input.reviewerId,
    createdAt: { $gte: since },
  });
  const existing = (await db.collection(COL.venueReviews).findOne({
    providerId: input.providerId,
    reviewerId: input.reviewerId,
  })) as unknown as VenueReview | null;

  if (!existing && recentCount >= DAILY_REVIEW_LIMIT) {
    return { ok: false, error: "rate_limit", status: 429 };
  }

  const now = new Date().toISOString();
  const doc: VenueReview = {
    id: reviewDocId(input.providerId, input.reviewerId),
    providerId: input.providerId,
    reviewerId: input.reviewerId,
    displayName: sanitizeDisplayName(input.displayName ?? ""),
    rating,
    body: sanitizeReviewBody(input.body ?? ""),
    locale: input.locale,
    status: "published",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.collection(COL.venueReviews).replaceOne(
    { providerId: input.providerId, reviewerId: input.reviewerId },
    doc,
    { upsert: true },
  );

  const summary = await reaggregateProviderReviews(db, input.providerId);
  return { ok: true, review: toPublicReview(doc), summary };
}
