"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const [testEmail, setTestEmail] = useState("");

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
      toast.error("targetId required");
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
      toast.error("Create failed");
      return;
    }
    if (data.conflicts?.length) {
      toast.warning(`Created with warnings: ${data.conflicts.join(" ")}`);
    } else {
      toast.success("Promotion created");
    }
    setTargetId("");
    load();
  };

  const remove = async (id: string) => {
    await adminFetch(`/api/admin/promotions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  };

  const sendNewsletterTest = async () => {
    if (!testEmail.trim()) {
      toast.error("Test email required");
      return;
    }
    const r = await adminFetch("/api/admin/newsletter/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail.trim() }),
    });
    if (!r.ok) {
      const data = (await r.json()) as { error?: string };
      toast.error(data.error ?? "Send failed");
      return;
    }
    toast.success("Test digest sent");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid gap-2">
        <select
          className="rounded border px-2 py-1"
          value={type}
          onChange={(e) => setType(e.target.value as PromotionType)}
        >
          <option value="featured_venue">featured_venue</option>
          <option value="featured_event">featured_event</option>
          <option value="week_sponsor">week_sponsor</option>
          <option value="vertical_sponsor">vertical_sponsor</option>
        </select>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="/api/admin/promotions/export" download>
              Export CSV
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/admin/qr-pack?partner=1" target="_blank" rel="noopener noreferrer">
              A5 QR pack (partners)
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/admin/qr-pack?partner=1&format=pdf" download>
              A5 QR pack (PDF)
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/admin/qr-pack?partner=1&print=1" target="_blank" rel="noopener noreferrer">
              A5 QR pack (HTML print)
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <div className="flex-1 min-w-[200px]">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Newsletter test (Resend)</p>
            <Input
              type="email"
              placeholder="you@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button type="button" variant="secondary" onClick={sendNewsletterTest}>
            Send test digest
          </Button>
        </div>
        <Input placeholder="targetId (prov-* or event-*)" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
        {type === "vertical_sponsor" ? (
          <Input
            placeholder="verticalSlug (mozi, szinhaz, …)"
            value={verticalSlug}
            onChange={(e) => setVerticalSlug(e.target.value)}
          />
        ) : null}
        <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        {draftWarnings.length > 0 && (
          <ul className="rounded border border-amber-500/50 bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-100">
            {draftWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}
        <Button onClick={create}>Add promotion</Button>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => {
          const rowWarnings = findPromotionConflicts(rows, r, { excludeId: r._id });
          return (
            <li key={r._id} className="flex flex-col gap-1 border rounded p-2">
              <div className="flex justify-between gap-2">
                <span>
                  {r.type} · {r.targetId} · {r.label}
                </span>
                <Button size="sm" variant="outline" onClick={() => remove(r._id)}>
                  Delete
                </Button>
              </div>
              {rowWarnings.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">{rowWarnings.join(" · ")}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
