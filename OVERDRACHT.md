# Overdracht — rhl-taakmanager
*Laatste update: 2026-05-12*

## Openingsbericht volgende sessie

```
Sessie rhl-taakmanager — vorige sessie 2026-05-12
Lees CLAUDE.md, BRIEFING.md en OVERDRACHT.md van dit project.
Cache-bust workflow is gerepareerd en werkt. Verificatieperiode legacy-kolommen is voorbij.
Volgende actie: legacy-kolommen taken.prioriteit en sub_subtaken.prioriteit verwijderen uit Supabase, of een nieuwe feature kiezen.
```

---

## Waar staan we

App volledig operationeel (desktop). Codebase schoon. Cache-bust workflow draait correct na een permissie-fix van vandaag.

## Open punten

1. **Opruimen legacy-kolommen** (klaar om te doen): `taken.prioriteit` (text) en `sub_subtaken.prioriteit` (boolean) kunnen nu uit Supabase — verificatieperiode van één week na de migratie (2026-05-11) is voorbij.
2. **B5/B15** — Architectuur: alles globaal in één scope, geen ES modules (info, geen actie vereist).

## Volgende actie

Legacy-kolommen opruimen via Supabase SQL, of een nieuwe feature starten — naar keuze.

## Werkafspraken (samenvatting)

- Token-zuinig: `grep` + `offset/limit`, Sonnet ipv Opus
- Niets bouwen zonder toestemming — stap voor stap
- Bij Supabase-SQL: altijd "wis eerst het tekstveld"
- Na elke wijziging: commit + push (`main` = live op GitHub Pages)
- Link: https://rhlos.github.io/rhl-taakmanager/ (privévenster Cmd+Shift+N)
