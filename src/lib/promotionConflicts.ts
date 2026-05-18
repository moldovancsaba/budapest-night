import type { PromotionDoc, PromotionType } from "@/types/promotion";

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

const PLACEMENT_TYPES: PromotionType[] = [
  "featured_venue",
  "featured_event",
  "week_sponsor",
  "vertical_sponsor",
];

/**
 * Returns human-readable conflict messages for a candidate promotion.
 */
export function findPromotionConflicts(
  existing: PromotionDoc[],
  candidate: Pick<
    PromotionDoc,
    "type" | "targetId" | "startsAt" | "endsAt" | "verticalSlug"
  >,
  options?: { excludeId?: string },
): string[] {
  const warnings: string[] = [];
  const sameTarget = existing.filter(
    (r) =>
      r._id !== options?.excludeId &&
      r.targetId === candidate.targetId &&
      r.type === candidate.type &&
      rangesOverlap(r.startsAt, r.endsAt, candidate.startsAt, candidate.endsAt),
  );
  if (sameTarget.length) {
    warnings.push(
      `Duplicate ${candidate.type} on ${candidate.targetId} (${sameTarget.length} overlapping row(s)).`,
    );
  }

  if (PLACEMENT_TYPES.includes(candidate.type)) {
    const slotPeers = existing.filter(
      (r) =>
        r._id !== options?.excludeId &&
        PLACEMENT_TYPES.includes(r.type) &&
        r.type === candidate.type &&
        rangesOverlap(r.startsAt, r.endsAt, candidate.startsAt, candidate.endsAt),
    );
    if (slotPeers.length >= 12) {
      warnings.push(
        `Many active ${candidate.type} campaigns (${slotPeers.length}) in this window — home placement may be crowded.`,
      );
    }
  }

  if (candidate.type === "week_sponsor") {
    const otherSponsors = existing.filter(
      (r) =>
        r._id !== options?.excludeId &&
        r.type === "week_sponsor" &&
        rangesOverlap(r.startsAt, r.endsAt, candidate.startsAt, candidate.endsAt),
    );
    if (otherSponsors.length) {
      warnings.push(
        `Another week_sponsor is already active in this period (${otherSponsors.map((s) => s.label).join(", ")}).`,
      );
    }
  }

  if (candidate.type === "vertical_sponsor" && candidate.verticalSlug) {
    const verticalClash = existing.filter(
      (r) =>
        r._id !== options?.excludeId &&
        r.type === "vertical_sponsor" &&
        r.verticalSlug === candidate.verticalSlug &&
        rangesOverlap(r.startsAt, r.endsAt, candidate.startsAt, candidate.endsAt),
    );
    if (verticalClash.length) {
      warnings.push(
        `vertical_sponsor for ${candidate.verticalSlug} already active in this window.`,
      );
    }
  }

  return warnings;
}
