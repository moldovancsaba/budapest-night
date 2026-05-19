# Program week — editorial picks

**Week boundary:** Thursday 00:00 → Wednesday 23:59 (Europe/Budapest).  
**Current week id:** `YYYY-MM-DD` of that Thursday (e.g. `2026-05-14`).

## Apply picks (recommended)

```bash
npm run ops:program-week
```

This runs `scripts/patch-program-week-current.cjs` against production MongoDB.

## Admin paste (Program week tab)

**Featured event IDs** (one per line):

```
event-nebula-a38-2026
event-makam-trio-zenehaza-2026
event-guido-mancusi-zeneakademia-2026
event-kft-45th-a38-2026
event-sting-mvm-dome-2026
event-scorpions-mvm-dome-2026
event-wagner-walkure-mupa-2026
event-man-with-a-mission-akvarium-2026
event-rilles-budapest-park-2026
```

**Featured provider IDs:**

```
prov-urania-film
prov-nemzeti-szinhaz
prov-katona-szinhaz
prov-a38-ferencvaros
```

**HU intro (optional):**  
*Kedd esti koncertek: A38, Zeneakadémia és ingyenes jazz a Zene Házában — plusz nyári nagykoncertek elővétele.*

Order matters: IDs **inside the current week** appear under **Kiemelt események**; later dates appear under **Közelgő — szerkesztői ajánló**.

## Audit command

```bash
node -r ./scripts/load-env.cjs -e "
const { getCurrentWeekId, getWeekBounds, eventsInWeek } = require('./src/lib/programWeekCalendar.ts');
(async () => {
  const weekId = getCurrentWeekId();
  const r = await fetch('https://budapest-night.vercel.app/api/public/events?locale=hu');
  const events = await r.json();
  const up = events.filter(e => new Date(e.endsAt) >= Date.now());
  const inW = up.filter(e => eventsInWeek(e.startsAt, weekId));
  console.log('week', weekId, getWeekBounds(weekId));
  inW.forEach(e => console.log(e.id, e.startsAt.slice(0,16), e.title));
})();
"
```
