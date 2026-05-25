# Design system exceptions

Status: active  
GDS SSOT: [sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system)

Only dependencies listed here may bypass the Mantine + GDS **primitive** rule. **shadcn / Radix / Tailwind / lucide-react are removed.**

| Dependency | Scope | Reason | Remove by |
|------------|-------|--------|-----------|
| `react-hook-form` + `@hookform/resolvers` | Forms with Zod (if used) | Headless form state; fields are Mantine | N/A — paired with Mantine inputs |
| `next/image` | Optimized images | Framework image layer | Permanent |
| Map / OSM embed | `ProviderMap` | Third-party map iframe | Permanent integration |
| `@tabler/icons-react` | `src/components/gds/icons.ts` only | Tabler confined to canonical icon barrel | Permanent |

## Rules

1. New rows require GDS maintainer + product owner approval.
2. No `@/components/ui/*`, `@radix-ui/*`, `tailwindcss`, or `lucide-react` in product code.
3. Icons: import from `@/components/gds/icons` or `GdsIcons` from `@gds/core` only.
