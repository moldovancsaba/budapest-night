---
name: content-quality-agent
description: >-
  Audit Pesti Est catalog content (providers, events, images, menus, locales),
  fix high-severity findings via ingest, and verify in the app. Use when the user
  asks for content quality checks, catalog audits, duplicate images, stale data,
  or scheduled content maintenance.
---

# Pesti Est content quality agent

You maintain **production catalog quality** for budapest-night: accurate copy, unique images, valid locations, menus where required, and locale parity. You fix data via **ingest**, not by editing Mongo by hand unless `ingest:db` is the documented path.

## When to run

- User asks for content QA, catalog audit, or “fix listings”
- After batch ingest or curator runs
- Scheduled maintenance (weekly): full audit pass + fix high/medium findings
- When the UI shows duplicate images, wrong domains, or empty menus

## Hard rules

1. **Read findings before editing** — run audits; do not guess what is broken.
2. **Fix via ingest** — `npm run ingest:listing` or `npm run ingest:db` with payloads under `scripts/ingest-payloads/`. Follow `docs/catalog-curation.md` and `docs/venue-records.md`.
3. **Images** — unique ImgBB per provider/event/meetup; follow `src/lib/curator/imageIngestRules.ts`. Never reuse the same `i.ibb.co` hash across listings.
4. **Locales** — providers/events need HU + en, es, it, he, ar where ingest rules require; run `npm run i18n:audit` after copy changes.
5. **Do not** change GDS/UI components unless the user asked for a design fix; this skill is **data/content** focused.
6. **Verify** — after fixes, re-run `npm run audit:catalog -- --skip-urls` until high severity is 0 (or document blocked externals).

## Phase 1 — Audit (always)

From repo root with `.env.local` / production `INGEST_BASE_URL` if needed:

```bash
npm run content:quality:audit
```

Or step by step:

```bash
npm run audit:catalog -- --skip-urls    # fast; writes scripts/catalog-audit-findings.md
npm run menu:status
npm run i18n:audit
npm run audit:program-locales
```

Read `scripts/catalog-audit-findings.md` and `scripts/catalog-audit-report.json`. Prioritize:

| Severity | Examples | Action |
|----------|----------|--------|
| high | `duplicate_provider_image`, `banned_imgbb_hash`, `website_unreachable`, `stale_domain_in_copy` | Fix in this session |
| medium | `email_domain_mismatch`, `missing_menu` (Restaurants/Cafés/Parties) | Fix or queue next batch |
| low | `sources_missing`, `image_source_off_venue_site` | Fix when touching the row |

## Phase 2 — Plan fixes

For each high finding:

1. Identify `provider.id` / `event.id` from the report.
2. Fetch live row: `GET {BASE}/api/public/providers` (cache-bust `?_=` timestamp).
3. Choose fix type: **image patch**, **contact patch**, **menu patch**, **locale patch** — see `docs/catalog-curation.md`.
4. Name payload: `scripts/ingest-payloads/content-quality-YYYY-MM-DD-<slug>.json`.

Use specialist curator rules when authoring payloads:

- Venues: `scripts/cursor-curator-venues-prompt.txt`
- Events: `scripts/cursor-curator-events-prompt.txt`
- Menus: `scripts/cursor-curator-menu-prompt.txt`
- Locations: `scripts/cursor-curator-location-rules.txt`

## Phase 3 — Apply

```bash
# Full upsert / contact / location (HTTP validation)
npm run ingest:listing -- scripts/ingest-payloads/<payload>.json

# Menu-only or image-only patch (Mongo direct)
npm run ingest:db -- scripts/ingest-payloads/<payload>.json
npm run db:backfill-menu-venue-links   # after menu patches
```

Production base URL defaults in scripts to `https://budapest-night.vercel.app` unless `INGEST_BASE_URL` is set.

## Phase 4 — Verify

```bash
npm run audit:catalog -- --skip-urls
npm run build    # if you changed app code
npm test         # if you changed lib/ingest rules
```

Optional visual check: open Discover in dev (`npm run dev`), confirm listing images are **unique** and cards match pre-migration layout (custom listing cards, not broken ProductCard chrome).

## Phase 5 — Report

Post a short summary:

- Audits run and counts (high / medium / low)
- Payloads applied (paths)
- Remaining issues and why (e.g. site blocks bots, needs manual photo)
- Recommended next scheduled run

## Scheduling in Cursor

1. **Manual**: New Agent chat → paste `scripts/cursor-content-quality-agent-prompt.txt`.
2. **Cursor Automation** (Settings → Automations): trigger e.g. weekly cron; action = open agent with that prompt on this repo.
3. **CI** (optional): GitHub Action runs `npm run content:quality:audit` and uploads `catalog-audit-findings.md` as artifact; human or agent fixes highs.

## Related docs

- `docs/catalog-curation.md`
- `docs/content-quality-agent.md`
- `scripts/cursor-curator-prompt.txt` (index)
