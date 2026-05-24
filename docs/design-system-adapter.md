# Design system adapter — Pesti Est (budapest-night)

Status: **Mantine-only migration complete** (code)  
GDS version: 2.2.0 · `@gds/theme` monorepo  
Last updated: 2026-05-24

> [General Design System](https://github.com/moldovancsaba/general-design-system) is SSOT. [Exceptions](./design-system-exceptions.md) are documented separately.

## Locked decisions (implemented)

| Topic | Decision |
|-------|----------|
| Scope | Full Mantine-only migration |
| Visual | Monochrome + brand red parity |
| Theme | `@gds/theme` + `src/theme/pestiestTheme.ts` |
| Color mode | Mantine `ColorSchemeScript` + `useMantineColorScheme` |
| Notifications | `@mantine/notifications` via `src/lib/notify.ts` |
| Tailwind / shadcn / Radix | **Removed** |
| ESLint | `no-restricted-imports` on `@/components/ui/*` in scout/admin |
| QA | [#26](https://github.com/moldovancsaba/budapest-night/issues/26) manual 6-locale sign-off |

## Adapter paths

| Contract | Path |
|----------|------|
| GDS theme package | `../general-design-system/packages/gds-theme` |
| Local theme override | `src/theme/pestiestTheme.ts` |
| Root provider | `src/app/providers.tsx` → `src/components/mantine/MantineRoot.tsx` |
| Button | `src/components/mantine/AppButton.tsx` |
| State block | `src/components/mantine/StateBlock.tsx` |
| Shell | `src/components/scout/BudapestNightShell.tsx` |
| Media | `src/components/media/CdnImage.tsx` |
| Notify | `src/lib/notify.ts` |

## Build

```bash
cd ../general-design-system/packages/gds-theme && npm run build
cd ../../../budapest-night && npm install && npm run build
```

## GitHub

- Epic: [#11](https://github.com/moldovancsaba/budapest-night/issues/11) (open until #26 QA done)
- Board: [project 43](https://github.com/users/moldovancsaba/projects/43)
