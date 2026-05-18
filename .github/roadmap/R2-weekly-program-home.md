## Summary

Introduce a **“Ez a hét” / This week** program hub as the primary answer to Pesti Est’s historic job: *what should I do in Budapest this week?*

## Business outcome

- Replaces the Thursday print drop with a digital weekly habit
- Differentiates PestiEst from static venue directories (Fidelio, Programguru)
- Increases return visits and session depth

## User stories

- As a **local**, I open the app and immediately see highlights for the current calendar week (Thu–Wed or Mon–Sun — document choice)
- As a **visitor**, I see the same week scoped to my language
- As an **editor**, I can pin 3–8 featured events and 3–8 featured venues for the active week without redeploying code

## Functional requirements

### Data model
- [ ] `site` collection (or new `programWeeks` collection) document shape:
  - `weekId` (ISO week or `YYYY-MM-DD` start)
  - `headline` + optional `intro` (HU required; other locales optional)
  - `featuredEventIds[]`, `featuredProviderIds[]`
  - `publishedAt`, `editorNotes`
- [ ] Public API: `GET /api/public/program-week?locale=hu&week=current`

### UI
- [ ] New route: `/[locale]/program` or `/[locale]/ez-a-het` (HU slug) as linked from home hero
- [ ] Sections: **Editor intro** → **Kiemelt események** (timed events cards) → **Kiemelt helyszínek** → **Borough shortcuts** → link to full Discover filters
- [ ] Empty state when no features configured: fallback to algorithmic “this week” (events with `startsAt` in week, sorted by date)
- [ ] Mobile-first layout consistent with existing Scout UI

### Admin
- [ ] Admin screen: select week, edit intro, pick events/providers from searchable catalog
- [ ] Preview link for draft week before publish

### Rhythm
- [ ] Document **week boundary** (recommend: Thursday 00:00 Europe/Budapest to match legacy publish day)
- [ ] Optional banner on home: “Friss hét: csütörtökön frissül” until R7 automates

## Technical scope

| Area | Notes |
|------|-------|
| API | New route under `src/app/api/public/` |
| Mongo | `site` extension or `programWeeks` in `COL` |
| UI | `src/components/scout/views/` new `ProgramWeekView.tsx` |
| Home | `HomeView.tsx` CTA to weekly hub |

## Acceptance criteria

1. Published week shows at least 1 featured event with correct localized title, date, and ticket link
2. Fallback algorithm shows ≥3 upcoming timed events when editor features are empty
3. Week rolls forward automatically at configured boundary without manual id change
4. Admin can publish next week while current week remains live
5. Lighthouse: LCP on program page ≤3s on 4G throttling (same budget as home)

## Dependencies

- **R1** for Pesti Est naming on the new page
- Timed events ingested with valid `startsAt` (existing pipeline)

## Out of scope

- Email send (R7)
- Paid placement in week hero (R5 — but leave hooks: `sponsorLabel?` field)

## Estimate

**L** (5–8 dev days)
