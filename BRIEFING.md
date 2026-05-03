# rhl-taakmanager — Briefing

**Versie:** 0.1
**Laatste update:** 2026-04-28

## Wat is dit project?

Persoonlijke taakmanager voor R.H.L. Consultancy. Webapp voor desktop + Supabase als backend + dagelijkse e-mailreminder. In gebruik door één gebruiker (Raimon). Alle taken/subtaken/sub-subtaken op één plek, met directe Claude-integratie via MCP zodat taken vanuit een Claude-chat aangemaakt en afgevinkt kunnen worden.

Live: https://rhlos.github.io/rhl-taakmanager/

## Doelen en kaders

1. **Eén bron van waarheid** voor alle taken — via Supabase.
2. **Inbox-flow** — taken die via Claude binnenkomen (chat of MCP) verschijnen automatisch in de inbox; Raimon verwerkt ze later.
3. **Lage drempel onderhoud** — vanilla HTML/CSS/JS, geen build-stap, GitHub Pages voor hosting. Push naar `main` = direct live.
4. **Buiten scope:** authenticatie (1 gebruiker), team-features, multi-user permissions. Service Worker / offline-support voor mobiel staat geparkeerd tot na mobiel v2.

## Architectuur en methode

### Stack

| Laag | Technologie |
|------|-------------|
| Database + API | Supabase (PostgreSQL + REST) — project ref `fhkttfzqdjynzmtjbujv` |
| Frontend | Vanilla HTML/CSS/JS, geen framework |
| Hosting | GitHub Pages (deployt vanaf `main`) |
| E-mail | Resend API via Supabase Edge Function |
| Cron | pg_cron + pg_net (in Supabase) |
| AI-integratie | Supabase MCP server (Claude Desktop) |
| Charts | Chart.js (analyse-dashboard) |

### Drie niveaus

1. **Projecten** (tabel `taken`) — hoofdtaken, hiërarchie-niveau 1.
2. **Taken** (tabel `subtaken`) — taken binnen een project, niveau 2.
3. **Subtaken** (tabel `sub_subtaken`) — subtaken binnen een taak, niveau 3.

Alle drie tabellen hebben `gedaan`, `gedaan_datum`, `inbox`, `verwijderd_op`, `deadline`, `tijdsinschatting`, `tijd_uitgevoerd`, `context`. Soft-delete via `verwijderd_op timestamptz`. Hiërarchische nummering (1 / 1.1 / 1.1.1) wordt bij render berekend, niet opgeslagen.

Aanvullende tabellen: `afgerond_log` (historie), `meta` (instellingen), `contexts` (dynamisch beheerd vanuit de app), `laag_prioriteit` + `laag_items` (legacy, niet meer in gebruik).

**Let op — prio-veldnaam verschilt per tabel:** `taken.prioriteit = 'hoog'` (string), `subtaken.prio_ster = true` (boolean), `sub_subtaken.prio_ster = true` (boolean). In `app.js` staat daarom `a.prio_ster || a.prioriteit` als workaround.

### Frontend-splitsing

| Bestand | Doel | Indicatieve grootte |
|---------|------|---------------------|
| `index.html` + `style.css` | Desktop HTML + Apple Dark thema | ~230 + ~468 r |
| `api.js` | Supabase config + fetch helpers | ~51 r |
| `ui.js` | Modals, toast, datum-helpers | ~134 r |
| `render.js` + `app.js` | Desktop tabel-render + state/init | ~379 + ~1100 r |
| `analyse.js` + `analyse.css` | Analyse-dashboard met Chart.js | ~400 + ~160 r |

Laadvolgorde: `ui.js → api.js → render.js → app.js → analyse.js`.

### Dagelijkse e-mailreminder

Edge Function `dagelijkse-reminder` op project `fhkttfzqdjynzmtjbujv`. Haalt taken/subtaken/sub-subtaken op met deadline ≤ vandaag, stuurt HTML-mail via Resend (`onboarding@resend.dev` → `raimon@rhlconsultancy.nl`). `verify_jwt: false` (aangeroepen door pg_cron). Cron: `0 7 * * *` (7:00 UTC = 8:00 CET) via pg_cron + pg_net.

### Thema — Apple Dark (definitief)

Geïmplementeerd 1 april 2026, definitief vastgelegd 25 april 2026. Geen lichtmodus, geen alternatieven. Variabelen in `style.css`: `--bg #000000`, `--sidebar-bg #1c1c1e`, `--card #1c1c1e`, `--text #f5f5f7`, `--accent #0a84ff`, `--orange #ff9f0a` (Privé), `--green #30d158` (afvinken), `--red #ff453a`.

## Werkafspraken

1. **NOOIT iets bouwen of aanpassen zonder vooraf toestemming.** Stap voor stap, vragen nummeren, kwaliteit boven snelheid.
2. **Token-zuinig werken (KRITIEK):** Sonnet ipv Opus tenzij anders gevraagd. Nooit hele bestanden lezen — `grep` om sectie te vinden, dan `offset`+`limit`. Nieuwe features in nieuwe bestanden zodat bestaande grote files niet aangeraakt hoeven te worden. `/compact` bij lange sessies.
3. **Bij Supabase-SQL:** altijd zeggen "wis eerst het tekstveld" voordat een nieuwe query in de SQL-editor geplakt wordt.
4. **Na elke werkende wijziging:** committen + pushen naar `main` (GitHub Pages deployt automatisch). Link meesturen bij refresh-verzoek: https://rhlos.github.io/rhl-taakmanager/ (privévenster Cmd+Shift+N tegen cache).
5. **Gebruiker is een leek** — simpel uitleggen, geen jargon zonder uitleg.
6. **Sessie starten vanuit** `~/ClaudeCodeZandbak/` (niet vanuit deze submap) — dan val je in de gedeelde context met de andere apps.

## Stakeholders

1. **Raimon Loman** — enige gebruiker, eigenaar, opdrachtgever.

## Status

Productie. Desktop-only. Authenticatie en offline-support bewust uitgesteld. Zie `OVERDRACHT.md` voor de actuele werklijst en gedetailleerde code-referentie.
