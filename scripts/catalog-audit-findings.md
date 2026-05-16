# Budapest Night — catalog content audit

Generated: **2026-05-16T18:16:49.485Z**
Base: https://budapest-night.vercel.app
Live URL checks: **no (static only)**

## Summary

| Catalog | Total | Rows with issues |
|---------|------:|-----------------:|
| Providers | 145 | 104 |
| Timed events | 29 | 0 |
| Culture circles | 37 | 3 |

**195** findings across **107** rows.

### How to read this report

- **`website_unreachable`** — Many `prov-cov-*` bulk rows fail automated HEAD/GET (404, bot blocks). **Manually verify** on Maps before deleting; prioritize rows with wrong copy or images.
- **`image_source_off_venue_site`** — Often **OK** when the venue uses Webflow (`cdn.prod.website-files.com`) or Wikimedia fixes.
- **`missing_menu`** — Expected for most coverage-wave restaurants until menu curator batches land.
- **Location** (`postal_borough_mismatch`, `landmark_neighborhood_mismatch`, `duplicate_address_inconsistent`) — run `node scripts/fix-venue-locations.cjs` then ingest `scripts/ingest-payloads/venue-location-fix.json`.
- **Critical image/identity issues** (`banned_imgbb_hash`, `duplicate_*`, `legacy_provider_id`, `stale_domain_in_copy`) — fix first; none flagged means production is clean on those checks.

### By severity

- **critical**: 3
- **high**: 59
- **low**: 38
- **medium**: 95

### By issue code

| Count | Severity | Code | Title |
|------:|----------|------|-------|
| 92 | medium | `missing_menu` | No menu sections |
| 38 | low | `image_source_off_venue_site` | imageSource off-domain |
| 25 | high | `postal_borough_mismatch` | Postal code ≠ borough |
| 18 | high | `forbidden_district_copy` | Wrong district in description |
| 10 | high | `canonical_location_mismatch` | Wrong borough / neighborhood / address |
| 3 | critical | `landmark_neighborhood_mismatch` | Wrong area label for address |
| 3 | high | `duplicate_address_inconsistent` | Same address, different districts |
| 3 | high | `duplicate_meetup_cover` | Duplicate culture circle cover |
| 2 | medium | `email_domain_mismatch` | Email domain ≠ website |
| 1 | medium | `sources_host_mismatch` | Sources: URLs on wrong host |

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

**Fix:** Run node scripts/fix-venue-locations.cjs and ingest venue-location-fix.json.

### `neighborhood_not_in_borough` (high)

Neighborhood label is not listed under that borough in locations reference data.

**Fix:** Pick a neighborhood from src/data/locations.ts for the correct borough.

### `landmark_neighborhood_mismatch` (critical)

e.g. Csörsz utca 18 (MOM / 1124) labeled as Infopark (1117 office park, different area).

**Fix:** Use Ferencváros, Millenniumi Városközpont; fix copy that says Infopark.

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

### prov-cov-mom-eden-infopark — MOM Eden Restaurant

Issues: postal_borough_mismatch, landmark_neighborhood_mismatch, duplicate_address_inconsistent, canonical_location_mismatch, canonical_location_mismatch, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, canonical_location_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Ferencváros (1124) but borough is Újbuda
- **landmark_neighborhood_mismatch** (critical)
  - Csörsz utca 18 (MOM Cultural Centre / 1124) is not in Infopark — use Ferencváros, Millenniumi Városközpont
- **duplicate_address_inconsistent** (high)
  - Same address as prov-momkult-ujbuda, prov-cov-mom-cafe-mill, prov-cov-cafe-mom-infopark but different borough labels
- **canonical_location_mismatch** (high)
  - prov-cov-mom-eden-infopark: borough must be Ferencváros for prov-cov-mom-eden-infopark (official address — id suffix is legacy, not the district)
- **canonical_location_mismatch** (high)
  - prov-cov-mom-eden-infopark: neighborhood must be Millenniumi Városközpont for prov-cov-mom-eden-infopark
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-mom-eden-infopark: description mentions a wrong district for prov-cov-mom-eden-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **canonical_location_mismatch** (high)
  - Suggested: Ferencváros / Millenniumi Városközpont
- **missing_menu** (medium)

### prov-cov-cafe-mom-infopark — MOM Café

Issues: postal_borough_mismatch, landmark_neighborhood_mismatch, duplicate_address_inconsistent, canonical_location_mismatch, canonical_location_mismatch, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, forbidden_district_copy, canonical_location_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Ferencváros (1124) but borough is Újbuda
- **landmark_neighborhood_mismatch** (critical)
  - Csörsz utca 18 (MOM Cultural Centre / 1124) is not in Infopark — use Ferencváros, Millenniumi Városközpont
- **duplicate_address_inconsistent** (high)
  - Same address as prov-momkult-ujbuda, prov-cov-mom-cafe-mill, prov-cov-mom-eden-infopark but different borough labels
- **canonical_location_mismatch** (high)
  - prov-cov-cafe-mom-infopark: borough must be Ferencváros for prov-cov-cafe-mom-infopark (official address — id suffix is legacy, not the district)
- **canonical_location_mismatch** (high)
  - prov-cov-cafe-mom-infopark: neighborhood must be Millenniumi Városközpont for prov-cov-cafe-mom-infopark
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **forbidden_district_copy** (high)
  - prov-cov-cafe-mom-infopark: description mentions a wrong district for prov-cov-cafe-mom-infopark — use Ferencváros, 1124 Budapest, Csörsz utca 18, Hungary
- **canonical_location_mismatch** (high)
  - Suggested: Ferencváros / Millenniumi Városközpont
- **missing_menu** (medium)

### prov-momkult-ujbuda — MOM Cultural Centre

Issues: postal_borough_mismatch, landmark_neighborhood_mismatch, duplicate_address_inconsistent, canonical_location_mismatch, canonical_location_mismatch, canonical_location_mismatch

- **postal_borough_mismatch** (high)
  - Postal/address implies Ferencváros (1124) but borough is Újbuda
- **landmark_neighborhood_mismatch** (critical)
  - Csörsz utca 18 (MOM Cultural Centre / 1124) is not in Infopark — use Ferencváros, Millenniumi Városközpont
- **duplicate_address_inconsistent** (high)
  - Same address as prov-cov-mom-cafe-mill, prov-cov-cafe-mom-infopark, prov-cov-mom-eden-infopark but different borough labels
- **canonical_location_mismatch** (high)
  - prov-momkult-ujbuda: borough must be Ferencváros for prov-momkult-ujbuda (official address — id suffix is legacy, not the district)
- **canonical_location_mismatch** (high)
  - prov-momkult-ujbuda: neighborhood must be Millenniumi Városközpont for prov-momkult-ujbuda
- **canonical_location_mismatch** (high)
  - Suggested: Ferencváros / Millenniumi Városközpont

### prov-cov-ebner-gellert — Ébner Confectionery

Issues: postal_borough_mismatch, image_source_off_venue_site, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1114) but borough is Buda
- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gellert-bar-party — Gellért Lobby Bar

Issues: postal_borough_mismatch, image_source_off_venue_site, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1114) but borough is Buda
- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gellert-brasserie — Gellért Brasserie

Issues: postal_borough_mismatch, image_source_off_venue_site, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1114) but borough is Buda
- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-kacsa-becsi — Kacsa Étterem

Issues: postal_borough_mismatch, image_source_off_venue_site, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Buda (1036) but borough is Óbuda
- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-corvin-club-ferencvaros — Corvin Club

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1085) but borough is Ferencváros
- **missing_menu** (medium)

### prov-cov-kuplung-kiraly — Kuplung

Issues: postal_borough_mismatch, image_source_off_venue_site

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1075) but borough is Terézváros
- **image_source_off_venue_site** (low)

### prov-cov-gellert-spa-events — Gellért Spa Cultural Hall

Issues: postal_borough_mismatch, image_source_off_venue_site

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1114) but borough is Buda
- **image_source_off_venue_site** (low)

### prov-cov-cafe-corvin — Café Frei Corvin

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1082) but borough is Ferencváros
- **missing_menu** (medium)

### prov-cov-lucky-luciano — Lucky Luciano Coffee

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1111) but borough is Ferencváros
- **missing_menu** (medium)

### prov-cov-gellert-cafe — Gellért Café

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1114) but borough is Buda
- **missing_menu** (medium)

### prov-cov-varfok-taban — Varfok Kávézó

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gloriett-cafe-rozsadomb — Gloriett Café

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-chez-snacky-obuda — Chez Snacky

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-liliom-moricz — Liliom Café

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-gelibi-gellert — Gelibi Café

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-hard-rock-vaci — Hard Rock Cafe Budapest

Issues: email_domain_mismatch, missing_menu

- **email_domain_mismatch** (medium)
- **missing_menu** (medium)

### prov-cov-legenda-parliament — Legenda Boat Party

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-spoon-party-prom — Spoon Cafe & Lounge

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-instant-kiraly — Instant-Fogas

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1075) but borough is Terézváros
- **missing_menu** (medium)

### prov-cov-becketts-liszt — Beckett's Irish Pub

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-bluebird-gozsdu — Blue Bird Bar

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-a38-muegyetem — A38 Ship

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1111) but borough is Ferencváros
- **missing_menu** (medium)

### prov-cov-spiler-balna — Spíler Bálna

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-nehru-party — Nehru Part Beach Bar

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-robertson-castle — Robertson Bar

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Belváros (1011) but borough is Buda
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

### prov-cov-mazel-tov-kiraly — Mazel Tov

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1075) but borough is Terézváros
- **missing_menu** (medium)

### prov-cov-bocksay-wessel — Bocksay Bistro

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-stand25-rakoczi — Stand25 Bisztró

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-betes-corvin — Bétés Restaurant

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1082) but borough is Ferencváros
- **missing_menu** (medium)

### prov-cov-bamba-marha — Bamba Marha

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Újbuda (1111) but borough is Ferencváros
- **missing_menu** (medium)

### prov-cov-pestbuda-castle — Pest-Buda Bistro

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Belváros (1011) but borough is Buda
- **missing_menu** (medium)

### prov-cov-citadella-rest — Citadella Restaurant

Issues: image_source_off_venue_site, missing_menu

- **image_source_off_venue_site** (low)
- **missing_menu** (medium)

### prov-cov-21-rozsadomb — 21 Hungarian Kitchen

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Belváros (1012) but borough is Buda
- **missing_menu** (medium)

### prov-cov-3d-aquincum — 3D Café & Bistro

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

### prov-cov-pierrot-parliament — Pierrot Café

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Buda (1014) but borough is Belváros
- **missing_menu** (medium)

### prov-cov-espresso-embassy-kiraly — Espresso Embassy

Issues: postal_borough_mismatch, missing_menu

- **postal_borough_mismatch** (high)
  - Postal/address implies Belváros (1051) but borough is Terézváros
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

### prov-cov-rudas-buda-party — Rudas Party Nights

Issues: canonical_location_mismatch, missing_menu

- **canonical_location_mismatch** (high)
  - Suggested: Buda / Tabán
- **missing_menu** (medium)

### prov-new-york-cafe-belvaros — New York Café

Issues: postal_borough_mismatch

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1073) but borough is Belváros

### prov-okk-obuda — Óbuda Cultural Centre

Issues: sources_host_mismatch

- **sources_host_mismatch** (medium)

### prov-otkert-belvaros — Ötkert

Issues: missing_menu

- **missing_menu** (medium)

### prov-doboz-erzsebetvaros — Doboz

Issues: email_domain_mismatch

- **email_domain_mismatch** (medium)

### prov-cov-pesti-vigado-vaci — Pesti Vigadó

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-ellato-kazinczy — Ellátó Kert

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-corvin-cinema — Corvin Cinema

Issues: postal_borough_mismatch

- **postal_borough_mismatch** (high)
  - Postal/address implies Erzsébetváros (1082) but borough is Ferencváros

### prov-cov-ferenc-nagy — Ferenc Római Catholic Parish Cultural Events

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-obuda-becsi-events — Óbudai-sziget Cultural Hall

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-gellert-events-ujbuda — Gellért Bath Palace Events

Issues: image_source_off_venue_site

- **image_source_off_venue_site** (low)

### prov-cov-csendes-nagy — Csendes

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-mom-cafe-mill — MOM Eden Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-ruszwurm-castle — Ruszwurm Confectionery

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-roman-cafe-aquincum — Aquincum Museum Café

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-manno-kolosy — Manno Caffè

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-2b-becsi — 2B Coffee

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-hadik-kosztolanyi — Hadik Kávéház

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

### prov-cov-legio-nagy — Légió Hungarian Pub

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

### prov-cov-bock-deak — Bock Bistro

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-spoon-rest-prom — Spoon Restaurant

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-aszu-andrassy — Aszu Étterem

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-alabard-opera — Arany Kaviár

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-ket-szerecsen-oktogon — Két Szerecsen

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-vegazzi-kazinczy — Vegazzi

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-borsso-nagy — Borssó Bistro

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-iz-millennium — Íz Étterem

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-remiz-taban — Remiz Restaurant

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-buena-vista-obuda — Buena Vista Bistro

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-sushi-kolosy — Sushi Sei

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-csillagker-bikas — Csillagkért Étterem

Issues: missing_menu

- **missing_menu** (medium)

### prov-cov-madal-deak — MADÁL - specialty coffee

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

## Timed events (flagged)

_No rows flagged._

## Culture circles (flagged)

### grp-cov-meet-vaci — Váci utca After-Work Circle

Issues: duplicate_meetup_cover

- **duplicate_meetup_cover** (high)
  - Shared with: grp-cov-meet-parliament, grp-cov-meet-promenade

### grp-cov-meet-parliament — Parliament Riverside Walk

Issues: duplicate_meetup_cover

- **duplicate_meetup_cover** (high)
  - Shared with: grp-cov-meet-vaci, grp-cov-meet-promenade

### grp-cov-meet-promenade — Promenade Boat & Jazz Circle

Issues: duplicate_meetup_cover

- **duplicate_meetup_cover** (high)
  - Shared with: grp-cov-meet-vaci, grp-cov-meet-parliament

## Repair commands

```bash
# Re-run audit
npm run audit:catalog

# Single venue (image + contact)
node scripts/fix-provider-one.cjs <prov-id>

# Batch images
npm run db:patch-venue-meetup-images
npm run db:patch-event-images

# Kiosk-style full patch
node scripts/patch-kiosk-budapest.cjs
```
