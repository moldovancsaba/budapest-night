## Summary

Implement **digital ad inventory** analogous to legacy Pesti Est print sales: featured venues, promoted events, and sponsored week blocks — configurable in admin, visible on catalog.

## Business outcome

- Restores ad-funded model without printing 130k copies
- Gives commercial team SKUs with clear placement and duration
- Funds curation and ingest operations

## User stories

- As **sales**, I sell a 2-week “Featured venue” slot for District VII and configure it in admin
- As a **user**, I see a “Kiemelt” label on sponsored listings; editorial and paid are visually distinct per ad policy
- As **finance**, I export active campaigns CSV (venue, dates, tier, price reference)

## Functional requirements

### Campaign model
- [ ] Mongo `promotions` collection (or embedded on provider/event):
  - `id`, `type`: `featured_venue` | `featured_event` | `week_sponsor` | `vertical_sponsor`
  - `targetId` (provider or event id)
  - `startsAt`, `endsAt` (timezone Europe/Budapest)
  - `locales[]` optional geo/locale restrict
  - `label`: `Kiemelt partner` / custom
  - `priority` (sort order)
  - `internalNotes`, `contractRef` (not public)

### Surfacing rules
- [ ] Home: max N featured providers (e.g. 6), max N featured events (e.g. 8)
- [ ] Discover: inject featured at top when filter matches campaign
- [ ] Program week (R2): `sponsorName`, `sponsorUrl` on week doc — single week sponsor
- [ ] Badges: reuse `badges: ["Featured"]` only when active campaign exists (sync job)

### Admin UI
- [ ] CRUD promotions with date picker, catalog search, preview
- [ ] Conflict warning: overlapping campaigns on same placement
- [ ] Role: admin-only (existing auth)

### Policy & UX
- [ ] HU microcopy: “Hirdetés” or “Kiemelt partner” per client legal
- [ ] Do not affect sort order of non-paid listings except dedicated slots (no hidden bias in search)

## Technical scope

| Area | Notes |
|------|-------|
| API | `GET /api/public/providers` merges active promotions server-side |
| Admin | `AdminDashboard` new Promotions tab |
| Jobs | Cron or on-write hook to clear expired badges |

## Acceptance criteria

1. Create campaign → appears on home within 60s (cache bust documented)
2. Expired campaign removes badge automatically
3. No sponsored item without valid `targetId` in catalog
4. Export CSV of active + last 90 days campaigns
5. Client sign-off on ad disclosure strings (HU)

## Dependencies

- **R2** for week sponsor placement
- **R1** for sales collateral brand

## Out of scope

- Payment processing / invoicing
- Self-serve advertiser portal

## Estimate

**L** (6–8 dev days)
