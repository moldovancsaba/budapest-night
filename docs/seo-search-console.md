# Search Console & structured data (R6)

Canonical site: **https://budapest-night.vercel.app** (until `pestiest.hu` cutover).

## Search Console setup

1. Add property `https://budapest-night.vercel.app` in [Google Search Console](https://search.google.com/search-console).
2. Verify via DNS TXT or HTML file (Vercel supports both).
3. Submit sitemap: `https://budapest-night.vercel.app/sitemap.xml`
4. After deploy, use **URL inspection** on:
   - `/` (home)
   - `/program` or `/ez-a-het` (HU program week)
   - `/en/program`
   - One venue page (`/venue/{slug}`)
   - One event page (`/event/{slug}`)

## Rich Results checklist

| Page type | JSON-LD `@type` | Where |
|-----------|-----------------|--------|
| Event detail | `Event` (+ `Offer` when priced) | `EventProfile` / `eventJsonLd` |
| Venue detail | `MovieTheater`, `PerformingArtsTheater`, `ArtGallery`, `MusicVenue`, or `LocalBusiness` | `ProviderProfile` via `venueSchemaOrgType()` |
| Program week | `CollectionPage` + `ItemList` | `ProgramWeekJsonLd` |

Validate with [Rich Results Test](https://search.google.com/test/rich-results) using production URLs.

## Venue subtype mapping

Inferred from `activityTypes` on the provider document:

- `Cinema` → `MovieTheater`
- `Theatre` → `PerformingArtsTheater`
- `Gallery` / `Exhibition` → `ArtGallery`
- `Live Music` / concert tags → `MusicVenue`
- default → `LocalBusiness`

## robots.txt

`https://budapest-night.vercel.app/robots.txt` — allows crawlers; references sitemap.

## Automated smoke (CI / local)

```bash
npm run ops:seo-smoke
npm run audit:program-locales
```

`ops:seo-smoke` checks robots, sitemap, `/ez-a-het`, program-week API, and featured events on production (default base: `https://budapest-night.vercel.app`).

## Post-cutover

When `pestiest.hu` is live, add a Search Console property for the apex domain, set 301s from the Vercel URL, and resubmit the sitemap on the new host.
