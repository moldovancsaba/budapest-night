import type { AgeRange, Borough, Category, DayTimeTag, FeaturedBadge } from "@/types/provider";
import type { EventLocalesMap } from "@/types/eventLocale";

export type EventStatus = "scheduled" | "cancelled" | "sold_out" | "postponed";

export type EventCurrency = "HUF" | "EUR" | "FREE";

export type EntryFeeSource = "published" | "estimated";

/** Denormalized host venue snapshot (set on ingest from linked providers). */
export type EventVenueLink = {
  id: string;
  name: string;
  category: Category;
  borough: Borough;
  neighborhood: string;
  address: string;
};

/** Ticket tier or admission type for a timed event. */
export type EntryFee = {
  id: string;
  label: string;
  amount: number;
  currency: EventCurrency;
  source: EntryFeeSource;
  notes?: string;
};

/** Timed happening — concerts, festivals, exhibitions with a schedule (not a venue listing). */
export interface NightEvent {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  /** ISO 8601 with offset, e.g. 2026-08-01T18:00:00+02:00 */
  startsAt: string;
  endsAt: string;
  /** IANA timezone; defaults to Europe/Budapest when omitted. */
  timezone?: string;
  /** One or more provider ids (venues hosting this event). */
  venueIds: string[];
  /** Host venue snapshots — always set on ingest; used when catalog lookup fails. */
  venueLinks?: EventVenueLink[];
  /** Denormalized for district filters (primary host borough). */
  borough: Borough;
  neighborhood: string;
  entryFees: EntryFee[];
  activityTypes: string[];
  ageRanges: AgeRange[];
  dayTimeTags: DayTimeTag[];
  badges: FeaturedBadge[];
  image: string;
  galleryImages?: string[];
  website: string;
  bookingUrl: string;
  email: string;
  phone: string;
  status: EventStatus;
  /** Gate / doors open before show (ISO); optional when only show start is published. */
  doorsOpenAt?: string;
  locales?: EventLocalesMap;
}
