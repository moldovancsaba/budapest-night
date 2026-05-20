## Summary

Umbrella epic for transforming the **Budapest Night** codebase into **PestiEst** — the digital successor to Hungary’s free weekly Budapest program magazine (1992–2020). All child issues implement the client strategy brief: historical cultural role, post-2020 business model shift, and brand/SEO recovery.

## Strategic context

| Legacy Pesti Est | Target PestiEst app |
|------------------|---------------------|
| Free weekly print program guide (~130k copies, ~1,320 distribution points) | Always-on digital program guide |
| Mozi, színház, kiállítás, zene, család | Same verticals in navigation + data model |
| 100% advertising revenue | Featured / sponsored inventory on catalog |
| est.hu + pestiest.hu | Canonical domain + structured SEO |
| HU-primary locals | HU-default brand; 6 locales for visitors |

## Child roadmap issues (execution order)

1. [#2 — R1 Brand & domain](https://github.com/moldovancsaba/budapest-night/issues/2)
2. [#3 — R2 Ez a hét weekly home](https://github.com/moldovancsaba/budapest-night/issues/3)
3. [#4 — R3 Program verticals](https://github.com/moldovancsaba/budapest-night/issues/4)
4. [#5 — R4 Partner distribution](https://github.com/moldovancsaba/budapest-night/issues/5)
5. [#6 — R5 Monetization featured inventory](https://github.com/moldovancsaba/budapest-night/issues/6)
6. [#7 — R6 SEO & structured data](https://github.com/moldovancsaba/budapest-night/issues/7)
7. [#9 — R8 International layer](https://github.com/moldovancsaba/budapest-night/issues/9)

**Project board:** https://github.com/users/moldovancsaba/projects/43

## Definition of done (epic)

- [ ] Pesti Est is the public product name on HU surfaces; working title “Budapest Night” removed from user-visible copy
- [ ] User can answer “Mi van ezen a héten Budapesten?” from the home experience
- [ ] Mozi and színház are first-class discovery paths with ingested listings
- [ ] At least one monetization slot is configurable in admin and visible on production
- [ ] pestiest.hu (or agreed domain) serves the app with correct canonicals and Event schema on timed listings

## References

- Repo: `moldovancsaba/budapest-night` (working title)
- Curator ops: `docs/catalog-curation.md`
- Live catalog API: `/api/public/providers`, `/api/public/events`
