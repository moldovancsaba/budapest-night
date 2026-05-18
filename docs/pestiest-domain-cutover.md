# pestiest.hu domain cutover (R1 prep)

Working deployment: **https://budapest-night.vercel.app**  
Target brand domain: **pestiest.hu** (and optional **est.hu** redirect)

## Pre-cutover checklist

- [ ] DNS: `pestiest.hu` A/AAAA or CNAME to Vercel
- [ ] Vercel project → Domains: add `pestiest.hu` + `www.pestiest.hu`
- [ ] Set production env `NEXT_PUBLIC_SITE_URL=https://pestiest.hu`
- [ ] Verify SSL certificate issued (Vercel automatic)
- [ ] Keep `budapest-night.vercel.app` as redirect origin (301 → pestiest.hu)

## Redirect table (Vercel / middleware)

| From | To |
|------|-----|
| `https://budapest-night.vercel.app/*` | `https://pestiest.hu/*` (301) |
| `http://pestiest.hu/*` | `https://pestiest.hu/*` |
| `https://www.pestiest.hu/*` | `https://pestiest.hu/*` (canonical apex) |

## App config touchpoints

| File / env | Action |
|------------|--------|
| `NEXT_PUBLIC_SITE_URL` | Production canonical origin |
| `src/app/[locale]/layout.tsx` | `metadataBase` via `getSiteOrigin()` |
| `src/app/sitemap.ts`, `robots.ts` | Use same env |
| Partner QR URLs | Regenerate pack after URL change |
| Search Console | New property + sitemap (see `docs/seo-search-console.md`) |

## Rollback

1. Remove custom domain from Vercel (traffic returns to `*.vercel.app`)
2. Revert `NEXT_PUBLIC_SITE_URL` to Vercel URL
3. Redeploy previous production build

## Post-cutover QA

- [ ] `/hu`, `/ez-a-het`, `/en/program` load with correct canonical
- [ ] hreflang alternates point to pestiest.hu
- [ ] QR codes resolve to new host
- [ ] No mixed-content or wrong `metadataBase` on OG tags
