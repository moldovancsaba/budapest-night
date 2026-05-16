# Budapest Night

**v0.2.0** — Discover Budapest events, venues, parties, restaurants, cafés, and culture by district and neighborhood. Neon cyberpunk UI, six locales, and HUF-first pricing with optional EUR/USD display.

**Live:** [budapest-night.vercel.app](https://budapest-night.vercel.app) · **API docs:** [/api](https://budapest-night.vercel.app/api)

## Features

- **Catalog** — Venues, timed events (concerts/shows), Eat & Drink menus, themed three-stop tours, meetup groups, and district filters.
- **Locales** — English (default), Hungarian, Spanish, Italian, Hebrew, and Arabic with per-locale slugs and copy.
- **Currency** — Prices stored in **Hungarian forint (HUF)**; visitors can switch display to EUR or USD using fixed rates from admin site settings (default 350 HUF/EUR, 300 HUF/USD).
- **Venue URLs** — Public links use **canonical slugs** (e.g. `/venue/budapest-park`), not misleading district segments in internal ids. Legacy `prov-*` paths redirect to the canonical slug.
- **Venue profiles** — Show upcoming timed events hosted at that venue, menus, map, and shareable full-page URLs (`/venue/{slug}/full`).
- **Machine ingest** — Batch JSON API (`POST /api/ingest`) for headless CMS, ImgBB image upload, and optional curator cron.
- **Admin** — Site copy, hero images, currency rates, and catalog editing.

## Stack

Next.js (App Router), MongoDB, ImgBB CDN, Vitest, next-intl, TanStack Query.

## Environment variables

1. Copy `.env.example` to `.env` and/or `.env.local`.
2. Generate secrets: `npm run env:generate`
3. Set **MONGODB_URI**, **MONGODB_DB** (e.g. `budapest-night`), **IMGBB_API_KEY**, **INGEST_API_KEY**, **ADMIN_PASSWORD**.
4. Optional: **CURATOR_OPENAI_API_KEY**, **SERPER_API_KEY** for automated curator cron.
5. Push to Vercel: `npm run vercel:env:push`

**Warning:** `npm run db:seed` resets locations and site defaults on the target database. Use a dedicated `MONGODB_DB` for this project.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests |
| `npm run db:seed` | Reset Mongo locations + site defaults |
| `npm run db:seed-timed-events` | Seed sample venues/events (Moby, Sting, etc.) |
| `npm run db:backfill-event-venue-links` | Backfill `venueLinks` on timed events |
| `npm run db:backfill-menu-venue-links` | Backfill `menu.venueLink` on providers |
| `npm run ingest:listing -- path.json` | POST ingest payload (`--force` to skip dry-run) |
| `node scripts/fix-venue-slugs.cjs --ingest` | Set canonical `locales.en.slug` for all providers |
| `npm run imgbb:upload-assets` | Upload bundled hero images to ImgBB |
| `npm run vercel:env:push` | Sync env vars to linked Vercel project |

## Deploy

```bash
npx vercel link
npx vercel --prod
```

## API

Interactive reference at **`/api`** on your deployment. Public read endpoints under `/api/public/*`; writes via `/api/ingest` with `INGEST_API_KEY`.

## License

Private project — see repository owner for terms.
