import { NextRequest, NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { parseAppLocaleParam, resolveProvidersForLocale } from "@/lib/providerLocale";
import { featuredVenueIds, getActivePromotions } from "@/lib/promotionsDb";
import type { Provider } from "@/types/provider";

function stripId<T extends object>(doc: T): T {
  const o = { ...doc } as Record<string, unknown>;
  delete o._id;
  return o as T;
}

export async function GET(req: NextRequest) {
  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured (MONGODB_URI)" }, { status: 503 });
  }
  const locale = parseAppLocaleParam(req.nextUrl.searchParams.get("locale"));
  const rows = (await db.collection(COL.providers).find({}).toArray()) as unknown as (Provider & { _id?: unknown })[];
  const providers = rows.map(stripId);
  const promos = await getActivePromotions(db);
  const featured = featuredVenueIds(promos);
  const promoByTarget = new Map(
    promos.filter((p) => p.type === "featured_venue").map((p) => [p.targetId, p.label]),
  );
  const resolved = resolveProvidersForLocale(providers, locale).map((p) => ({
    ...p,
    promotionLabel: promoByTarget.get(p.id),
    isPromoted: featured.has(p.id),
    badges: featured.has(p.id)
      ? [...new Set([...(p.badges ?? []), "Featured"])]
      : p.badges,
  }));
  return NextResponse.json(resolved, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
