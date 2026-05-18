## Summary

Launch **“Csütörtöki Pesti Est”** — weekly HU email digest generated from the same catalog data as the app (R2), recreating the Thursday publish habit.

## Business outcome

- Retention channel without print cost
- Direct venue/event traffic with measurable CTR
- Sponsor slot monetization (R5) in email footer

## User stories

- As a **subscriber**, I receive Thursday morning email with top events and editor picks
- As **editor**, I approve digest content in admin (or auto-send from published program week)
- As **unsubscriber**, one-click opt-out compliant with GDPR

## Functional requirements

### Subscriber management
- [ ] Mongo `newsletterSubscribers`: `email`, `locale` (default `hu`), `status`, `consentAt`, `unsubscribeToken`
- [ ] Public endpoints: `POST /api/public/newsletter/subscribe`, `GET /api/public/newsletter/unsubscribe?token=`
- [ ] Double opt-in for EU (confirmation email)
- [ ] Privacy policy link (client-provided URL)

### Content assembly
- [ ] Template: week headline, intro, 6–10 events (cards), 4 venues, CTA to full program week URL
- [ ] Source: `programWeek` doc (R2) + fallback algorithm
- [ ] Render HTML email (responsive); plain-text alternative

### Delivery
- [ ] Integrate Resend, SendGrid, or AWS SES (env vars documented)
- [ ] Scheduled job: Thursday 07:00 Europe/Budapest (Vercel Cron or external)
- [ ] Admin: “Send test”, “Schedule”, view last send stats (opens/clicks if provider supports)

### Compliance
- [ ] Store consent timestamp; export/delete on request
- [ ] Footer: company name, address, unsubscribe

## Technical scope

| Area | Notes |
|------|-------|
| Cron | `vercel.json` cron → API route |
| Email | React Email or MJML templates in `emails/` |
| Rate limits | cap sends per batch |

## Acceptance criteria

1. Test digest received in major clients (Gmail, Apple Mail) with readable layout
2. Unsubscribe link works in one click; status updated in DB
3. Scheduled send completes for &gt;100 test subscribers without timeout
4. No send without confirmed opt-in
5. Sponsor block renders when week has `sponsorUrl` (R5)

## Dependencies

- **R2** program week API
- **R1** brand in template
- **R5** optional sponsor fields

## Out of scope

- Push notifications (native PWA)
- Daily digest

## Estimate

**L** (5–7 dev days)
