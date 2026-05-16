import type { Provider } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import type { NightEvent } from "@/types/event";
import { BANNED_IMGBB_HASHES } from "@/lib/curator/imageIngestRules";

export type ImageOwner = { kind: "provider" | "event" | "meetupGroup"; id: string };

export function imgbbFilenameHash(url: string): string {
  const u = url.trim();
  const m = u.match(/\/([^/]+)\.(jpg|jpeg|png|webp)$/i);
  return m ? m[1].replace(/\.(jpg|jpeg|png|webp)$/i, "") : "";
}

export function isBannedImageUrl(url: string): boolean {
  const u = url.trim();
  if (!u) return false;
  const hash = imgbbFilenameHash(u);
  return BANNED_IMGBB_HASHES.some((banned) => hash.includes(banned) || u.includes(banned));
}

export function buildCatalogImageIndex(
  providers: Pick<Provider, "id" | "image">[],
  events: Pick<NightEvent, "id" | "image">[],
  meetups: Pick<MeetupGroup, "id" | "coverImageUrl">[],
): Map<string, ImageOwner[]> {
  const byUrl = new Map<string, ImageOwner[]>();
  const add = (url: string | undefined, kind: ImageOwner["kind"], id: string) => {
    const u = (url || "").trim();
    if (!u) return;
    const row = byUrl.get(u) ?? [];
    row.push({ kind, id });
    byUrl.set(u, row);
  };
  for (const p of providers) add(p.image, "provider", p.id);
  for (const e of events) add(e.image, "event", e.id);
  for (const m of meetups) add(m.coverImageUrl, "meetupGroup", m.id);
  return byUrl;
}

export function isImageUsedByOtherListing(
  url: string,
  self: { kind: ImageOwner["kind"]; id: string },
  catalogByUrl: Map<string, ImageOwner[]>,
): boolean {
  const u = url.trim();
  if (!u) return false;
  const owners = catalogByUrl.get(u) ?? [];
  return owners.some((o) => !(o.kind === self.kind && o.id === self.id));
}
