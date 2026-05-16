# Budapest Night — location system

Commercial rule: **every provider row’s `borough`, `neighborhood`, and `address` must match the registry or ingest is rejected.**

## Files

| Path | Role |
|------|------|
| `src/data/budapest-location-registry.json` | Postals, landmarks, street overrides, forbidden pairings |
| `src/data/locations.ts` | App borough enum + neighborhood allow-list |
| `src/lib/curator/locationIngestRules.ts` | Prompt text + TS validation (API) |
| `scripts/lib/budapest-postal-registry.cjs` | Registry loader (Node scripts) |
| `scripts/lib/location-ingest-validate.cjs` | Blocking ingest validation |
| `scripts/lib/budapest-location.cjs` | Fix suggestions + catalog audit helpers |
| `scripts/cursor-curator-location-rules.txt` | Curator prompt (copy into chats) |

## Resolution order

1. Landmark by `id`
2. Landmark by normalized address
3. `addressOverrides` (regex on street)
4. `postalToAppBorough[postal]`

No step uses marketing copy or `prov-*` suffixes.

## Adding a new postal code

1. Confirm kerület from [hungary.postcode.info](https://hungary.postcode.info/) or official HU source.
2. Add to `postalToAppBorough` in `budapest-location-registry.json`:

```json
"1234": {
  "appBorough": "Buda",
  "kerulet": "XII",
  "keruletName": "Hegyvidék"
}
```

3. If the street needs a fixed neighborhood, add `addressOverrides` or `landmarks`.
4. If the neighborhood is new, add it to `src/data/locations.ts` under the borough.
5. Run `npm run ingest:listing -- --dry-run <payload>`.

## Adding a verified venue

Add a `landmarks[]` row with `id`, `borough`, `neighborhood`, `address`, `source` (official URL).

## Operations

```bash
npm run audit:locations          # build venue-location-fix.json from live API
npm run audit:catalog -- --skip-urls
npm run ingest:listing -- --dry-run scripts/ingest-payloads/<file>.json
```

## Curator prompts

All venue/event curator prompts must include location rules:

- `scripts/cursor-curator-location-rules.txt` (full checklist)
- `getLocationIngestRulesForPrompt()` in `src/lib/curator/locationIngestRules.ts` (embedded in LLM system prompts)
