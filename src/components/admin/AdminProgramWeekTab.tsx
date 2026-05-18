"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import { DEFAULT_SITE_ORIGIN } from "@/lib/appPaths";
import { getCurrentWeekId } from "@/lib/programWeekCalendar";

async function adminFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

export function AdminProgramWeekTab({
  providers,
  events,
}: {
  providers: Provider[];
  events: NightEvent[];
}) {
  const [weekId, setWeekId] = useState("");
  const [headline, setHeadline] = useState("Ez a hét Budapesten");
  const [intro, setIntro] = useState("");
  const [featuredEventIds, setFeaturedEventIds] = useState("");
  const [featuredProviderIds, setFeaturedProviderIds] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorUrl, setSponsorUrl] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/program-week").then(async (r) => {
      if (!r.ok) return;
      const rows = (await r.json()) as { weekId: string; locales?: { hu?: { headline?: string; intro?: string } }; featuredEventIds?: string[]; featuredProviderIds?: string[]; sponsorName?: string; sponsorUrl?: string }[];
      const cur = rows[0];
      if (!cur) return;
      setWeekId(cur.weekId);
      setHeadline(cur.locales?.hu?.headline ?? "");
      setIntro(cur.locales?.hu?.intro ?? "");
      setFeaturedEventIds((cur.featuredEventIds ?? []).join("\n"));
      setFeaturedProviderIds((cur.featuredProviderIds ?? []).join("\n"));
      setSponsorName(cur.sponsorName ?? "");
      setSponsorUrl(cur.sponsorUrl ?? "");
    });
  }, []);

  const save = async () => {
    const r = await adminFetch("/api/admin/program-week", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekId: weekId || undefined,
        published: true,
        locales: { hu: { headline, intro } },
        featuredEventIds: featuredEventIds.split("\n").map((s) => s.trim()).filter(Boolean),
        featuredProviderIds: featuredProviderIds.split("\n").map((s) => s.trim()).filter(Boolean),
        sponsorName: sponsorName || undefined,
        sponsorUrl: sponsorUrl || undefined,
      }),
    });
    if (!r.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Program week saved");
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-muted-foreground">
        {events.length} events · {providers.length} providers in catalog
      </p>
      <Input placeholder="weekId (YYYY-MM-DD Thu)" value={weekId} onChange={(e) => setWeekId(e.target.value)} />
      <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="HU headline" />
      <Textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="HU intro" rows={3} />
      <Textarea
        value={featuredEventIds}
        onChange={(e) => setFeaturedEventIds(e.target.value)}
        placeholder="Featured event IDs (one per line)"
        rows={4}
      />
      <Textarea
        value={featuredProviderIds}
        onChange={(e) => setFeaturedProviderIds(e.target.value)}
        placeholder="Featured provider IDs (one per line)"
        rows={4}
      />
      <Input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Sponsor name" />
      <Input value={sponsorUrl} onChange={(e) => setSponsorUrl(e.target.value)} placeholder="Sponsor URL" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={save}>Publish week</Button>
        <Button variant="outline" asChild>
          <a
            href={`${DEFAULT_SITE_ORIGIN}/program`}
            target="_blank"
            rel="noreferrer"
          >
            Preview on site
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Current calendar week (Thu start): {getCurrentWeekId()}
      </p>
    </div>
  );
}
