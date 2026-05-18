## Summary

Keep and refine the **6-locale** experience as a **visitor layer** without diluting HU-first Pesti Est positioning.

## Business outcome

- Tourism reach (EN, IT, ES, HE, AR) without rebranding as a foreign “Budapest Night” product
- Supports international venues and diaspora audiences
- Aligns with post-print growth strategy (foreign visitors + locals)

## User stories

- As an **Italian tourist**, I browse `/it/program` with translated UI and event titles where `locales.it` exists
- As **product**, HU is default locale on pestiest.hu; other locales are discoverable but secondary in marketing
- As **curator**, ingest rules still require HU + 5 locales for providers/events (existing)

## Functional requirements

### Positioning
- [ ] HU site: primary navigation and SEO; EN/etc. use “Pesti Est — Budapest program guide” subtitle, not a different brand
- [ ] Language switcher: persist choice; default `hu` on `pestiest.hu` root redirect

### Content parity
- [ ] Audit: ≥90% of featured week items (R2) have non-HU `locales` for `name`/`title`
- [ ] Fallback: show EN root copy with “Hungarian venue name” pattern where translation missing (document UX)

### Program copy
- [ ] Translate new strings for R2/R3 verticals in all message files
- [ ] RTL layouts verified for `he` and `ar` on new pages

### Tourism-specific (light)
- [ ] Optional filter: “English-friendly” or “Tourist-friendly” tag on providers (ingest optional field)

## Technical scope

- Existing `next-intl` setup — extend keys only
- No new locale codes in v1

## Acceptance criteria

1. `/it/program` and `/hu/program` both functional after R2 ships
2. hreflang and canonical correct (with R6)
3. No locale shows “Budapest Night” as brand post-R1
4. Sample QA checklist completed for 6 locales on home + program week + one venue

## Dependencies

- **R1** (brand strings per locale)
- **R2**, **R3** (pages to translate)

## Out of scope

- Machine translation automation without human review
- New locales beyond existing six

## Estimate

**S–M** (2–4 dev days, mostly parallel to R2/R3)
