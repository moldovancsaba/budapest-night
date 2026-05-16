/**
 * Raster image rules for curator prompts + LLM extractors.
 * Keep in sync with `scripts/ingest-listing-automation.cjs`, `scripts/patch-venue-meetup-images.cjs`,
 * and `scripts/patch-event-images.cjs`.
 */

/** Known-bad ImgBB filename hashes from past bulk mistakes (do not reuse). */
export const BANNED_IMGBB_HASHES = [
  "cde3b78d5c56", // Johannes Oerding concert art wrongly used on 14+ culture circles
  "cb56a463140e", // Budapest Park generic graphic on events + MVM Dome
  "cf91ad578e08", // wrong upload reused on MOM + others
  "5e673e7e0093", // wrong upload (e.g. Frici Papa)
  "038fd3264859", // wrong upload (e.g. Vegazzi)
] as const;

export function getCatalogImageUniquenessRulesForPrompt(): string {
  return `## Catalog-wide image uniqueness (blocking — all listing types)

Every **provider** \`image\`, **meetup** \`coverImageUrl\`, and **event** \`image\` must be:
1. A non-empty **https ImgBB** URL (\`https://i.ibb.co/...\` or \`*.ibb.co\`).
2. **Unique** in the live catalog — no two unrelated rows may share the same ImgBB URL.
3. **Appropriate** to that row (venue interior/exterior for venues; district/community scene for culture circles; show poster for events).

### Before ingest (mandatory audit)
Fetch all three catalogs and build a set of existing image URLs:
\`\`\`bash
curl -s https://budapest-night.vercel.app/api/public/providers | jq -r '.[].image' | sort -u
curl -s https://budapest-night.vercel.app/api/public/meetup-groups | jq -r '.[].coverImageUrl' | sort -u
curl -s https://budapest-night.vercel.app/api/public/events | jq -r '.[].image' | sort -u
\`\`\`
Your new URL must **not** appear in any of those lists (unless you are patching the same \`id\`).

Also reject filenames containing these known-bad hashes (past production incidents): ${BANNED_IMGBB_HASHES.join(", ")}.

### Never do this
| Mistake | Symptom |
|---------|---------|
| Paste the same ImgBB URL on 2+ providers, meetups, or events | Identical cards in Discover / Culture circles |
| Use a **concert poster** (artist on stage) as a **venue** or **culture circle** cover | Wrong branding (e.g. Johannes Oerding on Óbuda food walks) |
| Copy \`provider.image\` onto a timed \`event\` | Every show at that venue looks identical |
| Reuse one downloaded file for a whole batch without re-uploading per row | Same \`i.ibb.co/.../hash.jpg\` on 10+ listings |
| Use site-wide \`og:image\` (favicon, generic park banner) when a page-specific asset exists | Misleading hero |

### Repair scripts (production)
- Events only: \`npm run db:patch-event-images\`
- Venues + culture circles: \`npm run db:patch-venue-meetup-images\`
- Single venue: \`node scripts/fix-provider-one.cjs <prov-id>\``;
}

export function getProviderImageIngestRulesForPrompt(): string {
  return `## Provider listing image (\`image\`) — blocking

**Use:** official venue photo — interior, exterior, terrace, or institution hero from the venue’s own site (\`og:image\` on **about** or **visit** page, Webflow/video poster on their homepage, not a random blog). The photo must depict **this venue at this address**, not a generic “kiosk” newsstand or metro shop elsewhere in the city.

**Do not use:**
- A timed **concert poster** or ticket-page artist photo (those belong on \`resource: "event"\` only).
- Another venue’s ImgBB URL from the catalog.
- Budapest Park’s generic “gates / park” graphic (\`cb56a463140e.jpg\`) except on the **Budapest Park** provider row with a **venue-appropriate** park photo from budapestpark.hu.
- MVM Dome **tour artwork** on the venue row — venue row = building/arena; Sting poster = \`event.image\`.

**Workflow:**
1. Download from official source → \`scripts/imgbb-asset-sources/providers/<slug>.jpg\`
2. Upload (\`POST /api/ingest/upload\` or ImgBB API) → one **new** URL per provider
3. Confirm URL is unique vs \`GET /api/public/providers\`
4. Record source URL in \`sourceUrls\` or \`notes\`

**Venue card ≠ event poster:** Frici Papa, Vegazzi, MOM Kulturális Központ, etc. each need their **own** restaurant/institution photo, not shared concert art.`;
}

export function getMeetupCoverImageIngestRulesForPrompt(): string {
  return `## Culture circle cover (\`coverImageUrl\`) — blocking

Meetup groups are **community / district circles**, not single concerts. The cover must suggest the **neighborhood or theme** (cafés, gallery walk, riverside, spa), not a random arena show.

**Required:**
- Non-empty https ImgBB \`coverImageUrl\` on every \`meetupGroup\` upsert.
- **One unique URL per group** — never assign the same \`coverImageUrl\` to Kolosy tér, Bécsi út, and Main Square Óbuda in one batch.
- Image from official circle \`website\`, linked venue’s site, or **Commons** photo of that **district** (verify HTTP 200 before upload).

**Forbidden:**
- Reusing \`cde3b78d5c56.jpg\` or any concert poster shared across groups (fixed in production May 2026).
- Copying another meetup’s \`coverImageUrl\` from the catalog.
- Copying a timed event’s \`image\` onto the meetup.
- Bulk-ingesting identical placeholder files (same bytes → same ImgBB URL for 10+ cards).

**Workflow:**
1. Pick a **distinct** scene per \`grp-*\` id (download or photograph source).
2. Upload separately → unique \`https://i.ibb.co/...\` per group.
3. Audit: \`GET /api/public/meetup-groups\` — count rows per \`coverImageUrl\`; any count > 1 is a failure.

**Optional links:** \`venueIds\` / \`eventIds\` do not supply the cover — still upload a dedicated \`coverImageUrl\`.`;
}

export function getImageIngestRulesForPrompt(): string {
  return `${getCatalogImageUniquenessRulesForPrompt()}

${getProviderImageIngestRulesForPrompt()}

${getMeetupCoverImageIngestRulesForPrompt()}`;
}
