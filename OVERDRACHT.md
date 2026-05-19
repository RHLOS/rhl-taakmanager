# Overdracht — rhl-taakmanager
*Laatste update: 2026-05-19*

## Status: AFGESLOTEN

Dit project is op 2026-05-19 uit productie gehaald. Raimon werkt verder in [`code/project-management/`](../project-management/), dat dezelfde Supabase-database deelt.

## Openingsbericht volgende sessie

```
Dit project is afgesloten op 2026-05-19. Het is vervangen door code/project-management.
Lees CLAUDE.md, BRIEFING.md en PROJECTLOG.md alleen als referentie/archief.
Mocht er onverhoopt een nieuwe sessie hier nodig zijn: niets meer aanraken aan
Supabase, MCP-config of de Personal Access Token — die zijn gedeeld met de projectmanager.
```

---

## Wat is er uitgezet

| Onderdeel | Status |
|---|---|
| Dagelijkse e-mailreminder (pg_cron) | ✅ gestopt (`cron.unschedule`) |
| Edge Function `dagelijkse-reminder` | ✅ verwijderd |
| Resend API-keys (Onboarding + Scheduler) | ✅ ingetrokken |
| GitHub Pages site | ✅ uit (Branch = None) |
| GitHub repo `RHLOS/rhl-taakmanager` | ✅ gearchiveerd (read-only) |

## Wat blijft staan en waarom

| Onderdeel | Reden |
|---|---|
| Supabase-project `fhkttfzqdjynzmtjbujv` | Gedeeld met projectmanager — niet pauzeren |
| MCP-blok in `claude_desktop_config.json` | `--project-ref` is nog correct voor projectmanager |
| Personal Access Token `sbp_…` | Nodig voor toekomstige projectmanager-MCP-sessies |
| Tabellen `taken` en `subtaken` | Gedeeld met projectmanager |
| Tabel `sub_subtaken` en andere taakmanager-specifieke tabellen | Op te schonen vanuit de projectmanager-sessie |

## Archief-waarde

De code (in deze repo) blijft als referentie behouden. Patronen die mogelijk nuttig zijn voor de projectmanager:
- Cache-bust workflow (`.github/workflows/cache-bust.yml`)
- Apple Dark thema (variabelen in `style.css`)
- Supabase fetch-helpers met `ALLOWED_TABLES` whitelist (`api.js`)

## Werkafspraken (historisch — voor referentie)

- Token-zuinig: `grep` + `offset/limit`, Sonnet ipv Opus
- Bij Supabase-SQL: altijd "wis eerst het tekstveld"
- Gebruiker is een leek — simpel uitleggen
