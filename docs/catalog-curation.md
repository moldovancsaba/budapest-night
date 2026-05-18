# Catalog curation (menus, images, audit)

Operational guide for improving the live Budapest Night catalog without full venue re-upserts. For new venue geography and contact fields, see [venue-records.md](./venue-records.md).

**Curator prompts:** `scripts/cursor-curator-menu-prompt.txt` (menus) · `scripts/cursor-curator-prompt.txt` (index)

---

## Production snapshot (2026-05-18)

| Metric | Value |
|--------|------:|
| Providers | 145 |
| With `menu.sections` | **29** (`npm run menu:status`) |
| With items in sections | **25** (`menu.sections.0.items.0` in Mongo) |
| `missing_menu` (Restaurants / Cafés / Parties) | **75** |
| High-severity audit findings | **0** |

Eat & Drink tours (`palinka`, `foodie`, `coffee`) still need more tagged menu items before `tourReadiness` clears on all locales.

---

## Catalog audit

```bash
# Fast static pass (recommended after batch ingest)
npm run audit:catalog -- --skip-urls

# Full pass including live website HEAD/GET (slow; many prov-cov-* sites block bots)
npm run audit:catalog
```

**Outputs:** `scripts/catalog-audit-report.json`, `scripts/catalog-audit-findings.md`

**Categories that require menus:** `Restaurants`, `Cafés`, `Parties` (not `Venues`).

**Usually safe to ignore (low):** `image_source_off_venue_site` when `imageSource` is Webflow CDN or Wikimedia.

**Fix first (high):** `duplicate_provider_image`, `banned_imgbb_hash`, `stale_domain_in_copy`, wrong contact domains.

---

## Ingest: HTTP vs direct Mongo

| Command | When to use |
|---------|-------------|
| `npm run ingest:listing -- [--dry-run] [--force] <payload.json>` | New **upserts**, location/contact patches, anything that must pass HTTP validation + dedupe |
| `npm run ingest:db -- <payload.json>` | **Menu-only** or **image-only** `provider` `patch` ops (no full `address` on patch), large batches, or when `POST /api/ingest` fails |

`ingest:db` runs `scripts/apply-ingest-payload.ts` → `src/lib/ingestOperations.ts` against `MONGODB_URI` / `MONGODB_DB` (default `budapest-night`).

After menu patches:

```bash
npm run db:backfill-menu-venue-links
npm run db:recompute-menu-tags   # optional; tags usually set on ingest
```

**API cache:** `GET /api/public/providers` uses CDN (`s-maxage=60`). After Mongo writes, bust with `?_=${Date.now()}` or wait ~1–2 minutes before re-auditing live JSON.

---

## Menu batches (applied)

| Batch | Payload | Generator | Venues | Notes |
|-------|---------|-----------|-------:|-------|
| Audit fix | `scripts/ingest-payloads/cursor-patch-menu-audit-fixes-2026-05-16.json` | — | 14 | First wave from audit |
| 2026-05-16 | `cursor-curated-menu-batch-2026-05-16.json` (+ batch2, 360bar) | hand / mixed | — | Early curated sets |
| 3 | `cursor-curated-menu-batch-2026-05-18-batch3.json` | `node scripts/generate-menu-batch-3.cjs` | 5 | Két Szerecsen **published**; Aszu, Bock, Stand25, Bocksay estimated |
| 4 | `cursor-curated-menu-batch-2026-05-18-batch4.json` | `node scripts/generate-menu-batch-4.cjs` | 6 | Nightlife / ruin-bar drinks (estimated) |
| 5 | `cursor-curated-menu-batch-2026-05-18-batch5.json` | `node scripts/generate-menu-batch-5.cjs` | 6 | Specialty cafés (estimated) |

**Standard apply:**

```bash
node scripts/generate-menu-batch-<N>.cjs   # if using a generator
npm run ingest:db -- scripts/ingest-payloads/cursor-curated-menu-batch-<date>-batch<N>.json
npm run db:backfill-menu-venue-links
npm run audit:catalog -- --skip-urls
```

**Gold examples:** `scripts/ingest-payloads/example-menu-sample.json` · rules in `src/lib/curator/menuIngestRules.ts`, `menuLocaleIngestRules.ts`

**Pending:** `prov-cov-hungarikum-inner` is not in production Mongo; full scrape lives in `scripts/.tmp-menu/hungarikum-hu.html` (~112 priced lines) for when that provider is ingested.

---

## Image deduplication

```bash
node scripts/patch-venue-meetup-images.cjs [--dry-run] [--write-only]
npm run ingest:db -- scripts/ingest-payloads/patch-unique-venue-meetup-images.json
```

Repairs high-severity `duplicate_provider_image` / shared meetup placeholders via local assets + Wikimedia, then patches Mongo (not `ingest:listing` for image-only rows).

---

## Contact / copy fixes

| Payload | Purpose |
|---------|---------|
| `scripts/ingest-payloads/contact-audit-fix.json` | ÓKK Sources line; clear off-domain emails (Hard Rock, Doboz) |
| `scripts/ingest-payloads/okk-locale-sources-fix.json` | ÓKK `Sources:` in hu/es/it/he/ar |

Event locale strings: `scripts/data/events-locale-translations.cjs`

---

## Verify menus on production

```bash
curl -s 'https://budapest-night.vercel.app/api/public/menu-items?locale=it&limit=5' | jq '.providersWithMenu, .tourReadiness'
curl -s 'https://budapest-night.vercel.app/api/public/tours/palinka?locale=it' | jq .
```

Pick next venues from audit `missing_menu` rows or:

```bash
npm run menu:status
```

---

## Suggested next batches

1. **Restaurants** with reachable `/etlap` or menu-board PNGs (OCR workflow in menu prompt).
2. **Party boats / clubs** — Spoon, Legenda, Lárm, etc.
3. **Tour tags** — prioritize items tagged `palinka`, `goulash`/`hungarian`/`street-food`, `coffee`/`specialty-coffee`.
4. Ingest **Hungarikum** provider, then menu from scraped HTML.
