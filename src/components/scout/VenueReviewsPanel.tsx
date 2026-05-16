"use client";

import type { Provider } from "@/types/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/scout/StarRatingInput";
import { useVenueReviews } from "@/hooks/useVenueReviews";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

function formatReviewDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function VenueReviewsPanel({ provider }: { provider: Provider }) {
  const t = useTranslations("provider");
  const { data, isLoading, submit, locale, reviewerId } = useVenueReviews(provider.id);
  const [rating, setRating] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    if (data?.mine) {
      setRating(data.mine.rating);
      setDisplayName(data.mine.displayName);
      setBody(data.mine.body);
    }
  }, [data?.mine]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error(t("reviewRatingRequired"));
      return;
    }
    if (!reviewerId) return;
    try {
      await submit.mutateAsync({
        rating,
        displayName,
        body,
        website: honeypot,
      });
      toast.success(data?.mine ? t("reviewUpdated") : t("reviewThanks"));
    } catch (err) {
      const code = err instanceof Error ? err.message : "submit_failed";
      if (code === "rate_limit") toast.error(t("reviewRateLimit"));
      else toast.error(t("reviewSubmitFailed"));
    }
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card/50 p-4">
      <h3 className="font-display text-base font-semibold text-foreground">
        {t("communityReviewsTitle")}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{t("communityReviewsHint")}</p>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{t("reviewsLoading")}</p>
      ) : (
        <>
          {data && data.summary.reviewCount > 0 ? (
            <p className="mt-3 flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-foreground text-foreground" aria-hidden />
              <span className="font-semibold">{data.summary.rating}</span>
              <span className="text-muted-foreground">
                {t("reviewsCount", { count: data.summary.reviewCount })}
              </span>
              <span className="text-xs text-muted-foreground">· {t("reviewsSourceBn")}</span>
            </p>
          ) : null}

          {data && data.reviews.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {data.reviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-xl border border-border/50 bg-background/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{rev.displayName}</p>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-foreground text-foreground" />
                      {rev.rating}
                    </span>
                  </div>
                  {rev.body ? (
                    <p className="mt-2 text-sm leading-relaxed text-foreground/85">{rev.body}</p>
                  ) : null}
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {formatReviewDate(rev.createdAt, locale)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{t("reviewsEmpty")}</p>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-3 border-t border-border/60 pt-4">
            <p className="text-sm font-medium text-foreground">
              {data?.mine ? t("reviewEditTitle") : t("reviewWriteTitle")}
            </p>
            <StarRatingInput
              value={rating}
              onChange={setRating}
              label={t("reviewYourRating")}
              disabled={submit.isPending}
            />
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("reviewDisplayNamePlaceholder")}
              maxLength={40}
              disabled={submit.isPending}
            />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("reviewBodyPlaceholder")}
              rows={3}
              maxLength={500}
              disabled={submit.isPending}
            />
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            <Button type="submit" disabled={submit.isPending || !reviewerId} className="w-full">
              {data?.mine ? t("reviewUpdateButton") : t("reviewSubmitButton")}
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
