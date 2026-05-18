## Summary

Replace the legacy **~1,320 print distribution points** with measurable **digital touchpoints**: venue QR codes, printable counter cards, and partner embeds.

## Business outcome

- Venues see traffic attributed to Pesti Est (partner retention)
- Recreates “pick up the program” behavior as “scan for this week”
- Sales tool: bundled QR kit with featured listing (R5)

## User stories

- As a **venue staff**, I print an A5 card with QR linking to our Pesti Est page and weekly program
- As a **visitor**, scanning the QR opens the venue profile (mobile) with upcoming events and “More this week”
- As **partnerships**, I download SVG/PNG QR and UTM-tagged URL from admin or a self-service page

## Functional requirements

### Venue QR
- [ ] Each provider gets stable short URL: `https://{domain}/hu/v/{slug}` or `/hu/venue/{slug}?src=qr`
- [ ] QR generator API or page: `GET /api/public/venues/{id}/qr.svg?size=300&utm_campaign=venue_counter`
- [ ] Venue profile shows “Pesti Est partner” badge when `partnerTier` ≥ `listed`

### Printable assets
- [ ] PDF template (A5): Pesti Est logo, venue name, QR, “Fedezd fel a heti programot” — generate server-side or documented Figma + mail merge
- [ ] District batch PDF: optional multi-QR sheet for festival partners

### UTM & analytics
- [ ] Standard UTM params: `utm_source=pestiest&utm_medium=qr&utm_content={prov-id}`
- [ ] Admin dashboard widget: top referrers by `src=qr` (Vercel Analytics or Plausible hook — document choice)

### Embed (optional v1.1)
- [ ] `iframe` or script widget: “Upcoming at {venue}” for partner `.hu` sites (read-only public API, CORS policy documented)

## Technical scope

| Area | Implementation |
|------|----------------|
| QR | `qrcode` npm package or edge function |
| Routes | Venue pages already exist; add `src` query handling for analytics |
| PDF | `@react-pdf/renderer` or external service |
| Admin | “Download QR pack” on provider row |

## Acceptance criteria

1. QR scan on iOS/Android resolves to correct HU venue page in &lt;2s
2. Generated PNG/SVG passes print test at 300 DPI on A5
3. UTM parameters persist through client navigation (document in analytics)
4. Legal: privacy note on printable (“Adatkezelés: …”) approved by client
5. Pilot with ≥3 live venues (e.g. A38, one cinema, one theatre) physically deployed

## Dependencies

- **R1** domain live on production host
- **R2** weekly hub linked from venue CTA (“További programok ezen a héten”)

## Out of scope

- Physical print fulfillment logistics
- NFC tags

## Estimate

**M** (4–6 dev days)
