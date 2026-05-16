import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { TOUR_TEMPLATES } from "@/data/tourTemplates";
import { countEligibleForTour, isTourReady } from "@/lib/menu/generateTour";
import { filterFlatMenuItems, flattenProviderMenu } from "@/lib/menu/flattenMenuItems";
import type { Provider } from "@/types/provider";
import type { Borough, BoroughChoice } from "@/types/provider";
import { isMenuTag } from "@/data/menuTags";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag");
  const q = url.searchParams.get("q");
  const kind = url.searchParams.get("kind") as "food" | "drink" | "other" | null;
  const borough = url.searchParams.get("borough") as Borough | "All" | null;
  const categories = url.searchParams.get("categories")?.split(",").filter(Boolean) ?? null;

  if (tag && !isMenuTag(tag)) {
    return NextResponse.json({ error: "invalid tag" }, { status: 400 });
  }

  const db = await getDb();
  if (!db) return NextResponse.json({ items: [], providersWithMenu: 0 });

  const providers = (await db.collection(COL.providers).find({}).toArray()) as unknown as Provider[];
  const withMenu = providers.filter((p) => (p.menu?.sections?.length ?? 0) > 0 || (p.eventOfferings?.length ?? 0) > 0);
  let flat = withMenu.flatMap((p) => flattenProviderMenu(p));

  flat = filterFlatMenuItems(flat, {
    tag,
    q,
    kind: kind ?? null,
    categories: categories as Provider["category"][] | null,
    borough: (borough as BoroughChoice) ?? null,
  });

  const limit = Math.min(Number(url.searchParams.get("limit") ?? 120), 500);
  const items = flat.slice(0, limit).map((row) => ({
    id: `${row.providerId}:${row.item.id}`,
    name: row.item.name,
    kind: row.item.kind,
    tags: row.item.tags,
    price: row.item.price ?? null,
    providerId: row.providerId,
    providerName: row.providerName,
    category: row.category,
    borough: row.borough,
    neighborhood: row.neighborhood,
    sectionTitle: row.sectionTitle,
    source: row.source,
    eventTitle: row.eventTitle ?? null,
  }));

  const tourReadiness: Record<string, { eligible: number; ready: boolean; stopCount: number }> = {};
  for (const tpl of TOUR_TEMPLATES) {
    tourReadiness[tpl.id] = {
      eligible: countEligibleForTour(providers, tpl.id),
      ready: isTourReady(providers, tpl.id),
      stopCount: tpl.stopCount,
    };
  }

  return NextResponse.json({
    items,
    total: flat.length,
    providersWithMenu: withMenu.length,
    tourReadiness,
  });
}
