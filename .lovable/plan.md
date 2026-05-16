## Add a map to the provider profile

Show an embedded map inside the provider detail sheet so families can see where a class is located, plus a "Get directions" link that opens Google/Apple Maps.

### Approach

Use a free, no-API-key embed: an OpenStreetMap iframe centered on the provider's address (geocoded on the fly via Nominatim, with a static fallback to the borough). This avoids any Google Maps billing setup. If you'd prefer Google Maps Embed (nicer styling, requires a free API key), say the word and I'll swap it in.

### Where it lives

In `src/components/scout/panels/ProviderProfile.tsx`, add a new "Location" section directly under the address/rating block (before the action buttons), containing:
- A rounded ~200px tall map iframe centered on `provider.address`
- The address line
- A "Get directions" button that opens `https://www.google.com/maps/dir/?api=1&destination=<address>` in a new tab

### Technical details

- New component `src/components/scout/panels/ProviderMap.tsx`:
  - On mount, geocode the address via `https://nominatim.openstreetmap.org/search?format=json&q=...&limit=1`
  - Render `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=...&marker=lat,lon" />`
  - Loading skeleton while geocoding; on failure, fall back to a borough-centered map
- Reuses existing semantic tokens (`bg-secondary`, rounded corners) to match the profile's visual language
- No new dependencies, no API keys, no backend changes
- No schema changes needed — `provider.address` already exists

### Future option

If you later want richer maps (custom pins for nearby providers, Class Scout branding), we can switch to Google Maps Embed/JS API or Mapbox; both need an API key stored as a secret.