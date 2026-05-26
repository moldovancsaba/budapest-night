"use client";

import type { Provider } from "@/types/provider";
import { SectionPanel, SemanticButton } from "@/components/gds";
import { Group, Paper, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { StarRatingInput } from "@/components/scout/StarRatingInput";
import { useVenueReviews } from "@/hooks/useVenueReviews";
import { Star } from "@/components/gds/icons";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";

function formatReviewDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function VenueReviewsPanel({ provider }: { provider: Provider }) {
  const t = useTranslations("venue");
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
      notify.error(t("reviewRatingRequired"));
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
      notify.success(data?.mine ? t("reviewUpdated") : t("reviewThanks"));
    } catch (err) {
      const code = err instanceof Error ? err.message : "submit_failed";
      if (code === "rate_limit") notify.error(t("reviewRateLimit"));
      else notify.error(t("reviewSubmitFailed"));
    }
  };

  return (
    <SectionPanel
      title={t("communityReviewsTitle")}
      description={t("communityReviewsHint")}
      tone="supporting"
      divided
    >
      {isLoading ? (
        <Text size="sm" c="dimmed">
          {t("reviewsLoading")}
        </Text>
      ) : (
        <>
          {data && data.summary.reviewCount > 0 ? (
            <Group gap={4} align="center">
              <Star size={16} fill="currentColor" aria-hidden />
              <Text size="sm" fw={600}>
                {data.summary.rating}
              </Text>
              <Text size="sm" c="dimmed">
                {t("reviewsCount", { count: data.summary.reviewCount })}
              </Text>
              <Text size="xs" c="dimmed">
                · {t("reviewsSourceBn")}
              </Text>
            </Group>
          ) : null}

          {data && data.reviews.length > 0 ? (
            <Stack gap="sm" mt="md">
              {data.reviews.map((rev) => (
                <Paper key={rev.id} radius="md" p="sm" bg="dark.6">
                  <Stack gap={4}>
                    <Group justify="space-between" gap="xs" wrap="nowrap">
                      <Text size="sm" fw={500}>
                        {rev.displayName}
                      </Text>
                      <Group gap={2} align="center" wrap="nowrap">
                        <Star size={12} fill="currentColor" />
                        <Text size="xs" c="dimmed">
                          {rev.rating}
                        </Text>
                      </Group>
                    </Group>
                    {rev.body ? (
                      <Text size="sm" lh={1.5}>
                        {rev.body}
                      </Text>
                    ) : null}
                    <Text size="xs" c="dimmed">
                      {formatReviewDate(rev.createdAt, locale)}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed">
              {t("reviewsEmpty")}
            </Text>
          )}

          <form onSubmit={onSubmit}>
            <Stack gap="sm" mt="lg" pt="md">
              <Text size="sm" fw={500}>
                {data?.mine ? t("reviewEditTitle") : t("reviewWriteTitle")}
              </Text>
              <StarRatingInput
                value={rating}
                onChange={setRating}
                label={t("reviewYourRating")}
                disabled={submit.isPending}
              />
              <TextInput
                value={displayName}
                onChange={(e) => setDisplayName(e.currentTarget.value)}
                placeholder={t("reviewDisplayNamePlaceholder")}
                maxLength={40}
                disabled={submit.isPending}
              />
              <Textarea
                value={body}
                onChange={(e) => setBody(e.currentTarget.value)}
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
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />
              <SemanticButton
                action="submit"
                type="submit"
                fullWidth
                disabled={submit.isPending || !reviewerId}
              />
            </Stack>
          </form>
        </>
      )}
    </SectionPanel>
  );
}
