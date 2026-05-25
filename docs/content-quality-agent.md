# Content quality agent (Cursor)

Automated **catalog QA** for Pesti Est: duplicate images, dead links, missing menus, locale gaps, and stale copy. Fixes go through **ingest** payloads, not ad-hoc DB edits.

## Quick start

1. In Cursor, start a **new Agent** chat in this repo.
2. Paste the full contents of [`scripts/cursor-content-quality-agent-prompt.txt`](../scripts/cursor-content-quality-agent-prompt.txt).
3. The agent loads [`.cursor/skills/content-quality-agent/SKILL.md`](../.cursor/skills/content-quality-agent/SKILL.md) and runs audits + fixes.

Or run audits only:

```bash
npm run content:quality:audit
```

Then open `scripts/catalog-audit-findings.md`.

## What it checks

| Command | Purpose |
|---------|---------|
| `audit:catalog --skip-urls` | Duplicate/banned images, domains, locations, menus |
| `menu:status` | Restaurants / Cafés / Parties without menus |
| `i18n:audit` | Message key parity across 6 locales |
| `audit:program-locales` | Program week copy parity |

Full URL probing (slow): `npm run audit:catalog` without `--skip-urls`.

## Fixing data

See [catalog-curation.md](./catalog-curation.md). Typical flow:

1. Triage highs in `catalog-audit-findings.md`
2. Write `scripts/ingest-payloads/content-quality-YYYY-MM-DD-<slug>.json`
3. `npm run ingest:listing` or `npm run ingest:db`
4. Re-run `npm run content:quality:audit`

Curator prompts for authoring payloads: `scripts/cursor-curator-prompt.txt` (index).

## Schedule in Cursor

**Automations** (Cursor Settings → Automations):

- **Trigger**: Cron e.g. `0 9 * * 1` (Monday 09:00) or weekly manual
- **Action**: Run agent with prompt file `scripts/cursor-content-quality-agent-prompt.txt` on workspace `budapest-night`
- **Review**: Agent should post a summary; approve ingest commits before push

**GitHub Action** (optional): add a workflow that only runs `npm run content:quality:audit` and uploads findings — fixes stay in Agent/PR workflow.

## UI vs content

Listing **layout** (cards, GDS chrome) is separate from **catalog data**. If Discover shows the same image on every card, that is usually `duplicate_provider_image` or shared fallback URLs in Mongo — the content agent fixes ingest data; it does not change `ProviderCard` unless you ask for a UI task.

## Related

- Production curator cron: `/api/cron/curator` (new listings)
- `npm run curator:run` — one-shot curator locally
