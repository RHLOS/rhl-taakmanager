# RHL Taakmanager — Overdrachtsdocument

**Laatste update:** 13 april 2026
**Project:** rhl-taakmanager
**Repo:** RHLOS/rhl-taakmanager
**Branch:** `main` (feature branch al gemerged)
**GitHub Pages:** https://rhlos.github.io/rhl-taakmanager/

---

## Sessie starten

Zeg bij het begin van een nieuwe sessie:
> "Lees OVERDRACHT.md en ga verder waar we gebleven zijn."

Lees dan dit document, check `git log --oneline -10` voor recente commits, en stel gerichte vragen voordat je iets bouwt.

---

## Token-verbruik laag houden — KRITIEK

De gebruiker heeft een beperkt maandbudget. Hoog verbruik stopt de doorontwikkeling.

1. **Model:** stel altijd `/model claude-sonnet-4-6` in bij sessiestart — Opus kost 5× meer
2. **Nooit hele bestanden lezen** — gebruik `grep` om de juiste sectie te vinden, dan `offset`+`limit` om alleen die regels te lezen
3. **Nieuwe features in aparte bestanden** — zodat bestaande grote bestanden niet aangeraakt hoeven te worden
4. **Gebruik `/compact`** als een sessie lang wordt
5. **Denk voor je leest** — weet je al wat er in een bestand staat? Dan niet opnieuw lezen

---

## Werkafspraken

1. **NOOIT iets bouwen of aanpassen zonder vooraf toestemming**
2. **Altijd vragen stellen** voordat je begint — kwaliteit boven snelheid
3. **Stap voor stap** werken, vragen nummeren
4. **Bij SQL in Supabase:** altijd zeggen "wis eerst het tekstveld"
5. **Gebruiker is een leek** — simpel uitleggen
6. Gebruiker werkt op **MacBook Air**, bestanden in `~/ClaudeCodeZandbak/rhl-taakmanager/`
7. Gebruiker heeft `gh` CLI, ingelogd als **RHLOS**
8. **Na elke werkende wijziging:** committen + pushen naar `main`
9. **Link meesturen** bij elke refresh-verzoek: https://rhlos.github.io/rhl-taakmanager/ (open in privévenster: Cmd+Shift+N)

---

## Wat is er gebouwd

### 1. Webapp — bestandsstructuur

| Bestand | Inhoud | Regels |
|---------|--------|--------|
| `index.html` | HTML structuur | ~230 |
| `style.css` | Alle CSS (Apple Dark thema) | ~468 |
| `api.js` | Supabase config + API helpers | ~51 |
| `ui.js` | Modals, toast, saving indicator, datum helpers | ~134 |
| `render.js` | Render functies (tabel, inbox, voltooid, prullenmand) | ~379 |
| `app.js` | State, filters, attach-functies, init | ~1079 |
| `analyse.js` | Analyse dashboard logica + grafieken | ~400 |
| `analyse.css` | Analyse dashboard styling | ~160 |

**Laadvolgorde scripts:** ui.js → api.js → render.js → app.js → analyse.js

### 2. Supabase backend

- **Project URL:** `https://fhkttfzqdjynzmtjbujv.supabase.co`
- **Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoa3R0ZnpxZGp5bnptdGpidWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDg5NjgsImV4cCI6MjA5MDI4NDk2OH0.0p7IK97uPxBcazlUwredncV8EIFuvgjAhe46N9P118I`
- RLS ingeschakeld, policies "Alles toegestaan" (1 gebruiker, geen auth nodig)

### 3. Database tabellen

| Tabel | Beschrijving |
|-------|-------------|
| `taken` | Projecten/hoofdtaken |
| `subtaken` | Taken binnen een project |
| `sub_subtaken` | Subtaken binnen een taak |
| `afgerond_log` | Historie van afgeronde taken |
| `meta` | Instellingen (volgend_nr, laatste_update) |
| `contexts` | Beschikbare contexten (name kolom), dynamisch beheerd vanuit de app |
| `laag_prioriteit` + `laag_items` | Oude structuur, niet meer in gebruik |

Alle drie hoofdtabellen hebben: `gedaan`, `gedaan_datum`, `inbox`, `verwijderd_op`, `deadline`, `tijdsinschatting`, `tijd_uitgevoerd`, `context`.

`contexts` tabel heeft een RLS SELECT-policy en INSERT-policy voor anon:
```sql
CREATE POLICY "allow anon read" ON contexts FOR SELECT TO anon USING (true);
CREATE POLICY "allow anon insert" ON contexts FOR INSERT TO anon WITH CHECK (true);
```

### 4. Supabase Edge Function — dagelijkse reminder

- **Functienaam:** `dagelijkse-reminder`
- **Deployed op:** project `fhkttfzqdjynzmtjbujv`
- Haalt alle open taken/subtaken/sub_subtaken op met deadline ≤ vandaag
- Stuurt HTML-e-mail via **Resend API** (`onboarding@resend.dev` → `raimon@rhlconsultancy.nl`)
- `verify_jwt: false` (aangeroepen door pg_cron, geen JWT beschikbaar)
- **Cron:** `0 7 * * *` (7:00 UTC = 8:00 CET) via pg_cron + pg_net:
```sql
SELECT cron.schedule('dagelijkse-reminder', '0 7 * * *',
  $$SELECT net.http_post(
    url := 'https://fhkttfzqdjynzmtjbujv.supabase.co/functions/v1/dagelijkse-reminder',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer <service_role_key>"}'::jsonb,
    body := '{}'::jsonb
  )$$
);
```

### 5. Claude MCP koppeling

- Supabase MCP server geconfigureerd in Claude Desktop
- Config: `~/Library/Application Support/Claude/claude_desktop_config.json`
- PAT: `sbp_426ca190d40f5a43ce79b5d6c3ed624599d092e1`
- **Let op:** de MCP werkt via `mcp__a7e63fc8-f838-4adc-a37a-edeb0796093c__execute_sql` met `project_id` parameter
- Claude Chat kan direct taken lezen, aanmaken, afvinken en verwijderen
- **TODO voor gebruiker:** Project-instructie in Claude Chat aanpassen zodat `inbox=true` automatisch wordt meegezet bij nieuwe taken

### 6. GitHub Pages

- URL: https://rhlos.github.io/rhl-taakmanager/
- Deployt vanaf `main` branch
- Na push: ~1 minuut wachten, dan in privévenster openen (Cmd+Shift+N)

---

## Alle werkende features

### Tabel
- **Kolommen:** ✓, P(ster), W/P, Project, Taak, Subtaak, Deadline, Context, +/🗑
- ~~Geschat en Werkelijk~~ → **verwijderd** in sessie april 2026
- **Drie niveaus:** Projecten → Taken → Subtaken
- **Hiërarchische nummering:** Project = 1, Taak = 1.1, Subtaak = 1.1.1 (berekend bij render, niet in DB)
- In/uitklappen per project en per taak
- Alles inklappen / uitklappen knoppen in toolbar
- **Sticky kolomtitels** — scrollen laat titels niet verdwijnen (z-index fix + `.th-filter` niet meer `position: relative`)

### Bewerkbaar
- Tekstvelden: klik om te bewerken, slaat direct op naar Supabase
- Deadline: date picker
- Context: multi-select, opties dynamisch geladen uit `contexts` tabel in Supabase
- **Nieuwe context aanmaken** vanuit de context-dropdown zelf (`+ Nieuwe context` knop onderaan popup)
- Prio ster: klik om te togglen
- Checkbox: klik om af te vinken (met undo toast, 5 sec)

### Sidebar-weergaven
- **Alle taken** — volledige tabel, 3 niveaus
- **Inbox** — individuele rijen met ↗ knop per rij (taak als verwerkt markeren) + "Alles verwerken" knop
- **Vandaag & Verlopen** — taken met deadline vandaag of eerder (individuele rijen)
- **Prioriteit** — taken met prio-ster (individuele rijen)
- **Voltooid** — klik op ✓ om taak terug te zetten naar actief
- **Projecten** (dynamisch, inklapbaar, met tellingen per project — tellen taken + subtaken + sub-subtaken)
- **Prullenmand** (soft-delete, herstel, auto-cleanup na 7 dagen)
- **📊 Analyse** (eigen panel, vervangt tabelweergave)
- **Sidebar-badges** tellen taken + subtaken (niet alleen projecten)
- **Klikken op project in sidebar** → main view navigeert naar dat project én klapt automatisch alles uit

### Toolbar
- WERK (blauw) / PRIVÉ (oranje) filterknoppen — actief = gemarkeerd, klik nogmaals = reset
- + Nieuwe taak (groen)
- "Alles verwerken" knop (alleen zichtbaar in Inbox-weergave)
- Inklappen / Uitklappen knoppen

### Filters en sortering
- Kolom-header filters voor: P, W/P, Project, Taak, Deadline, Context
- Context-filter filtert op subtaakniveau (niet alleen op projectniveau) via `filterSubsByActiveFilters()`
- Sortering werkt ook op Context
- Filter wissen werkt correct

### Soft delete
- 🗑 knop altijd zichtbaar (niet alleen bij hover)
- Taak verdwijnt naar Prullenmand (verwijderd_op timestamp)
- Herstelbaar vanuit Prullenmand
- Auto-cleanup na 7 dagen

### Statistiek-tiles (boven tabel)
- **Tile 1:** Aantal projecten
- **Tile 2:** Aantal open taken
- **Tile 3:** Aantal prioriteit-taken (klikbaar → navigeert naar Prioriteit-weergave)

### Analyse dashboard
- 4 KPI-kaarten: afgerond deze week, open taken, op tijd %, gem. doorlooptijd
- 6 grafieken via Chart.js: productiviteit, werk/privé, geschat vs werkelijk, deadline compliance, context analyse, project voortgang (CSS)
- Filters: Week/Maand + Alles/Werk/Privé
- Grafieken staan in `analyse.js`, styling in `analyse.css`

### Dagelijkse e-mailreminder
- Elke dag 8:00 CET een e-mail met taken/subtaken waarvan deadline ≤ vandaag
- Via Supabase Edge Function + Resend API
- Getriggerd door pg_cron (7:00 UTC)

### Overig
- Zoekfunctie, kolom-header filters en sortering
- Modale dialogen, undo toast, loading states
- XSS-bescherming, performance-indexes (Map via `buildIndexes()`)
- **Inbox-logica:** taken aangemaakt in Claude Chat krijgen automatisch `inbox=true` (instructie in Claude Chat project — TODO: nog aanpassen door gebruiker)

---

## Thema — Apple Dark (actief)

Geïmplementeerd op 1 april 2026. `style.css` gebruikt altijd de donkere Apple kleuren — geen lichtmodus meer.

| Variabele | Waarde | Omschrijving |
|-----------|--------|-------------|
| `--bg` | `#000000` | Hoofdachtergrond (zwart) |
| `--sidebar-bg` | `#1c1c1e` | Sidebar |
| `--card` | `#1c1c1e` | Kaarten / tabel |
| `--text` | `#f5f5f7` | Primaire tekst |
| `--text-2` | `#98989d` | Secundaire tekst |
| `--text-3` | `#636366` | Dimme tekst / nummers |
| `--sep` | `#3a3a3c` | Scheidingslijnen |
| `--accent` | `#0a84ff` | Blauw accent |
| `--red` | `#ff453a` | Rood |
| `--orange` | `#ff9f0a` | Oranje (Privé) |
| `--green` | `#30d158` | Groen (afvinken / nieuwe taak) |

### Alternatieve thema's (nog niet gebouwd, kleuren bewaard)

**Optie 2 — Midnight Blue**
```
--bg: #0d1b2a  --sidebar-bg: #0a1628  --card: #1b2838
--sep: #2a3f5a  --accent: #4fc3f7  --text: #e8f4ff
--text-2: #a8c8f0  --text-3: #4a6fa5
```
Sidebar active: `rgba(79,195,247,.15)` / Badge: `rgba(79,195,247,.2)`

**Optie 3 — Indigo Dark**
```
--bg: #1a1f36  --sidebar-bg: #141929  --card: #252b44
--sep: #353d5e  --accent: #5b8dee  --text: #e8eaf6
--text-2: #b0badd  --text-3: #5b6a9a
```
Sidebar active: `rgba(91,141,238,.2)` / Badge: `rgba(91,141,238,.2)`

Preview-bestand (lokaal, niet in repo): `preview-thema/index.html`

---

## Nog te doen

| # | Item | Prioriteit |
|---|------|-----------|
| 1 | ~~Feature branch mergen naar `main`~~ ✅ | ~~Hoog~~ |
| 2 | ~~Notities/beschrijving per taak~~ ✅ (kolom later verwijderd) | ~~Gemiddeld~~ |
| 3 | ~~Apple Dark thema~~ ✅ | ~~Gemiddeld~~ |
| 4 | ~~Kolommen Geschat & Werkelijk verwijderd~~ ✅ | ~~Gemiddeld~~ |
| 5 | ~~Dagelijkse e-mailreminder (Resend + Edge Function)~~ ✅ | ~~Hoog~~ |
| 6 | ~~Dynamische context-opties uit Supabase~~ ✅ | ~~Gemiddeld~~ |
| 7 | ~~Nieuwe context aanmaken vanuit app~~ ✅ | ~~Gemiddeld~~ |
| 8 | ~~Context filter op subtaakniveau~~ ✅ | ~~Gemiddeld~~ |
| 9 | Mobiele PWA bouwen (zie plan hieronder) | Hoog — wacht op stabiele desktop |
| 10 | ~~Claude Chat inbox-instructie aanpassen~~ ✅ (door gebruiker gedaan) | ~~Gemiddeld~~ |
| 11 | Authenticatie | Later (niet nodig bij 1 gebruiker) |
| 12 | ~~Beheer-sectie~~ ✅ (knop verwijderd, niet nodig) | ~~Laag~~ |
| 13 | Offline support mobiele app (Service Worker) | Later (pas bij PWA) |

---

## Mobiele app — plan (nog niet gebouwd)

**Wachten tot desktop stabiel is** voordat we dit bouwen.

### Techniek
- PWA (Progressive Web App) — geen App Store, geen Swift, geen Xcode nodig
- Aparte pagina: `mobile.html` in dezelfde repo → `https://rhlos.github.io/rhl-taakmanager/mobile.html`
- Zelfde Supabase backend → data altijd gesynchroniseerd met desktop
- Deelt `api.js` met desktop
- Eigen CSS en render logica (niet automatisch gesynchroniseerd met desktop)
- Installatie: Safari op iPhone → "Zet op beginscherm"

### Geïnspireerd op Microsoft To Do (GTD-stijl)

### Schermopbouw

**Home (Inbox)**
- Lijst van inbox-taken
- Swipe links → verwijderen
- Tik op taak → Taak detail scherm
- `+` knop onderaan → nieuwe taak aanmaken (automatisch inbox=true)

**Menu (slide-in van links)**
- Inbox / Vandaag & Verlopen / Prioriteit / Voltooid
- Projectenlijst (ingeklapt, uitklapbaar)
- Tik op project → Project detail scherm

**Project detail**
- Lijst van taken binnen het project
- Taken uitklapbaar → subtaken zichtbaar
- Tik op taak → Taak detail scherm
- `+` knop → nieuwe taak aan dit project toevoegen

**Taak detail**
- Naam (bewerkbaar)
- Deadline, Context — allemaal bewerkbaar
- Subtaken zichtbaar en bewerkbaar
- Afvinken (→ gaat naar Voltooid)
- Verwijderen

### Design
- Zelfde stijl als desktop: Apple Dark thema
- Dark mode volgt systeeminstelling

### Nog niet besloten
- Offline support (Service Worker + IndexedDB) — later toe te voegen

---

## SQL scripts die AL uitgevoerd zijn (NIET opnieuw uitvoeren)

`schema.sql`, `import.sql`, `sub_subtaken.sql`, `update_v2.sql`, `hernummer.sql`, `inbox.sql`, handmatige `ALTER TABLE ... ADD COLUMN verwijderd_op timestamptz`, pg_cron/pg_net extensions, RLS policies op `contexts` tabel, cron job `dagelijkse-reminder`

---

## Bestanden in de repo

```
├── index.html
├── style.css                           # Apple Dark thema (altijd donker)
├── api.js                              # Supabase config + fetch helpers
├── ui.js                               # Modals, toast, datum
├── render.js                           # Tabel render functies
├── app.js                              # State, logica, init
├── analyse.js                          # Analyse dashboard
├── analyse.css                         # Analyse dashboard styling
├── manifest.json                       # PWA
├── taken.json                          # Originele dataset (referentie)
├── OVERDRACHT.md                       # Dit document
├── README.md                           # MCP setup instructies
├── preview-thema/
│   └── index.html                      # Lokale thema-preview (3 opties)
├── preview-thema.html                  # Bronbestand thema-preview
└── supabase/
    ├── schema.sql
    ├── import.sql
    ├── sub_subtaken.sql
    ├── update_v2.sql
    ├── hernummer.sql
    └── inbox.sql
```

---

## Hoe de code werkt — referentie

> Deze sectie is documentatie voor de AI-assistent, geen openstaande actiepunten.

- **`buildIndexes()`** wordt aangeroepen in zowel `init()` als `reloadData()` — bewust en noodzakelijk (bug die één keer voorkwam: alleen in reloadData stond het, waardoor eerste load leeg bleef)
- **`catFilter`** is een state-variabele in `app.js` voor WERK/PRIVÉ filtering, wordt toegepast in `getViewProjects()`
- **`allContexten`** is een globale array in `app.js`, geladen vanuit de `contexts` tabel bij init/reloadData
- **`filterSubsByActiveFilters(items)`** in `app.js` — filtert subtaken op context. Wordt aangeroepen in `render.js` voor zowel subtaken als sub-subtaken binnen `renderProject()`
- **Sticky header:** `thead th` heeft `z-index: 2`. `.th-filter` staat op `position: sticky; top: 0; z-index: 2;` — NIET `position: relative`, anders werkt sticky niet
- **Sidebar-badges:** `countItemsWithDeadline(mode)` en `countPrio()` tellen taken + subtaken. Project-badge telt ook sub-subtaken mee
- **Auto-expand bij project-klik:** sidebar click handler roept `renderAll()` aan + zet alle `.chev` op `.open` + verwijdert `.collapsed` van alle rows
- **Toolbar-knoppen** worden per view getoond/verborgen in `renderAll()` via `style.display`
- **Supabase MCP** in Claude Code: gebruik `mcp__a7e63fc8-f838-4adc-a37a-edeb0796093c__execute_sql` met `project_id: "fhkttfzqdjynzmtjbujv"`
- **Soft delete:** alle drie tabellen hebben `verwijderd_op timestamptz`. Queries filteren altijd op `verwijderd_op IS NULL`
- **Edge Function `dagelijkse-reminder`**: `verify_jwt: false` — wordt aangeroepen door pg_cron zonder JWT. Resend API key staat in de functie zelf (server-side, niet in de frontend)
