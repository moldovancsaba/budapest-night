# Budapest Night — catalog content audit

Generated: **2026-05-18T20:54:32.031Z**
Base: https://budapest-night.vercel.app
Live URL checks: **no (static only)**

## Summary

| Catalog | Total | Rows with issues |
|---------|------:|-----------------:|
| Providers | 145 | 86 |
| Timed events | 28 | 0 |
| Culture circles | 37 | 0 |

**114** findings across **86** rows.

### How to read this report

- **`website_unreachable`** — Many `prov-cov-*` bulk rows fail automated HEAD/GET (404, bot blocks). **Manually verify** on Maps before deleting; prioritize rows with wrong copy or images.
- **`image_source_off_venue_site`** — Often **OK** when the venue uses Webflow (`cdn.prod.website-files.com`) or Wikimedia fixes.
- **`missing_menu`** — Restaurants / Cafés / Parties without `menu.sections`. Run `node scripts/menu-batch-status.cjs`; curate in batches via `docs/catalog-curation.md` + `npm run ingest:db`.
- **Location** (`postal_borough_mismatch`, `landmark_neighborhood_mismatch`, `duplicate_address_inconsistent`) — run `node scripts/fix-venue-locations.cjs` then ingest `scripts/ingest-payloads/venue-location-fix.json`.
- **Critical image/identity issues** (`banned_imgbb_hash`, `duplicate_*`, `legacy_provider_id`, `stale_domain_in_copy`) — fix first; none flagged means production is clean on those checks.

### By severity

- **low**: 39
- **medium**: 75

### By issue code

| Count | Severity | Code | Title |
|------:|----------|------|-------|
| 75 | medium | `missing_menu` | No menu sections |
| 39 | low | `image_source_off_venue_site` | imageSource off-domain |

## Finding reference (from production incidents)

### `website_unreachable` (high)

Homepage returns 4xx/5xx, DNS failure, or timeout (HEAD/GET).

**Fix:** Find current domain on Maps/Instagram; patch website, email, Sources:, and menu URLs.

### `website_empty` (high)

Provider has no website URL.

**Fix:** Add official https URL from venue contact page.

### `email_domain_mismatch` (medium)

Contact email hostname does not match website hostname.

**Fix:** Use info@ on the same domain as website (e.g. info@kiosk-budapest.hu).

### `sources_host_mismatch` (medium)

longDescription Sources: lists a hostname different from website (excluding ticket subdomains).

**Fix:** Align all Sources: URLs with the live website domain.

### `sources_missing` (low)

longDescription has no Sources: https://... audit line.

**Fix:** Append Sources: with official URLs used for the listing.

### `stale_domain_in_copy` (high)

Known retired domain still in website or description (e.g. kioskbudapest.com).

**Fix:** Replace with current official domain everywhere.

### `legacy_provider_id` (critical)

Row still uses a migrated-away prov-* id.

**Fix:** Rename via migrate-legacy-venue-provider-ids.cjs or patch to canonical id.

### `canonical_location_mismatch` (high)

Does not match CANONICAL_BY_ID or street-based inference (e.g. Budapest Park in Óbuda).

**Fix:** Patch borough, neighborhood, address from official source; run location fix scripts.

### `postal_borough_mismatch` (high)

Budapest postal code or street landmark implies a different app borough than the row.

**Fix:** Fix per scripts/cursor-curator-location-rules.txt; register postal in budapest-location-registry.json; run npm run audit:locations.

### `postal_not_registered` (critical)

Address postal is missing from src/data/budapest-location-registry.json.

**Fix:** Add postalToAppBorough row with kerulet + appBorough before ingest.

### `neighborhood_not_in_borough` (high)

Neighborhood label is not listed under that borough in locations reference data.

**Fix:** Pick a neighborhood from src/data/locations.ts for the correct borough.

### `landmark_neighborhood_mismatch` (critical)

e.g. Csörsz utca 18 (MOM / 1124 XII. ker.) labeled as Infopark (1117 office park, different area).

**Fix:** Use Buda, MOM Park; fix copy that says Infopark.

### `duplicate_address_inconsistent` (high)

Multiple providers share one street address but use conflicting borough/neighborhood.

**Fix:** Align all rows at that address to one canonical borough/neighborhood.

### `forbidden_district_copy` (high)

Copy mentions Óbuda Island / Újbuda for a Ferencváros or Terézváros venue.

**Fix:** Rewrite descriptions; sync events hosted at that venue.

### `canonical_website_mismatch` (medium)

MVM Dome or Budapest Park website is not the canonical .hu domain.

**Fix:** Set venue website to mvm-dome.hu / budapestpark.hu; put promoters on events only.

### `image_empty` (high)

Empty image / coverImageUrl.

**Fix:** Upload venue-appropriate photo via ingest/upload; unique ImgBB URL.

### `image_not_imgbb` (high)

URL is not https i.ibb.co / *.ibb.co.

**Fix:** Download official asset, upload, store returned ImgBB URL.

### `banned_imgbb_hash` (critical)

Reuses a known-bad filename from bulk mistakes (concert art, park generic, etc.).

**Fix:** Replace with venue-specific upload; never reuse cde3b78d5c56, cb56a463140e, …

### `duplicate_provider_image` (high)

Same ImgBB URL on multiple providers.

**Fix:** One unique upload per provider row.

### `duplicate_meetup_cover` (high)

Same coverImageUrl on multiple meetup groups.

**Fix:** Distinct district/theme photo per grp-*.

### `duplicate_event_image` (high)

Same image on multiple timed events.

**Fix:** Per-show poster from ticket page; unique ImgBB per event.

### `image_shared_across_catalog` (critical)

Concert poster on venue row, or one URL reused across listing types.

**Fix:** Venue = interior/exterior; event = show art; meetup = district scene — all unique URLs.

### `event_image_same_as_venue` (high)

Timed event image URL equals host provider image.

**Fix:** Scrape per-show art from ticket URL for event.image only.

### `meetup_cover_same_as_event` (high)

Culture circle cover matches a timed event image.

**Fix:** Upload dedicated coverImageUrl per meetup group.

### `meetup_cover_same_as_venue` (medium)

Culture circle cover matches a provider listing image.

**Fix:** Use district/community scene, not a restaurant card photo.

### `image_source_off_venue_site` (low)

imageSource host differs from website (may be OK for Webflow/Wikimedia).

**Fix:** Prefer hero from venue site; Webflow CDN and Commons are acceptable.

### `unrelated_image_source` (high)

imageSource hostname is not website, Webflow CDN, Wikimedia, or ImgBB.

**Fix:** Re-scrape from official venue site; avoid random blogs/stock.

### `possible_wrong_cuisine_copy` (medium)

Mediterranean label on clearly Hungarian venue copy.

**Fix:** Match cuisine to official positioning (e.g. modern Hungarian bistro).

### `missing_menu` (medium)

Restaurant/Café/Party venue without menu.sections for Eat & Drink.

**Fix:** Patch menu from official /eteleink, /italaink, or menu board images.

### `menu_tags_without_body` (low)

Computed menuTags present but no menu sections (orphan tags).

**Fix:** Add full menu patch or clear stale tags via re-ingest.

### `event_legacy_venue_id` (critical)

venueIds references prov-* alias that was migrated.

**Fix:** Update venueIds to canonical id in same payload as provider rename.

### `event_host_location_mismatch` (high)

Event borough/neighborhood does not match canonical host location.

**Fix:** Set event borough/neighborhood from primary host; fix host provider first.

### `event_host_catalog_location_wrong` (high)

Live host provider fails canonical location rules.

**Fix:** Patch host provider before ingesting or patching events.

### `suspicious_free_tickets` (medium)

Event has booking URL or paid-sounding title but entryFees use FREE with amount 0.

**Fix:** Use HUF/EUR tiers from ticket page or empty entryFees + missingOrUncertain.

## Providers (flagged)

### prov-cov-gloriett-cafe-rozsadomb — Gloriett Café

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-ebner-gellert — Ébner Confectionery

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-chez-snacky-obuda — Chez Snacky

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gelibi-gellert — Gelibi Café

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-legenda-parliament — Legenda Boat Party

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-spoon-party-prom — Spoon Cafe & Lounge

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-becketts-liszt — Beckett's Irish Pub

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-bluebird-gozsdu — Blue Bird Bar

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-spiler-balna — Spíler Bálna

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-nehru-party — Nehru Part Beach Bar

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gellert-bar-party — Gellért Lobby Bar

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-galiba-kolosy — Galiba Garden

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-morzsak-moricz — Morzsák Bar

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-binx-infopark — BinX Rooftop

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-golya-kosztolanyi — Golyó Kávé

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-korona-bikas — Korona Club

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-citadella-rest — Citadella Restaurant

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gellert-brasserie — Gellért Brasserie

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-buena-vista-obuda — Buena Vista Bistro

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-3d-aquincum — 3D Café & Bistro

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-kacsa-becsi — Kacsa Étterem

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-vasut-obuda — Vasúrszálló Restaurant

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-berenyi-moricz — Berényi Étterem

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-mika-gellert — Mika Kert

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-kekbello-kosztolanyi — Kékbello Bistro

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-contessa-jewish-q — Szpünik Café

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-melbourne-kazinczy — My Little Melbourne

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-fekete-wessel — Fekete

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-pesti-vigado-vaci — Pesti Vigadó

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-kuplung-kiraly — Kuplung

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-ellato-kazinczy — Ellátó Kert

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-ferenc-nagy — Ferenc Római Catholic Parish Cultural Events

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-gellert-spa-events — Gellért Spa Cultural Hall

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-obuda-becsi-events — Óbudai-sziget Cultural Hall

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-gellert-events-ujbuda — Gellért Bath Palace Events

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-cafe-corvin — Café Frei Corvin

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-lucky-luciano — Lucky Luciano Coffee

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-mom-cafe-mill — MOM Eden Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-gellert-cafe — Gellért Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-varfok-taban — Varfok Kávézó

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-roman-cafe-aquincum — Aquincum Museum Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-liliom-moricz — Liliom Café

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-cafe-mom-infopark — MOM Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-obester-bikas — Obester Specialty Coffee

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-larm-deak — LÄRM

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-360bar-andrassy — 360 Bar

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-highnote-opera — High Note SkyBar

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-morrison-lit-wessel — Morrison's Lit

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-here-rakoczi — HERE Budapest

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-a38-muegyetem — A38 Ship

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-robertson-castle — Robertson Bar

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-rudas-party — Rudas Rooftop Bar

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-taban-terrace — Tabán Terrace

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-nappali-rozsadomb — Nappali Buda

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-kiscelli-aquincum — Kiscelli Pub District

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-johnnys-becsi — Johnny's American Bar

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-zsindelyes-obuda — Zsindelyes Music Pub

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-gerbeaud-vaci — Gerbeaud

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-spoon-rest-prom — Spoon Restaurant

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-alabard-opera — Arany Kaviár

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-mazel-tov-kiraly — Mazel Tov

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-vegazzi-kazinczy — Vegazzi

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-bocksay-wessel — Bocksay Bistro

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-stand25-rakoczi — Stand25 Bisztró

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-betes-corvin — Bétés Restaurant

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-bamba-marha — Bamba Marha

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-borsso-nagy — Borssó Bistro

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-iz-millennium — Íz Étterem

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-pestbuda-castle — Pest-Buda Bistro

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-remiz-taban — Remiz Restaurant

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-21-rozsadomb — 21 Hungarian Kitchen

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-sushi-kolosy — Sushi Sei

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-mom-eden-infopark — MOM Eden Restaurant

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-csillagker-bikas — Csillagkért Étterem

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-madal-deak — MADÁL - specialty coffee

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-pierrot-parliament — Pierrot Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-szamos-prom — Szamos Café Vigadó

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-callas-andrassy — Callas Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-opera-cafe — Opera Café Budapest

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-espresso-embassy-kiraly — Espresso Embassy

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-froccterasz-liszt — Fröccsterasz

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-spiler-gozsdu — Spíler Shanghai

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-embassy-rakoczi — Espresso Embassy Rákóczi

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-island-cafe-ferencvaros — Budapest Park Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-park-party-ferencvaros — Budapest Park Club Nights

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-rudas-buda-party — Rudas Party Nights

Issues: missing_menu

- **missing_menu** (medium)

## Timed events (flagged)

_No rows flagged._

## Culture circles (flagged)

_No rows flagged._

## Repair commands

```bash
# Re-run audit (fast)
npm run audit:catalog -- --skip-urls

# Menu coverage
node scripts/menu-batch-status.cjs
node scripts/generate-menu-batch-5.cjs   # example generator
npm run ingest:db -- scripts/ingest-payloads/cursor-curated-menu-batch-<date>.json
npm run db:backfill-menu-venue-links

# Single venue (image + contact)
node scripts/fix-provider-one.cjs <prov-id>

# Batch images (then ingest:db on patch JSON)
node scripts/patch-venue-meetup-images.cjs
npm run ingest:db -- scripts/ingest-payloads/patch-unique-venue-meetup-images.json
npm run db:patch-venue-meetup-images
npm run db:patch-event-images

# Locations
npm run audit:locations
npm run ingest:db -- scripts/ingest-payloads/venue-location-fix.json
```

See **docs/catalog-curation.md** for batch history and tour-tag priorities.
