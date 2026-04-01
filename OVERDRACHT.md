# RHL Taakmanager — Overdrachtsdocument

**Datum:** 29 maart 2026
**Project:** rhl-taakmanager
**Repo:** RHLOS/rhl-taakmanager
**Branch:** claude/rewrite-webapp-b8wow

---

## Sessie starten

Zeg bij het begin van een nieuwe sessie:
> "Lees OVERDRACHT.md en ga verder waar we gebleven zijn."

Lees dan dit document, check de git log voor recente commits, en stel gerichte vragen voordat je iets bouwt.

---

## Wat is er gebouwd

### 1. Webapp

Apple-native taakmanager als platte tabel. Gesplitst in bestanden:

| Bestand | Inhoud | Regels |
|---------|--------|--------|
| `index.html` | HTML structuur | ~210 |
| `style.css` | Alle CSS | ~472 |
| `api.js` | Supabase config + API helpers | ~51 |
| `ui.js` | Modals, toast, saving indicator, datum helpers | ~134 |
| `render.js` | Render functies (tabel, inbox, voltooid, prullenmand) | ~268 |
| `app.js` | State, filters, attach-functies, init | ~961 |
| `analyse.js` | Analyse dashboard logica + grafieken | ~330 |
| `analyse.css` | Analyse dashboard styling | ~150 |

**Laadvolgorde scripts:** ui.js → api.js → render.js → app.js → analyse.js

### Wijzigingen deze sessie (1 april 2026)
- Notitie kolom toegevoegd en later weer verwijderd
- Hiërarchische nummering (1 / 1.1 / 1.1.2) in `#` kolom
- Voltooid-weergave: klik op ✓ om taak terug te zetten naar actief
- Soft delete was al correct geïmplementeerd (geen wijziging nodig)
- Vandaag & Verlopen: toont ook verlopen deadlines (dl <= 0)
- Prioriteit en Vandaag tonen nu individuele regels (zoals Inbox)
- Prio-tile is klikbaar → navigeert naar Prioriteit-weergave
- Statistiek-tiles aangepast: Aantal projecten / Aantal open taken / Aantal prioriteit taken
- Inbox: ↗ knop per rij om taak als verwerkt te markeren (inbox=false)
- Inbox: "Alles verwerken" knop
- Toolbar: WERK (blauw) en PRIVÉ (oranje) filterknoppen
- `+` knop en "+ Nieuwe taak" knop zijn groen
- "+ Nieuwe taak" verplaatst naar toolbar (was rechtsbovenin)
- 🗑 knop altijd zichtbaar (was alleen bij hover)

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
| `laag_prioriteit` + `laag_items` | Oude structuur, niet meer in gebruik |

Alle drie hoofdtabellen hebben: `gedaan`, `gedaan_datum`, `inbox`, `verwijderd_op`, `deadline`, `tijdsinschatting`, `tijd_uitgevoerd`, `context`.

### 4. Claude MCP koppeling

- Supabase MCP server geconfigureerd in Claude Desktop
- Config: `~/Library/Application Support/Claude/claude_desktop_config.json`
- PAT: `sbp_426ca190d40f5a43ce79b5d6c3ed624599d092e1`
- Claude Chat kan direct taken lezen, aanmaken, afvinken en verwijderen
- Project-instructie in Claude Chat zorgt dat `inbox=true` automatisch wordt meegezet

### 5. GitHub Pages

- URL: `https://rhlos.github.io/rhl-taakmanager/`
- Deployt vanaf `main` branch — feature branch moet nog gemerged worden

---

## Webapp features (alles werkend)

### Tabel
- 10 kolommen: ✓, P(ster), W/P, Project, Taak, Subtaak, Deadline, Geschat, Werkelijk, Context, +/🗑
- Drie niveaus: Projecten → Taken → Subtaken
- In/uitklappen per project en per taak
- Alles inklappen / uitklappen knoppen

### Bewerkbaar
- Tekstvelden: klik om te bewerken, opslaat direct naar Supabase
- Deadline: date picker
- Geschat: dropdown (<15 min t/m <120 min)
- Werkelijk: number input (minuten)
- Context: multi-select (@Kantoor, @Thuis, @Onderweg, @Computer, @Telefoon, @Online)
- Prio ster: klik om te togglen
- Checkbox: klik om af te vinken (met undo toast)

### Sidebar
- Alle taken, Inbox, Vandaag, Deze week, Prioriteit, Voltooid
- Projecten (dynamisch, inklapbaar, met tellingen)
- Prullenmand (soft-delete, herstel, auto-cleanup na 7 dagen)
- 📊 Analyse (eigen panel, vervangt tabelweergave)

### Analyse dashboard
- 4 KPI-kaarten: afgerond deze week, open taken, op tijd %, gem. doorlooptijd
- 6 grafieken via Chart.js: productiviteit, werk/privé, geschat vs werkelijk, deadline compliance, context analyse, project voortgang (CSS)
- Filters: Week/Maand + Alles/Werk/Privé
- Grafieken staan in `analyse.js`, styling in `analyse.css`

### Overig
- Zoekfunctie, kolom-header filters en sortering
- Modale dialogen, undo toast, loading states, dark mode
- XSS-bescherming, performance-indexes (Map)

---

## Token-verbruik laag houden — KRITIEK

De gebruiker heeft een beperkt maandbudget. Hoog verbruik stopt de doorontwikkeling. Dit zijn de regels:

1. **Model:** stel altijd `/model claude-sonnet-4-6` in bij sessiestart — Opus kost 5× meer
2. **Nooit hele bestanden lezen** — gebruik `grep` om de juiste sectie te vinden, dan `offset`+`limit` om alleen die regels te lezen
3. **Nieuwe features in aparte bestanden** — zodat bestaande grote bestanden niet aangeraakt hoeven te worden
4. **Gebruik `/compact`** als een sessie lang wordt (comprimeert context)
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
| `--green` | `#30d158` | Groen (afvinken) |

### Alternatieve thema's (nog niet gebouwd)

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

Preview: `preview-thema/index.html` (lokaal, niet in repo)

---

## Nog te doen

| # | Item | Prioriteit |
|---|------|-----------|
| 1 | ~~Feature branch mergen naar `main`~~ ✅ | ~~Hoog~~ |
| 2 | ~~Notities/beschrijving per taak~~ ✅ (kolom later verwijderd) | ~~Gemiddeld~~ |
| 3 | Mobiele PWA bouwen (zie plan hieronder) | Hoog — wacht op stabiele desktop |
| 4 | Authenticatie | Laag (1 gebruiker) |
| 5 | Beheer-sectie (sidebar knop bestaat al) | Laag |
| 6 | Offline support mobiele app (Service Worker) | Later |

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
- Deadline, Geschat, Context, Notitie — allemaal bewerkbaar
- Subtaken zichtbaar en bewerkbaar
- Afvinken (→ gaat naar Voltooid)
- Verwijderen

### Design
- Zelfde stijl als desktop: wit, Apple-native, clean
- Dark mode volgt systeeminstelling (zelfde als desktop)

### Nog niet besloten
- Offline support (Service Worker + IndexedDB) — later toe te voegen
- Relatie desktop ↔ mobiel: wijzigingen gaan **niet automatisch** mee, moeten handmatig worden doorgevoerd

---

## SQL scripts die AL uitgevoerd zijn (NIET opnieuw uitvoeren)

`schema.sql`, `import.sql`, `sub_subtaken.sql`, `update_v2.sql`, `hernummer.sql`, `inbox.sql`, handmatige `ALTER TABLE ... ADD COLUMN verwijderd_op timestamptz`

---

## Bestanden in de repo

```
├── index.html
├── style.css
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
├── PLAN_ANALYSE_DASHBOARD.md           # Afgerond plan (mag weg)
├── ClaudeCode_Briefing_Taakmanager.md
├── Taakanalyse_Briefing_RHL_v2.md
└── supabase/
    ├── schema.sql
    ├── import.sql
    ├── sub_subtaken.sql
    ├── update_v2.sql
    ├── hernummer.sql
    └── inbox.sql
```
