## Summary

Rebrand the product from working title **Budapest Night** to **Pesti Est** on all user-facing surfaces, and prepare domain/SEO infrastructure for **pestiest.hu** / **est.hu** cutover.

## Business outcome

- Restores 30+ years of brand trust with Budapest locals and venue partners
- Enables recovery of branded search (“Pesti Est program”, “pestiest”)
- Aligns engineering, design, and sales narrative with the client’s actual product

## User stories

- As a **Hungarian visitor**, I see “Pesti Est” as the site name and understand it is the city’s program guide
- As a **venue partner**, shared links and QR materials say Pesti Est, not an internal codename
- As **SEO**, each locale has correct `title`, `description`, Open Graph, and canonical URL on the production domain

## Functional requirements

### Brand & copy
- [ ] Replace `brand`, meta titles, share strings, and “how it works” copy in `src/messages/{hu,en,es,it,he,ar}.json`
- [ ] HU default positioning: *ingyenes budapesti programmagazin* / *városi kulturális programok*
- [ ] Update `src/types/site.ts` defaults and admin-editable site copy where “Budapest Night” appears
- [ ] Favicon, PWA manifest (`public/`), and social preview images reflect Pesti Est (or interim wordmark spec)

### Domain & routing
- [ ] Document domain cutover plan: primary host, redirects from legacy Vercel URL, apex + www
- [ ] Configure `metadataBase` / canonical in Next.js root layout for production domain
- [ ] `robots.txt` + `sitemap.xml` (or dynamic sitemap route) list HU program URLs (stub OK if R6 owns full sitemap)

### Technical SEO baseline
- [ ] Per-locale `<html lang>` and hreflang alternates for existing 6 locales
- [ ] Remove “Budapest Night” from JSON-LD / Organization name if present

## Technical scope (indicative)

| Area | Files / systems |
|------|-----------------|
| i18n | `src/messages/*.json`, `src/i18n/config.ts` |
| Layout / meta | `src/app/[locale]/layout.tsx`, locale layouts |
| Site CMS | Admin site settings, `src/types/site.ts` |
| Deploy | Vercel project domains, env `NEXT_PUBLIC_SITE_URL` |

## Acceptance criteria

1. `GET /hu` page title and header logo text read **Pesti Est** (or approved stylization **PestiEst**)
2. No user-visible “Budapest Night” on HU/EN home, discover, venue, or event pages (grep audit passes)
3. Share preview for a venue URL shows Pesti Est branding
4. Production build succeeds; Vitest/i18n tests updated for new keys
5. Written **domain cutover checklist** in `docs/` (DNS, SSL, redirect table, rollback)

## Dependencies

- Client confirms legal rights to **Pesti Est** name and target domain(s)
- Approved logo/wordmark assets (or design ticket)

## Out of scope

- Full mozi/színház catalog (R3)
- Weekly home UX (R2)
- Newsletter (R7)

## Estimate

**M** (3–5 dev days) + design/copy review
