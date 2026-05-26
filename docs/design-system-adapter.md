# Design system adapter — Pesti Est (budapest-night)

Status: **GDS-only** (Mantine via `@doneisbetter/gds-*` only)  
GDS version: **2.6.1** · [sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system)  
Last updated: 2026-05-26

> SSOT: sovereignsquad GDS. Inventory: [`gds-adoption.json`](../gds-adoption.json). Exceptions: [`design-system-exceptions.md`](./design-system-exceptions.md).

## Policy

| Rule | Implementation |
|------|----------------|
| UI primitives | Mantine + `@doneisbetter/gds-theme`, `@doneisbetter/gds-core` only |
| Icons | `@/components/gds/icons` or `GdsIcons` — **no** `lucide-react` |
| Legacy UI | No `@/components/ui/*`, Tailwind, Radix, shadcn |
| Theme | `extendGdsTheme` in `src/theme/pestiestTheme.ts` |
| Provider | `GdsProvider` in `src/components/gds/MantineRoot.tsx` |
| Host copy | next-intl; `getGdsMessages` for semantic controls |

## Package install

**Canonical (when published to npm):**

```bash
npm install @doneisbetter/gds-theme @doneisbetter/gds-core @doneisbetter/gds-admin
npm install -D @doneisbetter/gds-eslint-config @doneisbetter/gds-compliance
```

**Current (pre-registry):** `file:vendor/general-design-system/packages/gds-*` with `preinstall` / `prebuild` until `@doneisbetter/*` is on npm. Do **not** use the deprecated `@gds/*` scope.

## Import paths

| Use | Path |
|-----|------|
| Provider (client) | `@doneisbetter/gds-theme/client` |
| Theme extension (server) | `@doneisbetter/gds-theme/server` |
| Public primitives (client) | `@doneisbetter/gds-core/client` |
| Public primitives (server) | `@doneisbetter/gds-core/server` |
| Admin (client) | `@doneisbetter/gds-admin/client` |

## Adapter paths

| Contract | Path |
|----------|------|
| GDS vendor | `vendor/general-design-system` (symlink or tarball @ pin in `ensure-gds-vendor.cjs`) |
| Theme | `src/theme/pestiestTheme.ts` |
| Root provider | `src/components/gds/MantineRoot.tsx` |
| Icons barrel | `src/components/gds/icons.ts` |
| Buttons | `src/components/gds/AppButton.tsx` (legacy; prefer `SemanticButton`) |
| Semantic actions | `src/components/gds/SemanticButton.tsx` |
| Empty / state | `@doneisbetter/gds-core` via `src/components/gds` |
| Shell | `src/components/scout/BudapestNightShell.tsx` |
| Notify | `src/lib/notify.ts` (`@mantine/notifications`) |

## Commands

```bash
npm run gds:vendor    # ensure vendor/general-design-system
npm run gds:sync      # pull latest GDS main in vendor
npm run build:gds     # build @doneisbetter/gds-theme, gds-core, gds-admin
npm run gds:check     # adoption manifest compliance
npm run build
```

## Adopted from GDS 2.6.x

- `BrowseSurface` — events + weekly program
- `PublicProductCard` — venue listing cards (pilot)
- `AccentPanel`, `EditorialHero`, `FeatureBand`, `PublicSiteFooter`
- `AuthShell`, `DataToolbar`, `FilterDrawer`, `StateBlock`, `EmptyState`
- `@doneisbetter/gds-admin` `AppShell` + `PageHeader`
- `DiscoveryAppShell` — sidebar adapter

## Remaining work

- `DiscoveryShell` in `@doneisbetter/gds-core`
- `EventCard` / meet-up cards on `PublicProductCard` or `EditorialCard`
- Switch `file:vendor/...` → npm `@doneisbetter/*@^2.6.1` when registry publish is live
