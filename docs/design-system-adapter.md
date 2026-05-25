# Design system adapter — Pesti Est (budapest-night)

Status: **GDS 2.4 adoption (partial)**  
GDS version: **2.4.3** · packages via monorepo sibling ([sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system))  
Last updated: 2026-05-25

> [General Design System](https://github.com/sovereignsquad/general-design-system) is SSOT. Machine-readable inventory: [`gds-adoption.json`](../gds-adoption.json). [Exceptions](./design-system-exceptions.md) are documented separately.

## Locked decisions (implemented)

| Topic | Decision |
|-------|----------|
| Scope | Full Mantine-only migration |
| Visual | Monochrome + brand red parity |
| Theme | `extendGdsTheme` + `src/theme/pestiestTheme.ts` |
| Root provider | `GdsProvider` from `@gds/theme/client` |
| Color mode | GDS `ThemeToggle` + `defaultColorScheme="dark"` |
| Notifications | Via `GdsProvider` (Mantine notifications) |
| Host i18n | next-intl for page copy; GDS messages for semantic controls |
| Tailwind / shadcn / Radix | **Removed** |
| ESLint | `no-restricted-imports` on `@/components/ui/*` in scout/admin |
| QA | [#26](https://github.com/moldovancsaba/budapest-night/issues/26) — 6-locale sign-off |

## Adapter paths

| Contract | Path |
|----------|------|
| GDS repo (SSOT) | `../general-design-system` → [sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system) |
| Local theme override | `src/theme/pestiestTheme.ts` (`@gds/theme/server`) |
| Root provider | `src/app/providers.tsx` → `src/components/mantine/MantineRoot.tsx` |
| GDS semantic messages | `src/lib/gdsMessages.ts` |
| Button | `src/components/mantine/AppButton.tsx` (legacy shadcn variant map) |
| State block | `src/components/mantine/StateBlock.tsx` (legacy wrapper; migrate to `@gds/core` `StateBlock`) |
| Shell | `src/components/scout/BudapestNightShell.tsx` |
| Media | `src/components/media/CdnImage.tsx` |
| Notify | `src/lib/notify.ts` |

## Build

```bash
# From budapest-night (prebuild runs this automatically)
npm run build:gds

# Or manually
cd ../general-design-system/packages/gds-theme && npm run build
cd ../general-design-system/packages/gds-core && npm run build
cd ../../../budapest-night && npm install && npm run build
```

**Vercel:** clone/build `general-design-system` sibling or switch to published `@gds/*` when on npm.

## Next adoption steps

1. Replace local `StateBlock` / `AppButton` with `@gds/core` contracts where APIs align.
2. Adopt `PublicShell` / `ProductCard` for scout surfaces.
3. Enable `@gds/eslint-config` when Lucide exception is reflected in shared lint policy.
4. Prefer published `@gds/*@2.4.3` on npm when Vercel drops sibling-repo builds.

## GitHub

- GDS plan: [PESTIEST_MANTINE_REFACTOR.md](https://github.com/sovereignsquad/general-design-system/blob/main/PROJECTS/PESTIEST_MANTINE_REFACTOR.md)
- Product board: [project 43](https://github.com/users/moldovancsaba/projects/43)
