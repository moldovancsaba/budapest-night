# QR & UTM attribution (R4)

## URL shape

- **HU short link:** `https://{domain}/v/{venue-slug}?utm_source=pestiest&utm_medium=qr&utm_content={providerId}`
- **Other locales:** `/venue/{slug}` with the same UTM params.

## Client persistence

On first load, `persistAttributionFromSearch()` (see `src/lib/attribution.ts`) stores QR visits in `sessionStorage` under `pestiest_attribution` when `utm_medium=qr` or `src=qr`.

## Analytics

- **Vercel Analytics:** filter events by URL query `utm_medium=qr` or landing path `/v/`.
- **Plausible / GA4:** add custom dimensions for `utm_source`, `utm_medium`, `utm_content` from the landing URL.

Regenerate partner PDFs after `NEXT_PUBLIC_SITE_URL` changes (`/api/admin/qr-pack`).
