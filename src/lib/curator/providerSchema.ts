import { z } from "zod";
import {
  CURATOR_BADGES,
  CURATOR_BOROUGHS,
  CURATOR_CATEGORIES,
  CURATOR_AGE_RANGES,
  CURATOR_DAY_TAGS,
} from "@/lib/curator/constants";
import { locales } from "@/i18n/config";
import { isImgBbHttpsImageUrl } from "@/lib/imgbbUrl";

const localeKey = z.enum(locales);

const providerLocaleContentSchema = z
  .object({
    name: z.string().min(2).max(160).optional(),
    shortDescription: z.string().min(10).max(400).optional(),
    longDescription: z.string().min(40).max(8000).optional(),
    address: z.string().min(8).max(200).optional(),
    activityTypes: z.array(z.string().min(1).max(60)).max(12).optional(),
    announcementTitle: z.string().max(120).optional(),
    announcementDescription: z.string().max(500).optional(),
    announcementBadge: z.string().max(60).optional(),
    image: z
      .string()
      .max(2000)
      .refine((s) => !s.trim() || isImgBbHttpsImageUrl(s), { message: "locale image must be ImgBB https URL" })
      .optional(),
    slug: z
      .string()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
  })
  .strict();

const category = z.enum(CURATOR_CATEGORIES);
const borough = z.enum(CURATOR_BOROUGHS);
const ageRange = z.enum(CURATOR_AGE_RANGES);
const dayTag = z.enum(CURATOR_DAY_TAGS);
const badge = z.enum(CURATOR_BADGES);

/** Strict provider document for curated / LLM output (matches Mongo ingest shape). */
export const curatedProviderSchema = z
  .object({
    id: z.string().min(4).max(80).regex(/^prov-[a-z0-9-]+$/),
    name: z.string().min(2).max(160),
    category,
    borough,
    neighborhood: z.string().min(2).max(80),
    address: z.string().min(8).max(200),
    activityTypes: z.array(z.string().min(1).max(60)).min(1).max(12),
    ageRanges: z.array(ageRange).min(1).max(5),
    dayTimeTags: z.array(dayTag).min(1).max(8),
    pricePerClass: z.number().nonnegative().max(50000),
    shortDescription: z.string().min(10).max(400),
    longDescription: z.string().min(40).max(8000),
    rating: z.number().min(0).max(5),
    reviewCount: z.number().int().min(0).max(1_000_000),
    badges: z.array(badge).max(4),
    image: z
      .string()
      .max(2000)
      .refine((s) => !s.trim() || isImgBbHttpsImageUrl(s), { message: "image must be empty or an https ImgBB URL (i.ibb.co)" }),
    galleryImages: z
      .array(
        z
          .string()
          .url()
          .refine((s) => isImgBbHttpsImageUrl(s), { message: "each galleryImages entry must be an https ImgBB URL" }),
      )
      .max(8)
      .optional(),
    email: z.string().max(200),
    website: z.string().url().max(500),
    phone: z.string().max(80),
    announcementTitle: z.string().max(120).optional(),
    announcementDescription: z.string().max(500).optional(),
    announcementBadge: z.string().max(60).optional(),
    bookingEnabled: z.boolean().optional(),
    locales: z.record(localeKey, providerLocaleContentSchema).optional(),
  })
  .strict();

export type CuratedProvider = z.infer<typeof curatedProviderSchema>;
