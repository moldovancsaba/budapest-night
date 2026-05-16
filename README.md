# Budapest Night

Next.js app to discover Budapest events, parties, restaurants, cafés, and culture — by district and neighborhood. Cyberpunk-inspired neon UI.

Forked from the ClassScout NYC stack (MongoDB, ImgBB, ingest API, Vercel cron curator).

## Environment variables

1. Copy `.env.example` to `.env` and/or `.env.local`.
2. Generate secrets: `npm run env:generate`
3. Set **MONGODB_URI**, **IMGBB_API_KEY**, ingest/admin keys.
4. **Use a dedicated `MONGODB_DB`** (e.g. `budapest-night` in `.env.local`). Do **not** point at the ClassScout database — `npm run db:seed` wipes listings on the target DB.
4. Push to Vercel: `npm run vercel:env:push`

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Reset Mongo **locations** + site defaults |
| `npm run vercel:env:push` | Sync env to linked Vercel project |

## Deploy

```bash
npx vercel link
npx vercel --prod
```
