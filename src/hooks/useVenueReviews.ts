"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import type { VenueReviewsPayload } from "@/types/venueReview";
import { useReviewerId } from "@/hooks/useReviewerId";

export function useVenueReviews(providerId: string) {
  const locale = useLocale() as AppLocale;
  const reviewerId = useReviewerId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["venue-reviews", providerId, reviewerId],
    queryFn: async () => {
      const q = new URLSearchParams({ locale });
      if (reviewerId) q.set("reviewerId", reviewerId);
      const r = await fetch(
        `/api/public/providers/${encodeURIComponent(providerId)}/reviews?${q}`,
      );
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to load reviews");
      }
      return r.json() as Promise<VenueReviewsPayload>;
    },
    enabled: Boolean(providerId),
    staleTime: 30_000,
  });

  const submit = useMutation({
    mutationFn: async (input: {
      rating: number;
      displayName: string;
      body: string;
      website?: string;
    }) => {
      const r = await fetch(
        `/api/public/providers/${encodeURIComponent(providerId)}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewerId,
            locale,
            rating: input.rating,
            displayName: input.displayName,
            body: input.body,
            website: input.website ?? "",
          }),
        },
      );
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error((j as { error?: string }).error || "submit_failed");
      }
      return j;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-reviews", providerId] });
      queryClient.invalidateQueries({ queryKey: ["catalog", "providers"] });
    },
  });

  return { ...query, submit, reviewerId, locale };
}
