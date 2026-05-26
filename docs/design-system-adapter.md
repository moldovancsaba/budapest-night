# Design system adapter — Pesti Est (budapest-night)

Status: **GDS-only** (Mantine via `@gds/*` only)  
GDS version: **2.4.3** · [sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system)  
Last updated: 2026-05-25

> SSOT: sovereignsquad GDS. Inventory: [`gds-adoption.json`](../gds-adoption.json). Exceptions: [`design-system-exceptions.md`](./design-system-exceptions.md).

## Policy

| Rule | Implementation |
|------|----------------|
| UI primitives | Mantine + `@gds/theme`, `@gds/core` only |
| Icons | `@/components/gds/icons` or `GdsIcons` — **no** `lucide-react` |
| Legacy UI | No `@/components/ui/*`, Tailwind, Radix, shadcn |
| Theme | `extendGdsTheme` in `src/theme/pestiestTheme.ts` |
| Provider | `GdsProvider` in `src/components/gds/MantineRoot.tsx` |
| Host copy | next-intl; GDS `getGdsMessages` for semantic controls |

## Adapter paths

| Contract | Path |
|----------|------|
| GDS vendor path | `vendor/general-design-system` (symlink to sibling locally) |
| Theme | `src/theme/pestiestTheme.ts` |
| Root provider | `src/components/gds/MantineRoot.tsx` |
| Icons barrel | `src/components/gds/icons.ts` |
| Buttons | `src/components/gds/AppButton.tsx` (legacy variant map; prefer Mantine/`SemanticButton`) |
| Empty / state | `@gds/core` `EmptyState`, `StateBlock` via `src/components/gds` |
| Shell | `src/components/scout/BudapestNightShell.tsx` |
| Notify | `src/lib/notify.ts` (`@mantine/notifications`) |

## Commands

```bash
npm run gds:vendor    # ensure vendor/general-design-system (symlink or clone)
npm run gds:sync      # pull latest GDS main in vendor
npm run build:gds     # build @gds/theme + @gds/core + @gds/admin
npm run gds:check     # adoption manifest compliance
npm run build
```

## Enforcement

- ESLint: `@gds/eslint-config` + `no-restricted-imports` on `lucide-react` and legacy paths
- `prebuild` rebuilds sibling GDS packages

## Adopted from GDS 2.4.3 (2026-05-25)

- `AuthShell` + `SemanticButton` — admin login
- `StateBlock` — shareable loading / not-found
- `FeatureBand` — trust strip
- `DataToolbar` + `FilterDrawer` + `SemanticButton` — discover filters
- `EditorialHero` — home hero
- `PublicSiteFooter` — app footer
- `SemanticButton` — share copy actions
- `@gds/admin` `AppShell` + `PageHeader` — admin dashboard shell
- `ProductCard` + `ListingCardMedia` — venue, event, meet-up listing cards
- `DiscoveryAppShell` — public app sidebar layout adapter

## Remaining product-specific work

- Dedicated `DiscoveryShell` in `@gds/core` (today: `DiscoveryAppShell` adapter mirrors admin regions)
- `PublicProductCard` variant without e-commerce state badge for nightlife listings
- Replace remaining product-labeled `AppButton` CTAs where no semantic action exists
