# Overdracht — rhl-taakmanager
*Laatste update: 2026-05-09*

## Openingsbericht volgende sessie

```
Sessie rhl-taakmanager — vorige sessie 2026-05-09
Lees CLAUDE.md, BRIEFING.md en OVERDRACHT.md van dit project.
B13 (keyboard shortcut N) is afgerond en live. 10 bevindingen staan nog open. Volgende actie: kies een punt uit de lijst, of pak B8 (undo bij prullenmand-verwijdering) als laaghangende vrucht.
```

---

## Waar staan we

App volledig operationeel. Na de inspectie van 2026-05-05 zijn nu 6 van de 16 bevindingen afgehandeld. Er staan nog 10 bevindingen open, variërend van kleine bugfixes tot een Supabase-migratie.

## Open punten

1. **B2** — `delWhere` in `api.js` heeft geen input-validatie; filter-string gaat direct in URL
2. **B8** — Undo ontbreekt bij verwijderen naar prullenmand (wel bij afvinken)
3. **B9** — Inbox-badge telt sub_subtaken; controleer of de inbox-view die ook volledig toont
4. **B10** — Zoekfunctie wist query stil wanneer je op een sidebar-item klikt
5. **B11** — Kanban en Calendar hebben geen WIE-filter (toolbar verborgen in die modes)
6. **B6** — `sortItems` doet O(n²) linear scan voor parent-project lookup
7. **B4** — Prio-veldnaam uniformeren: `taken.prioriteit` = string, `subtaken/sub_subtaken.prio_ster` = boolean — Supabase-migratie nodig
8. **B7** — Calendar placeholder-tekst dode code in `index.html:179`
9. **B16** — Cache-busting `?v=1` is handmatig; vergeten te verhogen = stale cache bij deploy
10. **B5/B15** — Architectuur: alles globaal in één scope, geen ES modules (info, geen actie vereist)

## Volgende actie

Kies een punt uit de lijst. B8 (undo bij prullenmand-verwijdering) is een goede laaghangende vrucht — beperkte scope, geen migratie nodig.
