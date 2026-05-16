import type { Db } from "mongodb";
import { COL } from "@/lib/mongodb";
import type { Provider } from "@/types/provider";
import type { VenueReview } from "@/types/venueReview";

let indexesReady: Promise<void> | null = null;

export async function ensureVenueReviewIndexes(db: Db): Promise<void> {
  if (!indexesReady) {
    indexesReady = (async () => {
      await db.collection(COL.venueReviews).createIndexes([
        { key: { providerId: 1, reviewerId: 1 }, unique: true },
        { key: { providerId: 1, status: 1, createdAt: -1 } },
        { key: { reviewerId: 1, createdAt: -1 } },
      ]);
    })();
  }
  await indexesReady;
}

export function roundRating(avg: number): number {
  return Math.round(avg * 10) / 10;
}

/** Recompute denormalized provider.rating / reviewCount from published community reviews. */
export async function reaggregateProviderReviews(
  db: Db,
  providerId: string,
): Promise<{ rating: number; reviewCount: number }> {
  await ensureVenueReviewIndexes(db);

  const rows = await db
    .collection(COL.venueReviews)
    .aggregate<{ _id: null; avg: number; count: number }>([
      { $match: { providerId, status: "published" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ])
    .toArray();

  const reviewCount = rows[0]?.count ?? 0;
  const rating = reviewCount > 0 ? roundRating(rows[0]?.avg ?? 0) : 0;

  const patch: Partial<Provider> = {
    rating,
    reviewCount,
    reviewsSource: reviewCount > 0 ? "budapest-night" : undefined,
  };

  if (reviewCount === 0) {
    await db.collection(COL.providers).updateOne(
      { id: providerId },
      {
        $set: { rating: 0, reviewCount: 0 },
        $unset: { reviewsSource: "" },
      },
    );
  } else {
    await db.collection(COL.providers).updateOne({ id: providerId }, { $set: patch });
  }

  return { rating, reviewCount };
}

export function toPublicReview(row: VenueReview) {
  return {
    id: row.id,
    displayName: row.displayName,
    rating: row.rating,
    body: row.body,
    createdAt: row.createdAt,
  };
}
