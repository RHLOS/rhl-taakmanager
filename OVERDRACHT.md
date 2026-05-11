# Overdracht — rhl-taakmanager
*Laatste update: 2026-05-11*

## Openingsbericht volgende sessie

```
Sessie rhl-taakmanager — vorige sessie 2026-05-11
Lees CLAUDE.md, BRIEFING.md en OVERDRACHT.md van dit project.
Alle 16 bevindingen uit de inspectie van 2026-05-05 zijn nu afgehandeld. De app is schoon.
Volgende actie: vrij te kiezen — nieuwe features, of het opschonen van legacy-kolommen (taken.prioriteit en sub_subtaken.prioriteit in Supabase mogen weg nu prio_ster overal in gebruik is).
```

---

## Waar staan we

App volledig operationeel (desktop). Alle 16 bevindingen uit de inspectie van 2026-05-05 zijn verwerkt. De codebase is schoon.

### Afgehandelde bevindingen (sessie 2026-05-11)

- **B7** — Dode calendar placeholder verwijderd uit `index.html` en `style.css`
- **B8** — Was al opgelost in sessie 2026-05-05 (OVERDRACHT was stale)
- **B9** — Controle: inbox-view toont sub_subtaken correct (geen bug)
- **B10** — Zoekfunctie: query wist nu expliciet bij sidebar-klik via `clearSearch()`
- **B11** — WIE-filterknoppen zichtbaar in Kanban en Calendar; `catFilter` toegepast in beide views
- **B16** — GitHub Actions workflow `.github/workflows/cache-bust.yml` automatiseert `?v=` bij elke push
- **B2** — Tafelnaam-whitelist toegevoegd aan `del`/`delWhere` in `api.js`
- **B6** — `sortItems` O(n²) → O(n log n) via `Map`-lookups
- **B4** — `prio_ster` geüniformeerd: Supabase-migratie + frontend volledig bijgewerkt

## Open punten

1. **Opruimen legacy-kolommen** (optioneel, laag risico): `taken.prioriteit` (text) en `sub_subtaken.prioriteit` (boolean) kunnen uit Supabase zodra je zeker bent dat de migratie goed gegaan is. Wacht minimaal één week na deployen.
2. **B5/B15** — Architectuur: alles globaal in één scope, geen ES modules (info, geen actie vereist)

## Volgende actie

De app is schoon. Kies een nieuwe feature of laat de legacy-kolommen na een week opruimen.

## Werkafspraken (samenvatting)

- Token-zuinig: `grep` + `offset/limit`, Sonnet ipv Opus
- Niets bouwen zonder toestemming — stap voor stap
- Bij Supabase-SQL: altijd "wis eerst het tekstveld"
- Na elke wijziging: commit + push (`main` = live op GitHub Pages)
- Link: https://rhlos.github.io/rhl-taakmanager/ (privévenster Cmd+Shift+N)
