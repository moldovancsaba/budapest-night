# Creating and fixing venue (provider) records

Use this checklist whenever you add a **new** venue or correct an existing one. Location rules are enforced at ingest; bad rows are rejected or must be fixed with `npm run audit:locations`.

Related: [location-system.md](./location-system.md) · `scripts/cursor-curator-location-rules.txt`

---

## 1. Collect facts from the official source only

Before writing JSON or running a curator:

| Field | Rule |
|-------|------|
| **Name** | As on the venue’s own site or Google Business (Hungarian legal name OK). |
| **Address** | Full street line from the official site: `1077 Budapest, Király utca 55, Hungary`. Include postal + city + street + number. |
| **Phone** | E.164 or local format exactly as published (`+36 1 351 0197`). |
| **Email** | Only if listed on the official site. |
| **Website** | Canonical HTTPS homepage. |
| **Hours / menu** | Link to official pages; do not invent. |

**Never** infer borough or neighborhood from marketing copy (“Infopark quarter”, “Jewish Quarter vibes”, “Millennium City”). Geography comes from the registry (below).

---

## 2. Register geography before ingest

### 2a. Postal code

1. Confirm kerület from an official HU source (e.g. [hungary.postcode.info](https://hungary.postcode.info/)).
2. Add or verify `postalToAppBorough` in `src/data/budapest-location-registry.json`.
3. `appBorough` is the **app bucket** in `src/data/locations.ts`, not always the marketing district name.

### 2b. Street or venue-specific override

If the postal maps to kerület VIII but the app lists the venue under **Ferencváros → Corvin-negyed**, add an `addressOverrides` row (regex on street) or a `landmarks[]` row — do not only fix the provider JSON.

### 2c. Landmark (preferred for flagship venues)

For any venue we will cite repeatedly, add to `landmarks[]`:

```json
{
  "id": "prov-cov-example",
  "borough": "Erzsébetváros",
  "neighborhood": "Király utca",
  "address": "1077 Budapest, Király utca 55, Hungary",
  "source": "https://www.official-site.hu/"
}
```

- `id` must match the provider `id` in MongoDB / ingest payload.
- `neighborhood` must exist under that `borough` in `src/data/locations.ts`.

### 2d. Forbidden pairings

If a street is often mis-tagged (e.g. Csörsz utca called “Infopark”), add `forbiddenPairings` / `forbiddenCopyPatterns` in the registry.

---

## 3. Provider document shape

Minimum fields for a new `provider` upsert:

```json
{
  "id": "prov-cov-short-slug",
  "name": "Venue Name",
  "category": "Restaurants",
  "borough": "Erzsébetváros",
  "neighborhood": "Király utca",
  "address": "1077 Budapest, Király utca 55, Hungary",
  "phone": "+36 1 351 0197",
  "email": "contact@venue.hu",
  "website": "https://www.venue.hu/",
  "shortDescription": "One sentence, factual, no invented geography.",
  "longDescription": "2–4 sentences + trailing Sources: https://…",
  "locales": {
    "en": {
      "slug": "venue-name-kiraly-utca",
      "shortDescription": "…",
      "longDescription": "…"
    },
    "hu": { "slug": "venue-name-hu", "…": "…" }
  }
}
```

### ID convention

- Coverage/import venues: `prov-cov-<short-kebab>`.
- Legacy / hand-curated: `prov-<name-kebab>` (avoid changing IDs once live).

### Slugs (`locales.<lang>.slug`)

- **English URL** must use an **English** slug (`frici-papa-kiraly-utca`), not Hungarian (`frici-papa-zsido-negyed` on `/en/…`).
- Lowercase, ASCII, hyphens; include street or district only when it disambiguates.
- Slugs are unique per locale; changing a slug breaks old links — use redirects only when necessary.

### Descriptions

- Root `shortDescription` / `longDescription` are the **English** catalog defaults.
- Mirror meaning in `locales.hu`, `es`, etc.; do not leave wrong street names in any locale.
- End `longDescription` with `\n\nSources: <official URL>`.

---

## 4. Local seed files (coverage pipeline)

When the venue originates from coverage scripts, also update:

| File | Purpose |
|------|---------|
| `scripts/coverage-venue-db.json` | Master gap-fill list |
| `scripts/coverage-venue-cells-rest.cjs` | Cell → provider stub |
| `scripts/data/cov-catalog-i18n*.json` | Translated copy chunks |

Then regenerate waves or patches as your pipeline requires. **Registry + provider JSON must agree** before the next ingest.

---

## 5. Verified contact patches (optional)

One-off verified fixes (phone, email, EN slug) can live in `scripts/lib/venue-contact-patches.cjs` so `npm run audit:locations` applies them consistently. Prefer moving stable facts into `landmarks[]` and coverage DB over leaving patches forever.

---

## 6. Validate and ingest

```bash
# Unit tests for registry / ingest rules
npm run audit:locations:validate
npm test -- src/lib/curator/locationIngestRules.test.ts src/lib/budapestLocation.test.ts

# Build patch from live API (dry review)
npm run audit:locations
# → scripts/ingest-payloads/venue-location-fix.json

# Dry-run ingest
npm run ingest:listing -- --dry-run scripts/ingest-payloads/venue-location-fix.json

# Apply (requires INGEST_API_KEY in env)
npm run ingest:listing -- --force scripts/ingest-payloads/venue-location-fix.json

# If POST /api/ingest returns 500 (or before a deploy with the latest registry), write directly:
npm run ingest:db -- scripts/ingest-payloads/venue-location-fix.json
```

Ingest **rejects** providers that fail `validateProviderLocationForIngest` (wrong borough vs postal, forbidden pairings, unknown neighborhood, etc.). Invalid location returns **HTTP 422** with `{ ok: false, results: [...] }`, not an empty 500.

---

## 7. Curator / LLM prompts

Any automated curator run must include:

- `scripts/cursor-curator-location-rules.txt` (full rules), or
- `getLocationIngestRulesForPrompt()` from `src/lib/curator/locationIngestRules.ts`

Prompts must say: copy official address verbatim; do not assign Infopark / Újbuda from prose; register new postals in the JSON registry first.

---

## 8. Example: Frici Papa (correct record)

| Field | Value |
|-------|--------|
| id | `prov-cov-frici-jewish-q` |
| address | `1077 Budapest, Király utca 55, Hungary` |
| borough / neighborhood | `Erzsébetváros` / `Király utca` |
| phone | `+36 1 351 0197` |
| email | `fricipapa55@gmail.com` |
| source | https://www.fricipapa.hu/ |
| en slug | `frici-papa-kiraly-utca` |

Wrong (do not use): Kertész utca 20, 1075; phone `+36 1 322 0617`; neighborhood-only “Jewish Quarter” without registry alignment.

---

## 9. After deploy

- Open the full venue URL on each locale; confirm no “Not found” flash while catalog loads (share pages wait for catalog `isLoading`).
- Spot-check map pin vs address line.
- Run `npm run audit:catalog` for copy/URL issues.
