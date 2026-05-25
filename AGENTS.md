# Agent guide — budapest-night (Pesti Est)

## Content quality (catalog data)

**Use when:** duplicate listing images, wrong venue URLs, missing menus, locale gaps, stale copy.

| Resource | Path |
|----------|------|
| Skill | `.cursor/skills/content-quality-agent/SKILL.md` |
| Chat prompt | `scripts/cursor-content-quality-agent-prompt.txt` |
| Docs | `docs/content-quality-agent.md` |
| Audit bundle | `npm run content:quality:audit` |

## New listings (curator)

| Resource | Path |
|----------|------|
| Index | `scripts/cursor-curator-prompt.txt` |
| Docs | `docs/catalog-curation.md` |

## Design system (UI)

| Resource | Path |
|----------|------|
| Adapter | `docs/design-system-adapter.md` |
| GDS SSOT | [sovereignsquad/general-design-system](https://github.com/sovereignsquad/general-design-system) |

Do not mix content-ingest work with GDS refactors in one agent run unless explicitly requested.
