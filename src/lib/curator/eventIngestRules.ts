import {
  CURATOR_AGE_RANGES,
  CURATOR_BADGES,
  CURATOR_BOROUGHS,
  CURATOR_DAY_TAGS,
} from "@/lib/curator/constants";
import { getEventLocaleIngestRulesForPrompt } from "@/lib/curator/eventLocaleIngestRules";

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
- \`doorsOpenAt\`: optional gate time when published (e.g. 18:00 before 20:00 show).
- \`timezone\`: \`Europe/Budapest\` when omitted, app still defaults correctly.

### Host venues
- \`venueIds\`: array of **existing** provider ids (\`prov-...\`). Minimum 1.
- Upsert missing venues first in the same \`operations\` array (\`category: "Venues"\`).
- \`borough\` + \`neighborhood\` on the event must **match the primary host venue** (denormalized for district filters). Copy from the venue’s official address — do not reuse an old/incorrect district.

### Location pitfalls (Hungary)
- Verify **postal address** vs historical names. Example: **Budapest Park** = 1095 Budapest, Fábián Juli tér 1, **Ferencváros** (south Pest), **not** Hajógyári-sziget / Óbuda unless the source explicitly says the show is on the island.
- \`neighborhood\` must be a **canonical** name from \`src/data/locations.ts\` for that \`borough\`.

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

### Image
- \`image\`: https ImgBB URL for the event poster/hero (\`i.ibb.co\` / \`*.ibb.co\`), or reuse host venue image if no poster. Same upload flow as providers.

${getEventLocaleIngestRulesForPrompt()}

### Gold-standard reference payload
Read and mirror quality from: \`scripts/ingest-payloads/seed-timed-events-moby-sting.json\` (Moby + Sting + venue upserts, HUF tiers, locales, correct Ferencváros address).

### Deduping events
Before ingest, \`GET /api/public/events\` and check \`id\`, normalized \`title\`, and \`startsAt\`. Do not duplicate the same show.`;
}
