import { NextRequest, NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { parseAppLocaleParam, resolveProvidersForLocale } from "@/lib/providerLocale";
import { featuredVenueIds, getActivePromotions } from "@/lib/promotionsDb";
import type { Provider } from "@/types/provider";
import { getVertical, providerMatchesVertical } from "@/lib/programVerticals";
import type { ProgramVerticalId } from "@/lib/programVerticals";

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
  const verticalParam = req.nextUrl.searchParams.get("vertical") as ProgramVerticalId | null;
  const rows = (await db.collection(COL.providers).find({}).toArray()) as unknown as (Provider & { _id?: unknown })[];
  let providers = rows.map(stripId);
  const verticalDef = verticalParam ? getVertical(verticalParam) : undefined;
  if (verticalDef) {
    providers = providers.filter((p) => providerMatchesVertical(p, verticalDef));
  }
  const promos = await getActivePromotions(db);
  const featured = featuredVenueIds(promos);
  const promoByTarget = new Map(
    promos.filter((p) => p.type === "featured_venue").map((p) => [p.targetId, p.label]),
  );
  let resolved = resolveProvidersForLocale(providers, locale).map((p) => ({
    ...p,
    promotionLabel: promoByTarget.get(p.id),
    isPromoted: featured.has(p.id),
    badges: featured.has(p.id)
      ? [...new Set([...(p.badges ?? []), "Featured"])]
      : p.badges,
  }));
  resolved = resolved.sort((a, b) => {
    const ap = a.isPromoted ? 0 : 1;
    const bp = b.isPromoted ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return a.name.localeCompare(b.name);
  });
  return NextResponse.json(resolved, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
