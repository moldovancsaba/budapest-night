# Design system exceptions

Status: active  
GDS SSOT: [sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system)

Only dependencies listed here may bypass the Mantine-only **primitive** rule. **shadcn/Radix/Tailwind are removed.**

| Dependency | Scope | Reason | Remove by |
|------------|-------|--------|-----------|
| `react-hook-form` + `@hookform/resolvers` | Forms with Zod (if used) | Headless form state; fields are Mantine | N/A — paired with Mantine inputs |
| `lucide-react` | Icons | Icon glyphs, not layout primitives | Permanent |
| `next/image` | Optimized images | Framework image layer | Permanent |
| Map / OSM embed | `ProviderMap` | Third-party map iframe | Permanent integration |

## Rules

1. New rows require approval on [#25](https://github.com/moldovancsaba/budapest-night/issues/25).
2. No `@/components/ui/*`, `@radix-ui/*`, or `tailwindcss` in product code.
