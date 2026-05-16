import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { fetchVenueReviews } from "@/lib/reviews/fetchVenueReviews";
import { submitVenueReview } from "@/lib/reviews/submitVenueReview";
import { parseAppLocaleParam } from "@/lib/providerLocale";
import { isValidReviewerId } from "@/lib/reviews/venueReviewValidation";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await ctx.params;
  const url = new URL(req.url);
  const reviewerId = url.searchParams.get("reviewerId")?.trim() ?? "";
  if (reviewerId && !isValidReviewerId(reviewerId)) {
    return NextResponse.json({ error: "invalid_reviewer_id" }, { status: 400 });
  }

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const payload = await fetchVenueReviews(
    db,
    providerId,
    reviewerId || undefined,
  );
  if (!payload) {
    return NextResponse.json({ error: "provider_not_found" }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await ctx.params;
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = new URL(req.url);
  const locale = parseAppLocaleParam(
    typeof body.locale === "string" ? body.locale : url.searchParams.get("locale"),
  );

  const result = await submitVenueReview(db, {
    providerId,
    reviewerId: typeof body.reviewerId === "string" ? body.reviewerId : "",
    rating: body.rating,
    displayName: typeof body.displayName === "string" ? body.displayName : undefined,
    body: typeof body.body === "string" ? body.body : undefined,
    locale,
    website: typeof body.website === "string" ? body.website : undefined,
  });

  if (result.ok === false) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    review: result.review,
    summary: { ...result.summary, reviewsSource: "budapest-night" as const },
  });
}
