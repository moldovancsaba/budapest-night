import { z } from "zod";
import { MENU_TAGS } from "@/data/menuTags";

const menuTag = z.enum(MENU_TAGS);

const menuPriceSchema = z
  .object({
    amount: z.number().nonnegative().max(10_000_000),
    currency: z.enum(["HUF", "EUR"]),
    unit: z.enum(["each", "glass", "bottle", "portion", "ticket"]).optional(),
    source: z.enum(["published", "estimated"]),
  })
  .strict();

const menuItemSchema = z
  .object({
    id: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
    kind: z.enum(["food", "drink", "other"]),
    name: z.string().min(1).max(120),
    description: z.string().max(400).optional(),
    price: menuPriceSchema.optional(),
    tags: z.array(menuTag).max(12),
    dietary: z.array(z.enum(["vegan", "vegetarian", "gluten-free"])).max(4).optional(),
    available: z.boolean().optional(),
  })
  .strict();

const menuSectionSchema = z
  .object({
    id: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(80),
    kind: z.enum(["food", "drink", "mixed"]),
    items: z.array(menuItemSchema).max(120),
  })
  .strict();

export const venueMenuSchema = z
  .object({
    menuUrl: z.string().url().max(500).optional(),
    sourceUrls: z.array(z.string().url().max(500)).max(8),
    lastVerifiedAt: z.string().min(8).max(32),
    sections: z.array(menuSectionSchema).max(24),
  })
  .strict();

export const eventOfferingSchema = z
  .object({
    id: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
    title: z.string().min(1).max(120),
    startsAt: z.string().max(40).optional(),
    endsAt: z.string().max(40).optional(),
    items: z.array(menuItemSchema).max(80),
  })
  .strict();
