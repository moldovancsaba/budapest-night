import type { Db } from "mongodb";
import type { Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import type { MeetupGroup } from "@/types/meetup";
import { COL } from "@/lib/mongodb";
import { applyIngestOperation } from "@/lib/ingestOperations";
import { serperSearch } from "@/lib/curator/serperSearch";
import { fetchPageText } from "@/lib/curator/fetchPageText";
import { extractProviderWithLlm } from "@/lib/curator/extractProviderWithLlm";
import { searchQueryForScarcestSlice } from "@/lib/curator/scarcityCatalog";
import {
  buildCatalogImageIndex,
  isBannedImageUrl,
  isImageUsedByOtherListing,
} from "@/lib/curator/catalogImageValidate";

function normName(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type CuratorDiscoveryResult =
  | {
      ok: true;
      action: "ingested";
      providerId: string;
      providerName: string;
      sourceUrl: string;
      searchQuery: string;
      steps: string[];
    }
  | {
      ok: true;
      action: "skipped";
      reason: string;
      searchQuery: string;
      steps: string[];
    }
  | {
      ok: false;
      error: string;
      steps: string[];
    };

export async function runCuratorDiscovery(db: Db): Promise<CuratorDiscoveryResult> {
  const steps: string[] = [];

  if (process.env.CURATOR_ENABLED !== "true") {
    steps.push('Set CURATOR_ENABLED="true" to run discovery.');
    return { ok: true, action: "skipped", reason: "curator_disabled", searchQuery: "", steps };
  }

  if (!process.env.SERPER_API_KEY?.trim()) {
    return { ok: false, error: "SERPER_API_KEY missing", steps: ["Need Serper.dev API key for web search."] };
  }

  if (!process.env.CURATOR_OPENAI_API_KEY?.trim()) {
    return { ok: false, error: "CURATOR_OPENAI_API_KEY missing", steps: ["Need OpenAI API key for extraction."] };
  }

  const catalogProviders = (await db
    .collection(COL.providers)
    .find({})
    .project({ id: 1, name: 1, category: 1, borough: 1, image: 1 })
    .toArray()) as Pick<Provider, "id" | "name" | "category" | "borough" | "image">[];

  const catalogEvents = (await db
    .collection(COL.events)
    .find({})
    .project({ id: 1, image: 1 })
    .toArray()) as Pick<NightEvent, "id" | "image">[];

  const catalogMeetups = (await db
    .collection(COL.meetupGroups)
    .find({})
    .project({ id: 1, coverImageUrl: 1 })
    .toArray()) as Pick<MeetupGroup, "id" | "coverImageUrl">[];

  const catalogByUrl = buildCatalogImageIndex(catalogProviders, catalogEvents, catalogMeetups);

  const { query: searchQuery, category, borough, count } = searchQueryForScarcestSlice(catalogProviders);
  steps.push(`scarcity slice: ${category} × ${borough} (${count} providers)`);
  steps.push(`query: ${searchQuery}`);

  let organic: Awaited<ReturnType<typeof serperSearch>>;
  try {
    organic = await serperSearch(searchQuery);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg, steps };
  }
  steps.push(`serper results: ${organic.length}`);

  const idSet = new Set(catalogProviders.map((p) => p.id).filter(Boolean) as string[]);
  const nameNorm = new Set(catalogProviders.map((p) => normName(String(p.name || ""))).filter(Boolean));

  for (const hit of organic) {
    const link = hit.link?.trim();
    if (!link || !link.startsWith("https://")) continue;

    let allowedHost: string;
    try {
      allowedHost = new URL(link).hostname;
    } catch {
      continue;
    }

    steps.push(`try: ${link}`);
    let page: { text: string; ogImage?: string };
    try {
      page = await fetchPageText(link, allowedHost);
    } catch (e) {
      steps.push(`fetch fail: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }

    const extracted = await extractProviderWithLlm({
      sourceUrl: link,
      pageText: page.text,
      ogImage: page.ogImage,
    });
    if (extracted.ok === false) {
      steps.push(`llm: ${extracted.reason}`);
      continue;
    }

    const p = extracted.provider;
    if (idSet.has(p.id)) {
      steps.push(`skip duplicate id ${p.id}`);
      continue;
    }
    if (p.name && nameNorm.has(normName(p.name))) {
      steps.push(`skip duplicate name ${p.name}`);
      continue;
    }

    const img = (p.image || "").trim();
    if (!img) {
      steps.push(`skip ${p.id}: empty image`);
      continue;
    }
    if (isBannedImageUrl(img)) {
      steps.push(`skip ${p.id}: banned image hash`);
      continue;
    }
    if (isImageUsedByOtherListing(img, { kind: "provider", id: p.id }, catalogByUrl)) {
      steps.push(`skip ${p.id}: image URL already in catalog`);
      continue;
    }

    const op = { resource: "provider" as const, action: "upsert" as const, document: p as unknown as Provider };
    const res = await applyIngestOperation(db, op);
    if (res.ok === false) {
      steps.push(`ingest error: ${res.error}`);
      continue;
    }

    steps.push(`ingested ${p.id}`);
    return {
      ok: true,
      action: "ingested",
      providerId: p.id,
      providerName: p.name,
      sourceUrl: link,
      searchQuery,
      steps,
    };
  }

  return {
    ok: true,
    action: "skipped",
    reason: "no_acceptable_candidate",
    searchQuery,
    steps,
  };
}
