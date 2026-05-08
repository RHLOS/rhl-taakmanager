# Overdracht — rhl-taakmanager
*Laatste update: 2026-05-05*

## Openingsbericht volgende sessie

```
Sessie rhl-taakmanager — vorige sessie 2026-05-05
Lees CLAUDE.md, BRIEFING.md en OVERDRACHT.md van dit project.
Brede inspectie gedaan; 4 van de 16 bevindingen zijn afgerond. Volgende actie: B13 — keyboard shortcut nieuwe taak (of kies een ander open punt uit de lijst).
```

---

## Waar staan we

App volledig operationeel. Na brede inspectie zijn de vier hoogste prioriteiten afgehandeld: RLS-policies gefixed, dode CSS verwijderd, deadline-urgentie heeft nu 3 gradaties, en metrics schalen mee met de WIE-filter. Er staan nog 11 bevindingen open in de todolijst.

## Open punten

1. **B13** — Keyboard shortcut nieuwe taak (`N` als je niet in een inputveld zit)
2. **B2** — `delWhere` in `api.js` heeft geen input-validatie; filter-string gaat direct in URL
3. **B8** — Undo ontbreekt bij verwijderen naar prullenmand (wel bij afvinken)
4. **B9** — Inbox-badge telt sub_subtaken; controleer of de inbox-view die ook volledig toont
5. **B10** — Zoekfunctie wist query stil wanneer je op een sidebar-item klikt
6. **B11** — Kanban en Calendar hebben geen WIE-filter (toolbar verborgen in die modes)
7. **B6** — `sortItems` doet O(n²) linear scan voor parent-project lookup
8. **B4** — Prio-veldnaam uniformeren: `taken.prioriteit` = string, `subtaken/sub_subtaken.prio_ster` = boolean — Supabase-migratie nodig
9. **B7** — Calendar placeholder-tekst dode code in `index.html:179`
10. **B16** — Cache-busting `?v=1` is handmatig; vergeten te verhogen = stale cache bij deploy
11. **B5/B15** — Architectuur: alles globaal in één scope, geen ES modules (info, geen actie vereist)

## Volgende actie

B13 doorvoeren (keyboard shortcut nieuwe taak), of een ander punt kiezen uit de lijst hierboven.
