import type { Db } from "mongodb";
import { COL } from "@/lib/mongodb";
import type { ActivePromotion, PromotionDoc } from "@/types/promotion";

/** Keep promotions that apply to the requested locale (empty locales = all). */
export function filterPromosByLocale(
  promos: ActivePromotion[],
  locale: string,
): ActivePromotion[] {
  return promos.filter((p) => !p.locales?.length || p.locales.includes(locale));
}

export async function getActivePromotions(db: Db, at = new Date()): Promise<ActivePromotion[]> {
  const now = at.toISOString();
  const rows = (await db
    .collection(COL.promotions)
    .find({ startsAt: { $lte: now }, endsAt: { $gte: now } })
    .sort({ priority: -1 })
    .toArray()) as unknown as PromotionDoc[];

  return rows.map((r) => ({
    id: r._id,
    type: r.type,
    targetId: r.targetId,
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    label: r.label,
    priority: r.priority,
    locales: r.locales,
    verticalSlug: r.verticalSlug,
  }));
}

export function featuredVenueIds(promos: ActivePromotion[]): Set<string> {
  return new Set(
    promos.filter((p) => p.type === "featured_venue").map((p) => p.targetId),
  );
}

export function featuredEventIds(promos: ActivePromotion[]): Set<string> {
  return new Set(
    promos.filter((p) => p.type === "featured_event").map((p) => p.targetId),
  );
}

export function promotionLabelByTarget(
  promos: ActivePromotion[],
): Map<string, string> {
  return new Map(
    promos
      .filter((p) => p.type === "featured_venue" || p.type === "featured_event")
      .map((p) => [p.targetId, p.label]),
  );
}

/** Week hero sponsor when program week doc has no sponsor fields. */
export function weekSponsorFromPromos(
  promos: ActivePromotion[],
): { name: string; url?: string } | null {
  const s = promos.find((p) => p.type === "week_sponsor");
  if (!s) return null;
  const url = /^https?:\/\//i.test(s.targetId) ? s.targetId : undefined;
  return { name: s.label, url };
}

export function verticalSponsorsFromPromos(
  promos: ActivePromotion[],
): Record<string, { name: string; url?: string }> {
  const out: Record<string, { name: string; url?: string }> = {};
  for (const p of promos) {
    if (p.type !== "vertical_sponsor" || !p.verticalSlug) continue;
    const url = /^https?:\/\//i.test(p.targetId) ? p.targetId : undefined;
    out[p.verticalSlug] = { name: p.label, url };
  }
  return out;
}
