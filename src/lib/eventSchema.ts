import { z } from "zod";

const isoDateTime = z.string().min(10);

export const entryFeeSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().min(1).max(120),
  amount: z.number().min(0),
  currency: z.enum(["HUF", "EUR", "FREE"]),
  source: z.enum(["published", "estimated"]),
  notes: z.string().max(300).optional(),
});

export const nightEventSchema = z.object({
  id: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  shortDescription: z.string().min(1).max(500),
  longDescription: z.string().min(1).max(8000),
  startsAt: isoDateTime,
  endsAt: isoDateTime,
  timezone: z.string().max(64).optional(),
  venueIds: z.array(z.string().min(1)).min(1).max(12),
  venueLinks: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        category: z.string().min(1),
        borough: z.string().min(1),
        neighborhood: z.string().min(1),
        address: z.string().min(1),
      }),
    )
    .max(12)
    .optional(),
  borough: z.string().min(1),
  neighborhood: z.string().min(1),
  entryFees: z.array(entryFeeSchema).max(24),
  activityTypes: z.array(z.string()).max(16),
  ageRanges: z.array(z.string()).min(1),
  dayTimeTags: z.array(z.string()).min(1),
  badges: z.array(z.string()).max(8),
  image: z.string().max(500),
  galleryImages: z.array(z.string().url()).max(12).optional(),
  website: z.string().url().max(500).or(z.literal("")),
  bookingUrl: z.string().url().max(500).or(z.literal("")),
  email: z.string().max(200),
  phone: z.string().max(80),
  status: z.enum(["scheduled", "cancelled", "sold_out", "postponed"]),
  doorsOpenAt: isoDateTime.optional(),
  locales: z.record(z.string(), z.any()).optional(),
});
