"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { locales, type AppLocale } from "@/i18n/config";
import { PROGRAM_WEEK_LOCALE_DEFAULTS } from "@/lib/programWeekCopy";
import { DEFAULT_SITE_ORIGIN, buildProgramPath } from "@/lib/appPaths";
import { getCurrentWeekId } from "@/lib/programWeekCalendar";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import type { ProgramWeekDoc, ProgramWeekLocaleBlock } from "@/types/programWeek";

async function adminFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, { ...init, credentials: "include" });
}

type LocaleBlocks = Record<AppLocale, ProgramWeekLocaleBlock>;

function blocksFromDoc(doc: ProgramWeekDoc | null): LocaleBlocks {
  const out = {} as LocaleBlocks;
  for (const loc of locales) {
    out[loc] = doc?.locales?.[loc] ?? { ...PROGRAM_WEEK_LOCALE_DEFAULTS[loc] };
  }
  return out;
}

export function AdminProgramWeekTab({
  providers,
  events,
}: {
  providers: Provider[];
  events: NightEvent[];
}) {
  const [weekId, setWeekId] = useState(getCurrentWeekId());
  const [weekOptions, setWeekOptions] = useState<string[]>([]);
  const [published, setPublished] = useState(true);
  const [localeBlocks, setLocaleBlocks] = useState<LocaleBlocks>(() =>
    blocksFromDoc(null),
  );
  const [featuredEventIds, setFeaturedEventIds] = useState("");
  const [featuredProviderIds, setFeaturedProviderIds] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorUrl, setSponsorUrl] = useState("");
  const [activeLocale, setActiveLocale] = useState<AppLocale>("hu");

  const loadWeek = (id: string) => {
    adminFetch("/api/admin/program-week").then(async (r) => {
      if (!r.ok) return;
      const rows = (await r.json()) as ProgramWeekDoc[];
      setWeekOptions(rows.map((w) => w.weekId));
      const cur = rows.find((w) => w.weekId === id) ?? rows[0];
      if (!cur) {
        setWeekId(id);
        setLocaleBlocks(blocksFromDoc(null));
        return;
      }
      setWeekId(cur.weekId);
      setPublished(cur.published ?? true);
      setLocaleBlocks(blocksFromDoc(cur));
      setFeaturedEventIds((cur.featuredEventIds ?? []).join("\n"));
      setFeaturedProviderIds((cur.featuredProviderIds ?? []).join("\n"));
      setSponsorName(cur.sponsorName ?? "");
      setSponsorUrl(cur.sponsorUrl ?? "");
    });
  };

  useEffect(() => {
    loadWeek(weekId);
  }, []);

  const patchLocale = (loc: AppLocale, patch: Partial<ProgramWeekLocaleBlock>) => {
    setLocaleBlocks((prev) => ({
      ...prev,
      [loc]: { ...prev[loc], ...patch },
    }));
  };

  const save = async (publish: boolean) => {
    const localesPayload = Object.fromEntries(
      locales.map((loc) => [loc, localeBlocks[loc]]),
    ) as ProgramWeekDoc["locales"];

    const r = await adminFetch("/api/admin/program-week", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekId: weekId || undefined,
        published: publish,
        locales: localesPayload,
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
    setPublished(publish);
    toast.success(publish ? "Program week published" : "Draft saved");
    loadWeek(weekId);
  };

  const block = localeBlocks[activeLocale];

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-sm text-muted-foreground">
        {events.length} events · {providers.length} providers · current Thu-start week:{" "}
        {getCurrentWeekId()}
      </p>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="min-w-[200px]">
          <label className="text-xs text-muted-foreground">Week</label>
          <select
            className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm"
            value={weekId}
            onChange={(e) => {
              setWeekId(e.target.value);
              loadWeek(e.target.value);
            }}
          >
            {[weekId, ...weekOptions.filter((w) => w !== weekId)].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
        <Input
          className="max-w-[180px]"
          placeholder="Or type weekId (YYYY-MM-DD)"
          value={weekId}
          onChange={(e) => setWeekId(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">
          {published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {locales.map((loc) => (
          <Button
            key={loc}
            type="button"
            size="sm"
            variant={activeLocale === loc ? "default" : "outline"}
            onClick={() => setActiveLocale(loc)}
          >
            {loc.toUpperCase()}
          </Button>
        ))}
      </div>

      <Input
        value={block.headline}
        onChange={(e) => patchLocale(activeLocale, { headline: e.target.value })}
        placeholder={`${activeLocale.toUpperCase()} headline`}
      />
      <Textarea
        value={block.intro ?? ""}
        onChange={(e) => patchLocale(activeLocale, { intro: e.target.value })}
        placeholder={`${activeLocale.toUpperCase()} intro`}
        rows={3}
      />

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
        <Button onClick={() => save(true)}>Publish week</Button>
        <Button variant="secondary" onClick={() => save(false)}>
          Save draft
        </Button>
        <Button variant="outline" asChild>
          <a href={`${DEFAULT_SITE_ORIGIN}${buildProgramPath()}`} target="_blank" rel="noreferrer">
            Preview HU (/ez-a-het)
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`${DEFAULT_SITE_ORIGIN}/en/program`} target="_blank" rel="noreferrer">
            Preview EN
          </a>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const out = {} as LocaleBlocks;
            for (const loc of locales) out[loc] = { ...PROGRAM_WEEK_LOCALE_DEFAULTS[loc] };
            setLocaleBlocks(out);
          }}
        >
          Reset copy to defaults
        </Button>
      </div>
    </div>
  );
}
