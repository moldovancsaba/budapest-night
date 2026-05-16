"use client";

import { Button } from "@/components/ui/button";
import type { VenueReview } from "@/types/venueReview";

type Props = {
  reviews: VenueReview[];
  busy: boolean;
  onDelete: (id: string) => void;
};

export function AdminReviewsTab({ reviews, busy, onDelete }: Props) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Visitor reviews posted on venue pages. Deleting recalculates venue averages.
      </p>
      <div className="max-h-[480px] space-y-2 overflow-y-auto">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                {r.displayName} · {r.rating}★ · {r.providerId}
              </p>
              {r.body ? <p className="mt-1 text-muted-foreground">{r.body}</p> : null}
              <p className="mt-1 text-[10px] text-muted-foreground">{r.updatedAt}</p>
            </div>
            <Button variant="destructive" size="sm" disabled={busy} onClick={() => onDelete(r.id)}>
              Remove
            </Button>
          </div>
        ))}
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No community reviews yet.</p>
        ) : null}
      </div>
    </>
  );
}
