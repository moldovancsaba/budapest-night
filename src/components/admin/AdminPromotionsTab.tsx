"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { PromotionDoc, PromotionType } from "@/types/promotion";

async function adminFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

export function AdminPromotionsTab() {
  const [rows, setRows] = useState<PromotionDoc[]>([]);
  const [type, setType] = useState<PromotionType>("featured_venue");
  const [targetId, setTargetId] = useState("");
  const [label, setLabel] = useState("Kiemelt partner");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const load = () =>
    adminFetch("/api/admin/promotions").then(async (r) => {
      if (r.ok) setRows(await r.json());
    });

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const r = await adminFetch("/api/admin/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        targetId,
        label,
        startsAt: startsAt || new Date().toISOString(),
        endsAt: endsAt || new Date(Date.now() + 14 * 86400000).toISOString(),
        priority: 10,
      }),
    });
    if (!r.ok) {
      toast.error("Create failed");
      return;
    }
    toast.success("Promotion created");
    setTargetId("");
    load();
  };

  const remove = async (id: string) => {
    await adminFetch(`/api/admin/promotions?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
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
        <Button variant="outline" asChild>
          <a href="/api/admin/promotions/export" download>
            Export CSV
          </a>
        </Button>
        <Input placeholder="targetId (prov-* or event-*)" value={targetId} onChange={(e) => setTargetId(e.target.value)} />
        <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        <Button onClick={create}>Add promotion</Button>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r._id} className="flex justify-between gap-2 border rounded p-2">
            <span>
              {r.type} · {r.targetId} · {r.label}
            </span>
            <Button size="sm" variant="outline" onClick={() => remove(r._id)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
