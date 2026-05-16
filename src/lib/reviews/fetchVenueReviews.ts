import type { Db } from "mongodb";
import { COL } from "@/lib/mongodb";
import type { Provider } from "@/types/provider";
import type { VenueReview, VenueReviewsPayload } from "@/types/venueReview";
import { ensureVenueReviewIndexes, toPublicReview } from "@/lib/reviews/aggregateProviderReviews";

export async function fetchVenueReviews(
  db: Db,
  providerId: string,
  reviewerId?: string,
  limit = 20,
): Promise<VenueReviewsPayload | null> {
  await ensureVenueReviewIndexes(db);

  const provider = (await db.collection(COL.providers).findOne({ id: providerId })) as unknown as Provider | null;
  if (!provider) return null;

  const rows = (await db
    .collection(COL.venueReviews)
    .find({ providerId, status: "published" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()) as unknown as VenueReview[];

  let mine: VenueReview | null = null;
  if (reviewerId) {
    mine = (await db.collection(COL.venueReviews).findOne({
      providerId,
      reviewerId,
      status: "published",
    })) as unknown as VenueReview | null;
  }

  const reviewsSource =
    provider.reviewsSource === "budapest-night" && provider.reviewCount > 0
      ? "budapest-night"
      : null;

  return {
    summary: {
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      reviewsSource,
    },
    reviews: rows.map(toPublicReview),
    mine: mine ? toPublicReview(mine) : null,
  };
}
