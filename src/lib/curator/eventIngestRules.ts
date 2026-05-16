import {
  CURATOR_AGE_RANGES,
  CURATOR_BADGES,
  CURATOR_BOROUGHS,
  CURATOR_DAY_TAGS,
} from "@/lib/curator/constants";
import { getEventLocaleIngestRulesForPrompt } from "@/lib/curator/eventLocaleIngestRules";
import { getCatalogImageUniquenessRulesForPrompt } from "@/lib/curator/imageIngestRules";
import { getLocationIngestRulesForPrompt } from "@/lib/curator/locationIngestRules";

/**
 * Prompt block for Cursor curator + any LLM authoring `resource: "event"` ingest payloads.
 * Keep in sync with `src/lib/eventSchema.ts`, `scripts/ingest-listing-automation.cjs`, and
 * gold-standard example `scripts/ingest-payloads/seed-timed-events-moby-sting.json`.
 */
export function getEventIngestRulesForPrompt(): string {
  return `## Timed events vs venues (read before ingesting)

**Venues** (\`resource: "provider"\`, \`category: "Venues"\`) = physical places (parks, arenas, clubs, galleries). They do **not** have show start/end times.

**Timed events** (\`resource: "event"\`) = a specific dated happening (concert, festival night, ticketed show) with \`startsAt\`, \`endsAt\`, ticket tiers, and one or more \`venueIds\` pointing at existing provider ids.

Never put a concert listing only as a Venues provider. Never use \`category: "Events"\` (removed). Never map a venue to the wrong district (e.g. Budapest Park is **Ferencváros / Fábián Juli**, 1095 — **not** Óbuda Island; MVM Dome is **1143 Stefánia út, Terézváros** — **not** Kelenföld / Infopark).

---

## Timed event ingest rules (blocking)

### When to create an event
- Official promoter or venue page lists a **specific date and time** (and usually tickets).
- You can link to at least one **existing** \`prov-*\` id, or upsert the host venue in the **same payload** before the event operation.

### Identity & schema
- \`id\`: \`^event-[a-z0-9-]+$\` (e.g. \`event-moby-budapest-park-2026\`).
- Zod shape: \`src/lib/eventSchema.ts\`; validator: \`scripts/ingest-listing-automation.cjs\` (\`validateEvent\`).
- \`status\`: \`scheduled\` | \`cancelled\` | \`sold_out\` | \`postponed\` (default \`scheduled\`).

### Schedule (ISO 8601 with offset)
- \`startsAt\`, \`endsAt\`: real show window from the official page (e.g. \`2026-08-01T20:00:00+02:00\`).
- \`doorsOpenAt\`: gate time when published (e.g. budapestpark.hu “Gate opening 18:00”).
- \`timezone\`: \`Europe/Budapest\` when omitted, app still defaults correctly.
- **Gates only, no stage time** (common on budapestpark.hu): set \`doorsOpenAt\` to the published gate time, \`startsAt\` to **20:00** same day, \`endsAt\` ~23:00–23:30; note in \`missingOrUncertain\`. Long opera/matinee: use published start/end (e.g. Müpa 16:00–22:20).

### Host venues (required link)
- \`venueIds\`: array of **existing** provider ids (\`^prov-[a-z0-9-]+$\`). Minimum 1; **first id = primary host** (location, cards, filters).
- Upsert every host venue **before** the event in the same \`operations\` array (\`category: "Venues"\`). Ingest **rejects** unknown \`venueIds\`.
- On ingest, the server writes \`venueLinks[]\` snapshots (\`id\`, \`name\`, \`category\`, \`borough\`, \`neighborhood\`, \`address\`) from the live provider — do **not** author \`venueLinks\` manually.
- \`borough\` + \`neighborhood\` on the event are **overwritten** from the primary host (denormalized for district filters). Still set them correctly in the payload for review.
- Multi-venue festivals: list all hosts in \`venueIds\` order (primary first).

### Scarcity (mandatory before picking shows)
- Fetch \`GET /api/public/events\` and count upcoming rows by **month** and **borough** (real district from host address, not \`prov-*\` id suffix).
- Document before/after counts in payload \`notes\`; pick shows that fill the scarcest month + district + \`activityTypes\` slice you can source officially.
- Do not batch many shows at the same host/month unless scarcity data justifies it.

${getLocationIngestRulesForPrompt()}

### Tickets & currencies (critical)
- Ticket prices belong on the **event** as \`entryFees[]\`, **not** as venue \`pricePerClass\`.
- Each fee: \`{ id, label, amount, currency, source, notes? }\`.
- \`currency\` must be **\`HUF\`** or **\`EUR\`** for paid tiers — **never** mark a paid show as \`FREE\` or \`amount: 0\` unless the official site states free admission.
- Hungarian ticket shops (budapestpark.hu, jegy.hu, etc.): amounts are **forints** → \`currency: "HUF"\` (e.g. \`26999\` displays as \`26,999 Ft\`, **not** €26999).
- Venue \`pricePerClass\` is **EUR-only** planning hint for restaurants/bars. For ticketed venues use \`pricePerClass: 0\` (shows “Price varies”) and put real tiers on the event. Optional \`priceCurrency: "HUF"\` only if you intentionally surface a HUF hint on the venue card (rare).
- Multiple tiers: one \`entryFees\` object per published tier (Arena, terrace, seated, etc.). Add \`notes\` for admin/handling fees (e.g. \`+ 1,350 Ft admin fee at checkout\`).
- If tiers are dynamic or not listed: use \`entryFees: []\` and explain in \`missingOrUncertain\` — **do not** invent €0 or FREE rows.
- \`source\`: \`published\` when copied from the ticket page; \`estimated\` only with note in \`missingOrUncertain\`.

### Copy & enums (root = English)
- \`title\`, \`shortDescription\`, \`longDescription\` (English); \`longDescription\` ends with \`Sources: https://...\`.
- \`activityTypes\`: English tags from \`src/data/catalogFilters.ts\` when possible (e.g. Live Music, Electronic, Festival).
- \`ageRanges\`: each one of: ${CURATOR_AGE_RANGES.join(", ")}.
- \`dayTimeTags\`: each one of: ${CURATOR_DAY_TAGS.join(", ")}.
- \`badges\`: subset of: ${CURATOR_BADGES.join(", ")}.
- \`borough\`: one of: ${CURATOR_BOROUGHS.join(", ")}.

### URLs & contact
- \`website\`: official event or promoter page for this date.
- \`bookingUrl\`: direct ticket purchase URL when available (else \`""\`).
- \`email\`, \`phone\`: from official source or host venue; \`""\` if unknown.

### Image (event-specific — never duplicate)
- \`image\`: https ImgBB URL (\`i.ibb.co\` / \`*.ibb.co\`) for **this show’s** official poster/hero — scraped from the **event/ticket page**, not the venue homepage.
- **Do not** put this poster on \`provider.image\` or \`meetupGroup.coverImageUrl\` — see \`src/lib/curator/imageIngestRules.ts\`.
- **Blocking mistakes (fixed in production):** copying \`provider.image\`; reusing Budapest Park’s generic park graphic (\`cb56a463140e.jpg\`) for multiple artists; using MVM Dome **building exterior** instead of Sting/tour artwork; assigning the same ImgBB URL to two events or culture circles.
- **Where to scrape:** \`og:image\` / \`twitter:image\` on the ticket URL. Site hints: budapestpark \`cdn-netpositive.com/event_images/...\` or \`/uploads/<hash>.png\` (ignore site-wide \`budapestpark-og-2021.jpg\`); mupa program hero; livenation \`dynamicmedia.livenationinternational.com/...\`; barbanegra \`/uploads/<show>.jpg\`; akvarium/durer event \`og:image\`.
- **Workflow:** download → \`scripts/imgbb-asset-sources/events/\` → upload (\`POST /api/ingest/upload\` or \`IMGBB_API_KEY\`) → unique URL in payload → before POST, confirm no other row in \`GET /api/public/events\` shares that \`image\`.
- **Last resort only:** if no show art exists, use a venue photo **not** used by any other event or that venue’s default card image; still must be a **unique** ImgBB URL in the catalog.
- Repair batch: \`npm run db:patch-event-images\` or \`event\` + \`action: "patch"\` with \`{ "image": "..." }\` only (see \`scripts/ingest-payloads/patch-event-images-unique.json\`).

${getEventLocaleIngestRulesForPrompt()}

### Gold-standard reference payloads
- \`scripts/ingest-payloads/seed-timed-events-moby-sting.json\` — venue + event upserts, HUF tiers, locales, Ferencváros address.
- \`scripts/ingest-payloads/cursor-curated-events-lp-idles-oliver-tree-2026.json\` — multi-event batch, per-show images.
- \`scripts/ingest-payloads/patch-event-images-unique.json\` — image-only patches (reference for repair).

### Deduping events
Before ingest, \`GET /api/public/events\` and check \`id\`, normalized \`title\`, and \`startsAt\`. Do not duplicate the same show.

${getCatalogImageUniquenessRulesForPrompt()}

### Pre-ingest checklist
1. Every \`venueIds\` entry exists or is upserted earlier in \`operations[]\`.
2. Every \`image\` is ImgBB https and **unique** vs all other events **and** all providers/meetups (and ≠ host \`provider.image\` unless last-resort fallback).
3. Paid shows have HUF/EUR \`entryFees\` or \`[]\` with explanation — no fake FREE tiers.
4. All five locales present; each \`longDescription\` ends with \`Sources: https://...\`.`;
}
