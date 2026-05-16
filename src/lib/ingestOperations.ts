import type { AnyBulkWriteOperation, Db, Document } from "mongodb";
import { COL } from "@/lib/mongodb";
import type { Borough, Provider } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import type { MeetupGroup } from "@/types/meetup";
import { nightEventSchema } from "@/lib/eventSchema";
import { mergeEventLocales } from "@/lib/eventLocale";
import { validateEventLocalesForIngest } from "@/lib/curator/eventLocaleIngestRules";
import type { BrainSettingsDoc, SiteDoc } from "@/types/site";
import { DEFAULT_BRAIN } from "@/types/site";
import { mergeSiteDocument } from "@/lib/siteMerge";
import { validateMeetupCover, validateProviderImages, validateSiteRasterUrls } from "@/lib/imgbbUrl";
import { validateProviderLocalesForIngest } from "@/lib/curator/localeIngestRules";
import { applyMenuToProvider } from "@/lib/menu/applyMenuToProvider";
import { mergeProviderLocales } from "@/lib/providerLocale";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import { isValidProviderId, prepareNightEventWithVenues } from "@/lib/eventVenueLink";
import { isValidEventId, prepareMeetupGroupWithLinks } from "@/lib/meetupGroupLink";

export type IngestOpResult =
  | { ok: true; data?: unknown }
  | { ok: false; error: string };

export type IngestBatchContext = {
  /** Provider ids upserted earlier in the same POST /api/ingest request. */
  providerIdsInBatch: Set<string>;
};

const defaultBatchContext = (): IngestBatchContext => ({ providerIdsInBatch: new Set() });

async function refreshEventsLinkedToHost(db: Db, hostId: string): Promise<void> {
  const rows = (await db
    .collection(COL.events)
    .find({ venueIds: hostId })
    .toArray()) as unknown as NightEvent[];
  for (const ev of rows) {
    const hostsResult = await loadEventHosts(db, ev.venueIds);
    if ("error" in hostsResult) continue;
    const stored = prepareNightEventWithVenues(ev, hostsResult.hosts);
    await db.collection(COL.events).replaceOne({ id: ev.id }, stored as unknown as Document);
  }
}

async function loadEventHosts(
  db: Db,
  venueIds: string[],
): Promise<{ hosts: Provider[] } | { error: string }> {
  const hosts: Provider[] = [];
  for (const id of venueIds) {
    if (!isValidProviderId(id)) {
      return { error: `event: invalid venueId ${JSON.stringify(id)} (expected prov-...)` };
    }
    const raw = (await db.collection(COL.providers).findOne({ id })) as unknown as Provider | null;
    if (!raw) {
      return {
        error: `event: unknown venueId ${id} — upsert the host venue first (same payload, before the event)`,
      };
    }
    hosts.push(withResolvedLocation(raw));
  }
  return { hosts };
}

type LocRow = { borough: Borough; neighborhoods: string[] };

const MAX_REPLACE_ALL = 2000;
const MAX_DELETE_IDS = 500;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function stripId<T extends object>(doc: T): T {
  const o = { ...doc } as Record<string, unknown>;
  delete o._id;
  return o as T;
}

function withResolvedLocation(provider: Provider): Provider {
  return { ...provider, ...resolveProviderLocation(provider) };
}

function finalizeProvider(doc: Provider): Provider {
  return withResolvedLocation(applyMenuToProvider(doc) as Provider);
}

async function loadMeetupGroupHosts(
  db: Db,
  venueIds: string[],
): Promise<{ hosts: Provider[] } | { error: string }> {
  const hosts: Provider[] = [];
  for (const id of venueIds) {
    if (!isValidProviderId(id)) {
      return { error: `meetupGroup: invalid venueId ${JSON.stringify(id)} (expected prov-...)` };
    }
    const raw = (await db.collection(COL.providers).findOne({ id })) as unknown as Provider | null;
    if (!raw) {
      return {
        error: `meetupGroup: unknown venueId ${id} — upsert the venue first (same payload, before the meetup)`,
      };
    }
    hosts.push(withResolvedLocation(raw));
  }
  return { hosts };
}

async function loadMeetupGroupEvents(
  db: Db,
  eventIds: string[],
): Promise<{ events: NightEvent[] } | { error: string }> {
  const events: NightEvent[] = [];
  for (const id of eventIds) {
    if (!isValidEventId(id)) {
      return { error: `meetupGroup: invalid eventId ${JSON.stringify(id)} (expected event-...)` };
    }
    const raw = (await db.collection(COL.events).findOne({ id })) as unknown as NightEvent | null;
    if (!raw) {
      return {
        error: `meetupGroup: unknown eventId ${id} — upsert the timed event first (same payload, before the meetup)`,
      };
    }
    events.push(raw);
  }
  return { events };
}

async function finalizeMeetupGroup(
  db: Db,
  group: MeetupGroup,
): Promise<MeetupGroup | { error: string }> {
  const venueIds = group.venueIds ?? [];
  const eventIds = group.eventIds ?? [];
  const hostsResult =
    venueIds.length > 0 ? await loadMeetupGroupHosts(db, venueIds) : { hosts: [] as Provider[] };
  if ("error" in hostsResult) return hostsResult;
  const eventsResult =
    eventIds.length > 0 ? await loadMeetupGroupEvents(db, eventIds) : { events: [] as NightEvent[] };
  if ("error" in eventsResult) return eventsResult;
  const { venueLinks: _vl, eventLinks: _el, ...rest } = group;
  return prepareMeetupGroupWithLinks(rest as MeetupGroup, hostsResult.hosts, eventsResult.events);
}

export async function applyIngestOperation(
  db: Db,
  op: unknown,
  batch: IngestBatchContext = defaultBatchContext(),
): Promise<IngestOpResult> {
  if (!isPlainObject(op)) return { ok: false, error: "each operation must be a JSON object" };
  const resource = op.resource;
  const action = op.action;

  // --- reads (return data on success) ---
  if (resource === "providers" && action === "list") {
    const rows = (await db.collection(COL.providers).find({}).toArray()) as unknown as (Provider & {
      _id?: unknown;
    })[];
    return { ok: true, data: rows.map(stripId) };
  }

  if (resource === "provider" && action === "get") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "provider.get requires id string" };
    const doc = (await db.collection(COL.providers).findOne({ id })) as unknown as Provider | null;
    if (!doc) return { ok: false, error: "provider not found" };
    return { ok: true, data: stripId(doc) };
  }

  if (resource === "events" && action === "list") {
    const rows = (await db.collection(COL.events).find({}).toArray()) as unknown as (NightEvent & {
      _id?: unknown;
    })[];
    return { ok: true, data: rows.map(stripId) };
  }

  if (resource === "event" && action === "get") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "event.get requires id string" };
    const doc = (await db.collection(COL.events).findOne({ id })) as unknown as NightEvent | null;
    if (!doc) return { ok: false, error: "event not found" };
    return { ok: true, data: stripId(doc) };
  }

  if (resource === "meetupGroups" && action === "list") {
    const rows = (await db.collection(COL.meetupGroups).find({}).toArray()) as unknown as (MeetupGroup & {
      _id?: unknown;
    })[];
    return { ok: true, data: rows.map(stripId) };
  }

  if (resource === "meetupGroup" && action === "get") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "meetupGroup.get requires id string" };
    const doc = (await db.collection(COL.meetupGroups).findOne({ id })) as unknown as MeetupGroup | null;
    if (!doc) return { ok: false, error: "meetupGroup not found" };
    return { ok: true, data: stripId(doc) };
  }

  if (resource === "site" && action === "get") {
    const doc = (await db.collection(COL.site).findOne({ _id: "main" } as never)) as unknown as Partial<SiteDoc> | null;
    return { ok: true, data: mergeSiteDocument(doc) };
  }

  if (resource === "brain" && action === "get") {
    const doc = (await db.collection(COL.brain).findOne({ _id: "main" } as never)) as unknown as BrainSettingsDoc | null;
    return { ok: true, data: doc ?? { _id: "main" as const, ...DEFAULT_BRAIN } };
  }

  if (resource === "locations" && action === "list") {
    const rows = await db.collection(COL.locations).find({}).toArray();
    return { ok: true, data: rows };
  }

  // --- bulk writes ---
  if (resource === "providers" && action === "replaceAll") {
    const documents = op.documents;
    if (!Array.isArray(documents)) return { ok: false, error: "providers.replaceAll requires documents array" };
    if (documents.length > MAX_REPLACE_ALL) {
      return { ok: false, error: `providers.replaceAll: at most ${MAX_REPLACE_ALL} documents` };
    }
    for (const raw of documents) {
      if (!isPlainObject(raw)) return { ok: false, error: "providers.replaceAll: each item must be an object" };
      const rest = raw as unknown as Provider;
      if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "providers.replaceAll: each document needs string id" };
      const imgErr = validateProviderImages(rest);
      if (imgErr) return { ok: false, error: imgErr };
    }
    await db.collection(COL.providers).deleteMany({});
    if (documents.length > 0) {
      const cleaned = documents.map((raw) => {
        const { _id, ...rest } = raw as unknown as Provider & { _id?: unknown };
        return rest as Provider;
      });
      await db.collection(COL.providers).insertMany(cleaned as unknown as Document[]);
    }
    return { ok: true, data: { replaced: documents.length } };
  }

  if (resource === "meetupGroups" && action === "replaceAll") {
    const documents = op.documents;
    if (!Array.isArray(documents)) return { ok: false, error: "meetupGroups.replaceAll requires documents array" };
    if (documents.length > MAX_REPLACE_ALL) {
      return { ok: false, error: `meetupGroups.replaceAll: at most ${MAX_REPLACE_ALL} documents` };
    }
    for (const raw of documents) {
      if (!isPlainObject(raw)) return { ok: false, error: "meetupGroups.replaceAll: each item must be an object" };
      const rest = raw as unknown as MeetupGroup;
      if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "meetupGroups.replaceAll: each document needs string id" };
      const imgErr = validateMeetupCover(rest);
      if (imgErr) return { ok: false, error: imgErr };
    }
    await db.collection(COL.meetupGroups).deleteMany({});
    if (documents.length > 0) {
      const cleaned: MeetupGroup[] = [];
      for (const raw of documents) {
        const { _id, venueLinks: _vl, eventLinks: _el, ...rest } = raw as unknown as MeetupGroup & { _id?: unknown };
        const imgErr = validateMeetupCover(rest);
        if (imgErr) return { ok: false, error: imgErr };
        const stored = await finalizeMeetupGroup(db, rest as MeetupGroup);
        if ("error" in stored) return { ok: false, error: stored.error };
        cleaned.push(stored);
      }
      await db.collection(COL.meetupGroups).insertMany(cleaned as unknown as Document[]);
    }
    return { ok: true, data: { replaced: documents.length } };
  }

  if (resource === "providers" && action === "deleteMany") {
    const ids = op.ids;
    if (!Array.isArray(ids) || ids.length === 0) return { ok: false, error: "providers.deleteMany requires non-empty ids array" };
    if (ids.length > MAX_DELETE_IDS) return { ok: false, error: `providers.deleteMany: at most ${MAX_DELETE_IDS} ids` };
    for (const id of ids) {
      if (typeof id !== "string" || !id) return { ok: false, error: "providers.deleteMany: each id must be a non-empty string" };
    }
    const r = await db.collection(COL.providers).deleteMany({ id: { $in: ids } });
    return { ok: true, data: { deletedCount: r.deletedCount } };
  }

  if (resource === "meetupGroups" && action === "deleteMany") {
    const ids = op.ids;
    if (!Array.isArray(ids) || ids.length === 0) return { ok: false, error: "meetupGroups.deleteMany requires non-empty ids array" };
    if (ids.length > MAX_DELETE_IDS) return { ok: false, error: `meetupGroups.deleteMany: at most ${MAX_DELETE_IDS} ids` };
    for (const id of ids) {
      if (typeof id !== "string" || !id) return { ok: false, error: "meetupGroups.deleteMany: each id must be a non-empty string" };
    }
    const r = await db.collection(COL.meetupGroups).deleteMany({ id: { $in: ids } });
    return { ok: true, data: { deletedCount: r.deletedCount } };
  }

  if (resource === "site" && action === "put") {
    const doc = op.document;
    if (!isPlainObject(doc)) return { ok: false, error: "site.put requires document object" };
    const { _id, ...rest } = doc as unknown as SiteDoc & { _id?: unknown };
    const full = { _id: "main" as const, ...rest } as SiteDoc;
    const imgErr = validateSiteRasterUrls(full as unknown as Record<string, unknown>);
    if (imgErr) return { ok: false, error: imgErr };
    await db.collection(COL.site).replaceOne({ _id: "main" as never }, full, { upsert: true });
    return { ok: true };
  }

  if (resource === "brain" && action === "put") {
    const doc = op.document;
    if (!isPlainObject(doc)) return { ok: false, error: "brain.put requires document object" };
    const { _id, ...rest } = doc as unknown as BrainSettingsDoc & { _id?: unknown };
    const full = { _id: "main" as const, ...rest } as BrainSettingsDoc;
    await db.collection(COL.brain).replaceOne({ _id: "main" as never }, full, { upsert: true });
    return { ok: true };
  }

  // --- existing writes (unchanged semantics) ---
  if (resource === "provider" && action === "upsert") {
    const doc = op.document;
    if (!isPlainObject(doc)) return { ok: false, error: "provider.upsert requires document object" };
    const { _id, ...rest } = doc as unknown as Provider & { _id?: unknown };
    if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "provider.document.id required" };
    const imgErr = validateProviderImages(rest);
    if (imgErr) return { ok: false, error: imgErr };
    const localeErrs = validateProviderLocalesForIngest(rest.locales, "provider.document");
    if (localeErrs.length) return { ok: false, error: localeErrs.join("; ") };
    const withMenu = finalizeProvider(rest as Provider);
    await db.collection(COL.providers).replaceOne({ id: withMenu.id }, withMenu, { upsert: true });
    batch.providerIdsInBatch.add(withMenu.id);
    await refreshEventsLinkedToHost(db, withMenu.id);
    return { ok: true };
  }

  if (resource === "provider" && action === "patch") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "provider.patch requires id string" };
    const patchIn = op.patch;
    if (!isPlainObject(patchIn)) return { ok: false, error: "provider.patch requires patch object" };
    const { id: _drop, ...patchRaw } = patchIn as { id?: string };
    const patch = patchRaw as Partial<Provider>;
    if (Object.keys(patch).length === 0) return { ok: false, error: "provider.patch patch must not be empty" };
    const cur = (await db.collection(COL.providers).findOne({ id })) as unknown as Provider | null;
    if (!cur) return { ok: false, error: `provider.patch: unknown id ${id}` };
    const merged: Provider = { ...cur, ...patch };
    if (patch.locales) {
      merged.locales = mergeProviderLocales(cur.locales, patch.locales);
    }
    const imgErr = validateProviderImages(merged);
    if (imgErr) return { ok: false, error: imgErr };
    const final = finalizeProvider(merged);
    const setDoc: Partial<Provider> = {};
    for (const key of Object.keys(patch) as (keyof Provider)[]) {
      (setDoc as Record<string, unknown>)[key as string] = final[key];
    }
    if (patch.menu !== undefined) {
      setDoc.menu = final.menu;
      setDoc.menuTags = final.menuTags;
    }
    await db.collection(COL.providers).updateOne({ id }, { $set: setDoc });
    await refreshEventsLinkedToHost(db, id);
    return { ok: true };
  }

  if (resource === "provider" && action === "delete") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "provider.delete requires id string" };
    await db.collection(COL.providers).deleteOne({ id });
    return { ok: true };
  }

  if (resource === "providers" && action === "upsertMany") {
    const documents = op.documents;
    if (!Array.isArray(documents) || documents.length === 0) {
      return { ok: false, error: "providers.upsertMany requires non-empty documents array" };
    }
    const writes: AnyBulkWriteOperation<Document>[] = [];
    for (const raw of documents) {
      if (!isPlainObject(raw)) return { ok: false, error: "providers.upsertMany: each item must be an object" };
      const { _id, ...rest } = raw as unknown as Provider & { _id?: unknown };
      if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "providers.upsertMany: each document needs string id" };
      const imgErr = validateProviderImages(rest);
      if (imgErr) return { ok: false, error: imgErr };
      const localeErrs = validateProviderLocalesForIngest(rest.locales, `providers.upsertMany document ${rest.id}`);
      if (localeErrs.length) return { ok: false, error: localeErrs.join("; ") };
      writes.push({
        replaceOne: {
          filter: { id: rest.id },
          replacement: withResolvedLocation(applyMenuToProvider(rest) as Provider) as unknown as Document,
          upsert: true,
        },
      });
    }
    await db.collection(COL.providers).bulkWrite(writes, { ordered: false });
    return { ok: true };
  }

  if (resource === "meetupGroup" && action === "upsert") {
    const doc = op.document;
    if (!isPlainObject(doc)) return { ok: false, error: "meetupGroup.upsert requires document object" };
    const { _id, venueLinks: _vl, eventLinks: _el, ...rest } = doc as unknown as MeetupGroup & {
      _id?: unknown;
    };
    if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "meetupGroup.document.id required" };
    const imgErr = validateMeetupCover(rest);
    if (imgErr) return { ok: false, error: imgErr };
    const stored = await finalizeMeetupGroup(db, rest as MeetupGroup);
    if ("error" in stored) return { ok: false, error: stored.error };
    await db.collection(COL.meetupGroups).replaceOne({ id: rest.id }, stored as unknown as Document, {
      upsert: true,
    });
    return { ok: true };
  }

  if (resource === "meetupGroup" && action === "patch") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "meetupGroup.patch requires id string" };
    const patchIn = op.patch;
    if (!isPlainObject(patchIn)) return { ok: false, error: "meetupGroup.patch requires patch object" };
    const { id: _drop, venueLinks: _vl, eventLinks: _el, ...patch } = patchIn as Partial<MeetupGroup> & {
      id?: string;
    };
    if (Object.keys(patch).length === 0) return { ok: false, error: "meetupGroup.patch patch must not be empty" };
    const cur = (await db.collection(COL.meetupGroups).findOne({ id })) as unknown as MeetupGroup | null;
    if (!cur) return { ok: false, error: `meetupGroup.patch: unknown id ${id}` };
    const merged = { ...cur, ...patch } as MeetupGroup;
    const imgErr = validateMeetupCover(merged);
    if (imgErr) return { ok: false, error: imgErr };
    const stored = await finalizeMeetupGroup(db, merged);
    if ("error" in stored) return { ok: false, error: stored.error };
    await db.collection(COL.meetupGroups).replaceOne({ id }, stored as unknown as Document);
    return { ok: true };
  }

  if (resource === "meetupGroup" && action === "delete") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "meetupGroup.delete requires id string" };
    await db.collection(COL.meetupGroups).deleteOne({ id });
    return { ok: true };
  }

  if (resource === "meetupGroups" && action === "upsertMany") {
    const documents = op.documents;
    if (!Array.isArray(documents) || documents.length === 0) {
      return { ok: false, error: "meetupGroups.upsertMany requires non-empty documents array" };
    }
    const writes: AnyBulkWriteOperation<Document>[] = [];
    for (const raw of documents) {
      if (!isPlainObject(raw)) return { ok: false, error: "meetupGroups.upsertMany: each item must be an object" };
      const { _id, venueLinks: _vl, eventLinks: _el, ...rest } = raw as unknown as MeetupGroup & { _id?: unknown };
      if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "meetupGroups.upsertMany: each document needs string id" };
      const imgErr = validateMeetupCover(rest);
      if (imgErr) return { ok: false, error: imgErr };
      const stored = await finalizeMeetupGroup(db, rest as MeetupGroup);
      if ("error" in stored) return { ok: false, error: stored.error };
      writes.push({
        replaceOne: {
          filter: { id: rest.id },
          replacement: stored as unknown as Document,
          upsert: true,
        },
      });
    }
    await db.collection(COL.meetupGroups).bulkWrite(writes, { ordered: false });
    return { ok: true };
  }

  if (resource === "site" && action === "patch") {
    const patch = op.patch;
    if (!isPlainObject(patch)) return { ok: false, error: "site.patch requires patch object" };
    const { _id: _dropId, ...rest } = patch as Partial<SiteDoc>;
    const imgErr = validateSiteRasterUrls(rest as unknown as Record<string, unknown>);
    if (imgErr) return { ok: false, error: imgErr };
    await db.collection(COL.site).updateOne(
      { _id: "main" as never },
      { $set: { ...rest, _id: "main" } },
      { upsert: true },
    );
    return { ok: true };
  }

  if (resource === "brain" && action === "patch") {
    const patch = op.patch;
    if (!isPlainObject(patch)) return { ok: false, error: "brain.patch requires patch object" };
    const { _id: _dropId, ...rest } = patch as Partial<BrainSettingsDoc>;
    await db.collection(COL.brain).updateOne(
      { _id: "main" as never },
      { $set: { ...rest, _id: "main" } },
      { upsert: true },
    );
    return { ok: true };
  }

  if (resource === "event" && action === "upsert") {
    const doc = op.document;
    if (!isPlainObject(doc)) return { ok: false, error: "event.upsert requires document object" };
    const parsed = nightEventSchema.safeParse(doc);
    if (!parsed.success) return { ok: false, error: parsed.error.message };
    const { _id, ...rest } = doc as unknown as NightEvent & { _id?: unknown };
    if (!rest.id || typeof rest.id !== "string") return { ok: false, error: "event.document.id required" };
    const imgErr = validateProviderImages({ image: rest.image, galleryImages: rest.galleryImages });
    if (imgErr) return { ok: false, error: imgErr };
    const localeErrs = validateEventLocalesForIngest(rest.locales, "event.document");
    if (localeErrs.length) return { ok: false, error: localeErrs.join("; ") };
    const hostsResult = await loadEventHosts(db, parsed.data.venueIds);
    if ("error" in hostsResult) return { ok: false, error: hostsResult.error };
    const eventDoc = parsed.data as NightEvent;
    const { venueLinks: _dropLinks, ...withoutLinks } = eventDoc;
    const stored = prepareNightEventWithVenues(withoutLinks as NightEvent, hostsResult.hosts);
    await db.collection(COL.events).replaceOne({ id: rest.id }, stored as unknown as Document, {
      upsert: true,
    });
    return { ok: true };
  }

  if (resource === "event" && action === "patch") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "event.patch requires id string" };
    const patchIn = op.patch;
    if (!isPlainObject(patchIn)) return { ok: false, error: "event.patch requires patch object" };
    const { id: _drop, venueLinks: _dropLinks, ...patch } = patchIn as Partial<NightEvent> & {
      id?: string;
    };
    if (Object.keys(patch).length === 0) return { ok: false, error: "event.patch patch must not be empty" };
    const cur = (await db.collection(COL.events).findOne({ id })) as unknown as NightEvent | null;
    if (!cur) return { ok: false, error: `event.patch: unknown id ${id}` };
    const merged: NightEvent = { ...cur, ...patch };
    if (patch.locales) merged.locales = mergeEventLocales(cur.locales, patch.locales);
    const parsed = nightEventSchema.safeParse(merged);
    if (!parsed.success) return { ok: false, error: parsed.error.message };
    const imgErr = validateProviderImages({
      image: merged.image,
      galleryImages: merged.galleryImages,
    });
    if (imgErr) return { ok: false, error: imgErr };
    const localeErrs = validateEventLocalesForIngest(merged.locales, "event.patch");
    if (localeErrs.length) return { ok: false, error: localeErrs.join("; ") };
    const hostsResult = await loadEventHosts(db, parsed.data.venueIds);
    if ("error" in hostsResult) return { ok: false, error: hostsResult.error };
    const stored = prepareNightEventWithVenues(parsed.data as NightEvent, hostsResult.hosts);
    await db.collection(COL.events).replaceOne({ id }, stored as unknown as Document);
    return { ok: true };
  }

  if (resource === "event" && action === "delete") {
    const id = op.id;
    if (typeof id !== "string" || !id) return { ok: false, error: "event.delete requires id string" };
    await db.collection(COL.events).deleteOne({ id });
    return { ok: true };
  }

  if (resource === "locations" && action === "replace") {
    const locations = op.locations;
    if (!Array.isArray(locations)) return { ok: false, error: "locations.replace requires locations array" };
    for (const row of locations) {
      if (!isPlainObject(row)) return { ok: false, error: "locations.replace: each row must be an object" };
      if (typeof row.borough !== "string") return { ok: false, error: "locations.replace: each row needs borough" };
      if (!Array.isArray(row.neighborhoods)) return { ok: false, error: "locations.replace: each row needs neighborhoods array" };
    }
    await db.collection(COL.locations).deleteMany({});
    if (locations.length > 0) {
      await db.collection(COL.locations).insertMany(locations as LocRow[]);
    }
    return { ok: true };
  }

  return { ok: false, error: `unknown resource/action: ${String(resource)}/${String(action)}` };
}
