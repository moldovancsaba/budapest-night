# Pesti Est program verticals (v1)

Mapping for `/program/{vertical}` and `GET /api/public/providers?vertical=…`.

| Vertical | HU label | Provider `activityTypes` | Event `activityTypes` | Notes |
|----------|----------|--------------------------|----------------------|--------|
| `mozi` | Mozi | `Cinema` | `Cinema`, `Festival` | Use `externalProgramUrl` for official műsor |
| `szinhaz` | Színház | `Theatre` | `Theatre`, `Live Music` | Use `repertoireUrl` when available |
| `kiallitas` | Kiállítás | `Gallery`, `Exhibition` | `Gallery`, `Exhibition`, `Festival` | Timed exhibitions as events |
| `koncert` | Koncert | `Live Music`, `Jazz`, `Electronic` | same + `Festival` | Primarily timed events |
| `csalad` | Család | any with `Family` / `All ages` age range | events with family age tags | Cross-category |

**URLs:** HU hub `/ez-a-het`; other locales `/program`. Vertical paths: `/program/mozi`, etc.

**Ingest:** optional fields on providers — `externalProgramUrl`, `repertoireUrl`, `chainId` (see `src/types/provider.ts`).
