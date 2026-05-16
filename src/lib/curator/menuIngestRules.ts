import { MENU_TAGS } from "@/data/menuTags";
import { getMenuLocaleIngestRulesForPrompt } from "@/lib/curator/menuLocaleIngestRules";

/**
 * Prompt block for menu enrichment ingest (provider patch/upsert with `menu`).
 * Gold example: `scripts/ingest-payloads/example-menu-sample.json`
 */
export function getMenuIngestRulesForPrompt(): string {
  const tags = MENU_TAGS.join(", ");
  return `## Eat & Drink menu ingest (provider \`menu\` field)

Goal: publish **real food and drink items** on an **existing** \`prov-*\` venue so /eat-drink can search them and themed tours (pálinka, foodie, coffee) can pick three stops with matching dishes/drinks.

### Venue link (required)
- Menus attach to **one provider row** (\`resource: "provider"\`, \`action: "patch"\` or \`upsert\` with stable \`id: "prov-..."\`).
- The venue must already exist in the catalog (or be upserted **before** the menu patch in the same payload).
- On ingest, the server writes \`menu.venueLink\` (\`id\`, \`name\`, \`category\`, \`borough\`, \`neighborhood\`, \`address\`, \`website\`, \`menuUrl\`) — **do not** author \`venueLink\` manually.
- \`category\` must match the host: **Restaurants**, **Cafés**, **Parties**, or **Venues** (bar, ruin pub, etc.).

### Source of truth
- Official venue menu page, PDF, on-site board, or **official menu images** on the venue site — not guesses from vibes alone.
- Record \`menu.menuUrl\` and \`menu.sourceUrls[]\` (https). Include direct PNG/JPG URLs when the menu is image-only.
- Set \`menu.lastVerifiedAt\` to ISO date (YYYY-MM-DD) when you verified prices.

### Menu published only as PNG/JPG on the website
When the official menu is **not** HTML or PDF but one or more **menu images** (common on bar/restaurant WordPress sites):
1. **Find** image URLs on the venue menu page (\`curl\` / fetch HTML; look for \`wp-content/uploads/...menu....png\`).
2. **Download** each image to the repo (e.g. \`scripts/menu-sources/<venue-slug>/menu-1.png\`) so prices can be re-checked later.
3. **Read** every page: open the image in the agent (vision) or OCR (\`tesseract\` if installed). Transcribe item **names**, **sizes**, and **Ft/EUR** prices exactly as printed.
4. **Ingest** from that transcription with \`price.source: "published"\`. Set \`menu.sourceUrls\` to the **image URL(s)** you used (and the menu landing page).
5. Do **not** skip the venue as “no menu” and do **not** substitute third-party price sites when official images are available.
6. If text is illegible on one panel, note it in \`missingOrUncertain\` and omit only those lines — do not guess prices.

### Structure
\`\`\`json
"menu": {
  "menuUrl": "https://venue.hu/menu",
  "sourceUrls": ["https://venue.hu/menu"],
  "lastVerifiedAt": "2026-05-16",
  "sections": [
    {
      "id": "drinks",
      "title": "Drinks",
      "kind": "drink",
      "items": [
        {
          "id": "espresso",
          "kind": "drink",
          "name": "Espresso",
          "tags": ["coffee", "specialty-coffee"],
          "price": { "amount": 890, "currency": "HUF", "unit": "each", "source": "published" }
        }
      ]
    }
  ]
}
\`\`\`

${getMenuLocaleIngestRulesForPrompt()}

### Item rules
- \`kind\`: \`food\` | \`drink\` | \`other\` — required per item.
- \`name\`: English, as printed (include size when listed, e.g. "House plum pálinka (4 cl)"); mirror in every \`locales.*.name\`.
- \`price\`: include when printed. **HUF** for forint menus, **EUR** for euro menus — never swap (1490 HUF ≠ €1490).
- \`price.unit\`: \`each\` | \`glass\` | \`bottle\` | \`portion\` | \`ticket\` when known.
- \`price.source\`: \`published\` if on menu; \`estimated\` only with note in provider \`missingOrUncertain\`.
- \`tags\`: 1–4 from canonical list only: ${tags}
- Do **not** send \`menuTags\` on the document — computed on ingest from item tags.

### Tag mapping hints
- pálinka / fruit brandy → \`palinka\`
- espresso, filter, cappuccino → \`coffee\` and/or \`specialty-coffee\`
- goulash, paprikash, lángos → \`goulash\`, \`hungarian\`, \`street-food\` as appropriate
- craft IPA, local brewery → \`craft-beer\` or \`beer\`
- ruin bar vibe (no dish) → do not tag venue without items; tag actual drinks/food

### Coverage workflow
1. \`GET /api/public/menu-items\` — see current board; \`providersWithMenu\` should rise.
2. \`GET /api/public/providers\` — pick venues in scarcest district/category **without** a full menu yet.
3. Prefer **patch** existing \`prov-*\` ids: \`{ "resource": "provider", "action": "patch", "id": "prov-...", "patch": { "menu": { ... } } }\`.
4. After ingest, verify \`GET /api/public/menu-items?tag=coffee\` (or palinka, goulash) returns rows.
5. Verify tour: \`GET /api/public/tours/palinka\` returns 3 stops (not \`not_enough_venues\`).

### Batch payloads
- One payload may patch **multiple** providers: \`operations: [ { patch menu }, { patch menu }, ... ]\`.
- Keep each operation's \`sourceUrls\` / notes focused on that venue.

### Quality bar
- At least **3–8 representative items** per venue when the menu is large; do not dump hundreds of lines.
- Include both **food and drink** sections when the source lists both.
- Vegan/vegetarian only when marked on the menu (\`dietary\` array optional).`;
}
