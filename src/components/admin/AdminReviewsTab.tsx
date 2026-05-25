"use client";

import { Group, Paper, Stack, Text } from "@mantine/core";
import { AppButton } from "@/components/gds/AppButton";
import type { VenueReview } from "@/types/venueReview";

type Props = {
  reviews: VenueReview[];
  busy: boolean;
  onDelete: (id: string) => void;
};

export function AdminReviewsTab({ reviews, busy, onDelete }: Props) {
  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Visitor reviews posted on venue pages. Deleting recalculates venue averages.
      </Text>
      <Stack gap="sm" mah={480} style={{ overflowY: "auto" }}>
        {reviews.map((r) => (
          <Paper key={r.id} withBorder p="sm">
            <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
              <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                <Text fw={600} size="sm">
                {r.displayName} · {r.rating}★ · {r.providerId}
                </Text>
                {r.body ? (
                  <Text size="sm" c="dimmed">
                    {r.body}
                  </Text>
                ) : null}
                <Text size="xs" c="dimmed">
                  {r.updatedAt}
                </Text>
              </Stack>
              <AppButton variant="destructive" size="xs" disabled={busy} onClick={() => onDelete(r.id)}>
                Remove
              </AppButton>
            </Group>
          </Paper>
        ))}
        {reviews.length === 0 ? (
          <Text size="sm" c="dimmed">
            No community reviews yet.
          </Text>
        ) : null}
      </Stack>
    </Stack>
  );
}
