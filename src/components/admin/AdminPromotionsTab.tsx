"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Group, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";
import { notify } from "@/lib/notify";
import { findPromotionConflicts } from "@/lib/promotionConflicts";
import type { PromotionDoc, PromotionType } from "@/types/promotion";

async function adminFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

function toIsoFromLocalInput(value: string, fallback: Date): string {
  if (!value.trim()) return fallback.toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback.toISOString() : d.toISOString();
}

export function AdminPromotionsTab() {
  const [rows, setRows] = useState<PromotionDoc[]>([]);
  const [type, setType] = useState<PromotionType>("featured_venue");
  const [targetId, setTargetId] = useState("");
  const [label, setLabel] = useState("Kiemelt partner");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [verticalSlug, setVerticalSlug] = useState("");

  const load = () =>
    adminFetch("/api/admin/promotions").then(async (r) => {
      if (r.ok) setRows(await r.json());
    });

  useEffect(() => {
    load();
  }, []);

  const draftCandidate = useMemo(() => {
    const now = new Date();
    return {
      type,
      targetId: targetId.trim(),
      startsAt: toIsoFromLocalInput(startsAt, now),
      endsAt: toIsoFromLocalInput(endsAt, new Date(now.getTime() + 14 * 86400000)),
      verticalSlug: verticalSlug.trim() || undefined,
    };
  }, [type, targetId, startsAt, endsAt, verticalSlug]);

  const draftWarnings = useMemo(
    () =>
      targetId.trim()
        ? findPromotionConflicts(rows, draftCandidate)
        : [],
    [rows, draftCandidate, targetId],
  );

  const create = async () => {
    if (!targetId.trim()) {
      notify.error("targetId required");
      return;
    }
    const r = await adminFetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draftCandidate,
        label,
        priority: 10,
      }),
    });
    const data = (await r.json()) as { conflicts?: string[] };
    if (!r.ok) {
      notify.error("Create failed");
      return;
    }
    if (data.conflicts?.length) {
      notify.info(`Created with warnings: ${data.conflicts.join(" ")}`);
    } else {
      notify.success("Promotion created");
    }
    setTargetId("");
    load();
  };

  const remove = async (id: string) => {
    await adminFetch(`/api/admin/promotions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  return (
    <Stack gap="xl" maw={760}>
      <Stack gap="sm">
        <Select
          label="Promotion type"
          value={type}
          data={[
            { value: "featured_venue", label: "featured_venue" },
            { value: "featured_event", label: "featured_event" },
            { value: "week_sponsor", label: "week_sponsor" },
            { value: "vertical_sponsor", label: "vertical_sponsor" },
          ]}
          onChange={(value) => setType((value as PromotionType) ?? "featured_venue")}
        />
        <Group gap="sm" wrap="wrap">
          <AppButton component="a" href="/api/admin/promotions/export" download variant="outline">
            Export CSV
          </AppButton>
          <AppButton component="a" href="/api/admin/qr-pack?partner=1" target="_blank" rel="noopener noreferrer" variant="outline">
            A5 QR pack (partners)
          </AppButton>
          <AppButton component="a" href="/api/admin/qr-pack?partner=1&format=pdf" download variant="outline">
            A5 QR pack (PDF)
          </AppButton>
          <AppButton component="a" href="/api/admin/qr-pack?partner=1&print=1" target="_blank" rel="noopener noreferrer" variant="outline">
            A5 QR pack (HTML print)
          </AppButton>
        </Group>
        <TextInput placeholder="targetId (prov-* or event-*)" value={targetId} onChange={(e) => setTargetId(e.currentTarget.value)} />
        {type === "vertical_sponsor" ? (
          <TextInput
            placeholder="verticalSlug (mozi, szinhaz, …)"
            value={verticalSlug}
            onChange={(e) => setVerticalSlug(e.currentTarget.value)}
          />
        ) : null}
        <TextInput placeholder="Label" value={label} onChange={(e) => setLabel(e.currentTarget.value)} />
        <TextInput type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.currentTarget.value)} />
        <TextInput type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.currentTarget.value)} />
        {draftWarnings.length > 0 && (
          <Alert color="yellow" variant="light" title="Warnings">
            {draftWarnings.map((w) => (
              <Text key={w} size="xs">
                {w}
              </Text>
            ))}
          </Alert>
        )}
        <AppButton onClick={create}>Add promotion</AppButton>
      </Stack>
      <Stack gap="sm">
        {rows.map((r) => {
          const rowWarnings = findPromotionConflicts(rows, r, { excludeId: r._id });
          return (
            <Paper key={r._id} withBorder p="sm">
              <Group justify="space-between" gap="sm" wrap="wrap">
                <Text size="sm">
                  {r.type} · {r.targetId} · {r.label}
                </Text>
                <AppButton size="xs" variant="outline" onClick={() => remove(r._id)}>
                  Delete
                </AppButton>
              </Group>
              {rowWarnings.length > 0 && (
                <Text size="xs" c="yellow">
                  {rowWarnings.join(" · ")}
                </Text>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
