"use client";

import { useEffect, useState } from "react";
import { Group, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";
import { notify } from "@/lib/notify";
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
  }, [weekId]);

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
      notify.error("Save failed");
      return;
    }
    setPublished(publish);
    notify.success(publish ? "Program week published" : "Draft saved");
    loadWeek(weekId);
  };

  const block = localeBlocks[activeLocale];

  return (
    <Stack gap="md" maw={960}>
      <Text size="sm" c="dimmed">
        {events.length} events · {providers.length} providers · current Thu-start week:{" "}
        {getCurrentWeekId()}
      </Text>

      <Group gap="sm" align="end" wrap="wrap">
        <Select
          label="Week"
          style={{ minWidth: 220 }}
          data={[weekId, ...weekOptions.filter((w) => w !== weekId)].map((w) => ({
            value: w,
            label: w,
          }))}
          value={weekId}
          searchable
          allowDeselect={false}
          onChange={(value) => {
            if (!value) return;
            setWeekId(value);
            loadWeek(value);
          }}
        />
        <TextInput
          style={{ maxWidth: 240 }}
          placeholder="Or type weekId (YYYY-MM-DD)"
          value={weekId}
          onChange={(e) => setWeekId(e.currentTarget.value)}
        />
        <Text size="xs" c="dimmed">
          {published ? "Published" : "Draft"}
        </Text>
      </Group>

      <Group gap="xs" wrap="wrap">
        {locales.map((loc) => (
          <AppButton
            key={loc}
            type="button"
            size="xs"
            variant={activeLocale === loc ? "default" : "outline"}
            onClick={() => setActiveLocale(loc)}
          >
            {loc.toUpperCase()}
          </AppButton>
        ))}
      </Group>

      <TextInput
        value={block.headline}
        onChange={(e) => patchLocale(activeLocale, { headline: e.currentTarget.value })}
        placeholder={`${activeLocale.toUpperCase()} headline`}
      />
      <Textarea
        value={block.intro ?? ""}
        onChange={(e) => patchLocale(activeLocale, { intro: e.currentTarget.value })}
        placeholder={`${activeLocale.toUpperCase()} intro`}
        minRows={3}
      />

      <Textarea
        value={featuredEventIds}
        onChange={(e) => setFeaturedEventIds(e.currentTarget.value)}
        placeholder="Featured event IDs (one per line)"
        minRows={4}
      />
      <Textarea
        value={featuredProviderIds}
        onChange={(e) => setFeaturedProviderIds(e.currentTarget.value)}
        placeholder="Featured provider IDs (one per line)"
        minRows={4}
      />
      <TextInput value={sponsorName} onChange={(e) => setSponsorName(e.currentTarget.value)} placeholder="Sponsor name" />
      <TextInput value={sponsorUrl} onChange={(e) => setSponsorUrl(e.currentTarget.value)} placeholder="Sponsor URL" />

      <Group gap="sm" wrap="wrap">
        <AppButton onClick={() => save(true)}>Publish week</AppButton>
        <AppButton variant="secondary" onClick={() => save(false)}>
          Save draft
        </AppButton>
        <AppButton variant="outline" component="a" href={`${DEFAULT_SITE_ORIGIN}${buildProgramPath()}`} target="_blank" rel="noreferrer">
          Preview HU (/ez-a-het)
        </AppButton>
        <AppButton variant="outline" component="a" href={`${DEFAULT_SITE_ORIGIN}/en/program`} target="_blank" rel="noreferrer">
          Preview EN
        </AppButton>
        <AppButton
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => {
            const out = {} as LocaleBlocks;
            for (const loc of locales) out[loc] = { ...PROGRAM_WEEK_LOCALE_DEFAULTS[loc] };
            setLocaleBlocks(out);
          }}
        >
          Reset copy to defaults
        </AppButton>
      </Group>
    </Stack>
  );
}
