## Summary

Rebuild **search visibility** for program-intent queries via canonical URLs, sitemaps, and **Schema.org** for events and venues.

## Business outcome

- Captures traffic legacy **pestiest.hu** / **est.hu** once ranked for
- Competes with Fidelio, Programguru on long-tail HU queries
- Improves click-through from Google Events / rich results where eligible

## User stories

- As **SEO**, I submit sitemap to Google Search Console for pestiest.hu
- As **Google**, I parse Event structured data with correct dates, venue, and offers (HUF)
- As **user**, shared program URLs have stable canonicals per locale

## Functional requirements

### URLs & sitemaps
- [ ] Dynamic `sitemap.xml` index: providers, events, program week, vertical pages (R3)
- [ ] `robots.txt` allows crawl; block `/admin`, `/api/ingest`
- [ ] Canonical tags on all public pages; no duplicate `/en` vs un-prefixed

### Structured data
- [ ] Timed events: `Event` JSON-LD with `startDate`, `endDate`, `location` (Place), `offers` from `entryFees`
- [ ] Venues: `LocalBusiness` or `PerformingArtsTheater` / `MovieTheater` by vertical
- [ ] Program week page: `CollectionPage` + `ItemList`
- [ ] Validate with Google Rich Results Test on 3 sample URLs

### Performance SEO
- [ ] Core Web Vitals regression check on venue and event pages
- [ ] Image `alt` from localized venue names

### Content pages (minimal)
- [ ] Static HU landing copy block on `/hu/program` targeting “budapesti programok” (editorial, 200–400 words, non-keyword-stuffing)

## Technical scope

| Area | Files |
|------|-------|
| Sitemap | `src/app/sitemap.ts` or route handlers |
| JSON-LD | `src/components/seo/JsonLd.tsx`, per-page injection |
| Meta | `generateMetadata` in App Router pages |

## Acceptance criteria

1. Search Console shows sitemap processed without errors
2. Rich Results Test passes for 1 concert, 1 venue, 1 week page
3. `curl -I` canonical on `/hu/venue/{slug}` matches production domain
4. hreflang pairs validated for hu ↔ en on same provider
5. No structured data for past events &gt;30 days in sitemap (configurable)

## Dependencies

- **R1** production domain
- **R2** program week URLs
- **R3** vertical URLs (can ship sitemap incrementally)

## Out of scope

- Paid search campaigns
- Blog / editorial CMS

## Estimate

**M** (4–5 dev days)
