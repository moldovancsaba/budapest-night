import type { Db } from "mongodb";
import type { Provider } from "@/types/provider";
import { COL } from "@/lib/mongodb";
import {
  isLikelyBudapestPlace,
  resolveOsmPlaceForVenue,
  type OsmPlaceSnapshot,
} from "@/lib/reviews/openstreetmap";

export type SyncProviderReviewsResult =
  | {
      ok: true;
      providerId: string;
      rating: number;
      reviewCount: number;
      osmPlaceRef: string;
      reviewsProfileUrl: string;
      resolvedVia: "ref" | "search";
      hasScore: boolean;
    }
  | { ok: false; providerId: string; error: string };

export type SyncReviewsBatchResult = {
  ok: boolean;
  synced: number;
  skipped: number;
  failed: number;
  results: SyncProviderReviewsResult[];
};

const STALE_DAYS = 7;
/** Nominatim fair-use: max 1 request per second. */
const NOMINATIM_DELAY_MS = 1100;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function isStale(syncedAt?: string): boolean {
  if (!syncedAt) return true;
  const then = Date.parse(`${syncedAt}T00:00:00Z`);
  if (Number.isNaN(then)) return true;
  const ageMs = Date.now() - then;
  return ageMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

async function resolvePlace(provider: Provider): Promise<{
  place: OsmPlaceSnapshot;
  via: "ref" | "search";
} | null> {
  const existingRef = provider.osmPlaceRef?.trim();
  if (existingRef) {
    const place = await resolveOsmPlaceForVenue(
      provider.name,
      provider.address,
      existingRef,
    );
    if (place) return { place, via: "ref" };
  }
  const place = await resolveOsmPlaceForVenue(provider.name, provider.address);
  if (!place || !isLikelyBudapestPlace(place)) return null;
  return { place, via: "search" };
}

export async function syncProviderReviews(
  db: Db,
  provider: Provider,
): Promise<SyncProviderReviewsResult> {
  try {
    const resolved = await resolvePlace(provider);
    if (!resolved) {
      return {
        ok: false,
        providerId: provider.id,
        error: "OpenStreetMap place not found or outside Budapest",
      };
    }
    const { place, via } = resolved;
    const hasScore = place.rating > 0 || place.reviewCount > 0;
    const patch = {
      rating: place.rating,
      reviewCount: place.reviewCount,
      osmPlaceRef: place.osmPlaceRef,
      reviewsSource: "osm" as const,
      reviewsSyncedAt: todayIso(),
      reviewsProfileUrl: place.profileUrl,
    };
    await db.collection(COL.providers).updateOne(
      { id: provider.id },
      {
        $set: patch,
        $unset: { googlePlaceId: "" },
      },
    );
    return {
      ok: true,
      providerId: provider.id,
      rating: patch.rating,
      reviewCount: patch.reviewCount,
      osmPlaceRef: patch.osmPlaceRef,
      reviewsProfileUrl: place.profileUrl,
      resolvedVia: via,
      hasScore,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, providerId: provider.id, error: msg };
  }
}

export async function runReviewsSyncBatch(
  db: Db,
  opts: { limit?: number; force?: boolean; providerId?: string } = {},
): Promise<SyncReviewsBatchResult> {
  const limit = opts.limit ?? 10;
  const filter: Record<string, unknown> = opts.providerId
    ? { id: opts.providerId }
    : {};
  const rows = (await db
    .collection(COL.providers)
    .find(filter)
    .toArray()) as unknown as Provider[];

  const queue = rows
    .filter((p) => {
      if (p.reviewsSource === "budapest-night" && p.reviewCount > 0) return false;
      return opts.force || isStale(p.reviewsSyncedAt) || p.reviewsSource !== "osm";
    })
    .slice(0, limit);

  const results: SyncProviderReviewsResult[] = [];
  let synced = 0;
  let failed = 0;
  for (const provider of queue) {
    const result = await syncProviderReviews(db, provider);
    results.push(result);
    if (result.ok) synced += 1;
    else failed += 1;
    await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS));
  }

  return {
    ok: failed === 0,
    synced,
    skipped: rows.length - queue.length,
    failed,
    results,
  };
}

export function reviewsSyncEnabled(): boolean {
  return process.env.REVIEWS_SYNC_ENABLED === "true";
}
