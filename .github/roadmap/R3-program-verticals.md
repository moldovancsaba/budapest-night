## Summary

Restore Pesti Est’s **full cultural mandate** in navigation and catalog: **Mozi · Színház · Kiállítás · Koncert · Család**, not only nightlife eat/drink.

## Business outcome

- Closes the gap vs pre-2020 print table of contents
- Expands addressable SEO (“budapest mozi műsor”, “színház program”)
- Gives sales a package per vertical for institutions and chains

## User stories

- As a **user**, I filter the city program by cultural vertical in one tap
- As a **curator**, I ingest cinemas and theatres with rules distinct from ruin-bar venues
- As a **cinema**, my venue appears under Mozi with showtimes when available

## Functional requirements

### Navigation & IA
- [ ] Home + global nav: vertical chips or tabs mapping to filters (not new top-level categories unless product agrees)
- [ ] Define mapping table (document in `docs/pestiest-verticals.md`):

| Vertical | Filter logic (v1) |
|----------|-------------------|
| Mozi | `activityTypes` includes `Cinema` OR tag `cinema` OR provider subtype `cinema` |
| Színház | `Theatre` activity / tag |
| Kiállítás | `Gallery` + exhibition timed events |
| Koncert | timed `events` + `Live Music` / `Jazz` / `Electronic` |
| Család | `ageRanges` includes `Family` or `All ages` + family tag |

- [ ] Extend `ACTIVITY_TYPES` in `src/data/catalogFilters.ts` and curator constants if missing (`Cinema`, `Exhibition`, `Family program`)

### Data & ingest
- [ ] Extend `src/lib/curator/providerSchema.ts` / ingest validation for vertical-specific optional fields:
  - Cinema: `externalProgramUrl?`, `chainId?` (e.g. Cirko, MoziPlus)
  - Theatre: `repertoireUrl?`
- [ ] Curator prompt: `scripts/cursor-curator-program-verticals-prompt.txt` (new)
- [ ] Seed ingest batch: ≥10 flagship venues per vertical (Müpa, Uránia, mainstream multiplex anchor, etc.)

### Showtimes (phase within R3 — MVP vs stretch)
- **MVP:** Link out to official műsor URL on venue profile; list timed events where ingested
- **Stretch:** `event` subtype `screening` with `startsAt`, venue hall, format (2D/3D), HU title

### Discover integration
- [ ] `DiscoverView` accepts `vertical` query param; URL shareable (`/hu/program/mozi`)
- [ ] Borough + vertical combined filters

## Technical scope

| Area | Files |
|------|-------|
| Filters | `catalogFilters.ts`, `useDiscoverFilters` hook |
| Routes | `src/app/[locale]/program/[vertical]/page.tsx` |
| Ingest | `ingestOperations.ts`, curator schemas |
| API | Optional `GET /api/public/providers?vertical=mozi` |

## Acceptance criteria

1. Each vertical returns ≥5 real providers or events on production after seed ingest
2. HU URLs and labels use correct Hungarian names (Mozi, not “Cinema” on HU UI)
3. Vertical pages are indexed in sitemap (coordination with R6)
4. `npm run audit:catalog` — no new high-severity contact/location regressions on seeded rows
5. Product sign-off on mapping table for edge cases (e.g. Müpa = Koncert + Kiállítás)

## Dependencies

- **R1** branding on vertical pages
- **R2** optional: featured items per vertical on weekly home

## Out of scope

- Scraping multiplex APIs (document as R3b follow-up)
- Print PDF generation

## Estimate

**XL** (8–12 dev days) including seed content; **M** for navigation + filters only
