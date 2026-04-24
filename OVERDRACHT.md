# RHL Taakmanager — Overdrachtsdocument

**Laatste update:** 24 april 2026
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
| `app.js` | State, filters, attach-functies, init | ~1100 |
| `analyse.js` | Analyse dashboard logica + grafieken | ~400 |
| `analyse.css` | Analyse dashboard styling | ~160 |
| `mobile.html` | Mobiele PWA (apart scherm, auto-redirect) | ~147 |
| `mobile.css` | Mobiele styling (Apple Dark) | ~588 |
| `mobile.js` | Mobiele logica: views, render, detail, swipe | ~616 |

**Laadvolgorde scripts (desktop):** ui.js → api.js → render.js → app.js → analyse.js
**Laadvolgorde scripts (mobile):** ui.js → api.js → mobile.js
**Auto-redirect:** `index.html` stuurt viewports ≤768px door naar `mobile.html`

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
- **"Alles / Geen" snelle toggle** bovenaan elke filter-popup — één klik om alle vinkjes te wissen of juist aan te zetten

### Soft delete
- 🗑 knop altijd zichtbaar (niet alleen bij hover)
- Taak verdwijnt naar Prullenmand (verwijderd_op timestamp)
- Herstelbaar vanuit Prullenmand
- Auto-cleanup na 7 dagen
- **In prullenmand-weergave:** de groene "+ Nieuwe taak" knop verandert in een rode "🗑 Alles verwijderen" knop → hard delete alle soft-deleted items (met bevestigingsdialoog)

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
| 9 | ~~Mobiele PWA — Inbox + menu + multi-view + taak-detail + + knoppen + undo-toast~~ ✅ | ~~Hoog~~ |
| 10 | ~~Claude Chat inbox-instructie aanpassen~~ ✅ (door gebruiker gedaan) | ~~Gemiddeld~~ |
| 11 | Authenticatie | Later (niet nodig bij 1 gebruiker) |
| 12 | ~~Beheer-sectie~~ ✅ (knop verwijderd, niet nodig) | ~~Laag~~ |
| 13 | Offline support mobiele app (Service Worker) | Later (pas bij PWA) |

---

## Mobiele app — stand van zaken (april 2026)

### Techniek
- PWA (Progressive Web App) — geen App Store, geen Swift, geen Xcode nodig
- Aparte pagina: `mobile.html` → `https://rhlos.github.io/rhl-taakmanager/mobile.html`
- Zelfde Supabase backend → data altijd gesynchroniseerd met desktop
- Deelt `api.js` en `ui.js` met desktop (niet gedeeld via shared.js — gewoon hergebruik van dezelfde files)
- `mobile.js` en `mobile.css` zijn eigen bestanden (niet automatisch gesync met desktop)
- Installatie: Safari op iPhone → "Zet op beginscherm"
- Cache-busting: `?v=4` achter alle mobile asset-refs in `mobile.html`
- Auto-redirect in `index.html` stuurt viewports ≤768px door naar `mobile.html`

### ✅ Gebouwd (v1 + v2 + v3)

**Inbox scherm (opening)**
- Lijst van inbox-taken (filtert op `inbox=true && !verwijderd_op && !gedaan`)
- Afvinken → toggle gedaan + gedaan_datum
- 🗑 knop → soft-delete naar prullenmand + undo-toast 5 sec
- `+` FAB → modal met tekstveld → nieuwe taak (auto `inbox=true, categorie='Werk', prioriteit='normaal'`)
- Sync met desktop werkt (nieuwe taak verschijnt direct in desktop inbox)

**Menu / sidebar (full-screen)**
- Toegang via ☰ knop of swipe vanaf linkerrand (clientX<30, dx>80)
- Sluiten via ✕ of swipe naar links (dx<-80)
- Items: Inbox, Vandaag & Verlopen, Prioriteit, Voltooid, Prullenmand
- Projectenlijst (dynamisch uit allTaken), elk met telling open subtaken + sub-subtaken
- Actieve view gehighlight in blauw
- Counts worden live bijgewerkt

**Multi-view rendering**
- State: `currentView` = `'inbox' | 'vandaag' | 'prioriteit' | 'voltooid' | 'prullenmand' | 'project:<id>'`
- `getViewItems()` filtert `allFlat()` per view
- Voor `project:<id>` toont subtaken + sub-subtaken van dat project (platte lijst — uitklapbare hiërarchie nog pending)
- FAB in project-view → modal "Nieuwe taak" (subtaak onder dit project)

**Taak-detailscherm**
- Tik op een taak-rij (niet op ✓/🗑 knop) → apart scherm
- Velden: naam (textarea, opslaan op blur), deadline (date-picker), context (multi-select modal), prio-ster (toggle)
- Subtaken-sectie met `+` knop: bij project → nieuwe subtaak, bij taak → nieuwe sub-subtaak. Kinderen afvinkbaar, soft-delete met undo.
- 🗑 Verwijderen (onderaan) → confirm() → soft-delete met undo-toast
- ← Terug-knop of swipe-van-linkerrand → terug naar vorige view
- Context modal: lijst van bestaande contexten uit `allContexten`, multi-select met checkmarks, Opslaan patcht `context: array | null`

**Undo-toast**
- Gebruikt `showToast(message, undoFn)` uit `ui.js` (gedeeld met desktop)
- 5 sec zichtbaar, dan fade-out via `.toast.hiding` class
- Knop "Ongedaan maken" zet `verwijderd_op = null` en reloadt data

### Eventueel later

- Project-detailscherm v2 met uitklapbare hiërarchie (taken → sub-subtaken inline)
- Zoekveld bovenaan
- Offline support (Service Worker + IndexedDB) — expliciet later, nog niet besloten

### iPhone testen (geparkeerde vraag)
Gebruiker test via GitHub Pages in Safari op iPhone. Instructie: https://rhlos.github.io/rhl-taakmanager/ automatisch redirect → mobile.html. "Zet op beginscherm" voor PWA-installatie. Volgende sessie: bespreken of we een lokale dev-server willen voor snellere feedback-loop.

---

## SQL scripts die AL uitgevoerd zijn (NIET opnieuw uitvoeren)

`schema.sql`, `import.sql`, `sub_subtaken.sql`, `update_v2.sql`, `hernummer.sql`, `inbox.sql`, handmatige `ALTER TABLE ... ADD COLUMN verwijderd_op timestamptz`, pg_cron/pg_net extensions, RLS policies op `contexts` tabel, cron job `dagelijkse-reminder`

---

## Bestanden in de repo

```
├── index.html                          # Auto-redirect naar mobile.html op ≤768px
├── style.css                           # Apple Dark thema (altijd donker)
├── api.js                              # Supabase config + fetch helpers (gedeeld met mobile)
├── ui.js                               # Modals, toast, datum (gedeeld met mobile)
├── render.js                           # Desktop tabel render functies
├── app.js                              # Desktop state, logica, init
├── analyse.js                          # Analyse dashboard
├── analyse.css                         # Analyse dashboard styling
├── mobile.html                         # Mobiele PWA
├── mobile.css                          # Mobiele styling (Apple Dark)
├── mobile.js                           # Mobiele logica + swipe
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

## Sessie april 2026 — wat is er gedaan

1. **Opschoning** (vóór mobiele bouw):
   - Dode functies verwijderd uit `render.js` (`starHtml`, `deadlineHtml`, `contextHtml`)
   - Dode CSS verwijderd uit `style.css`
   - Ontbrekende CSS-variabelen toegevoegd (`--border`, `--bg2`)
   - `normalizeContext()` helper in `ui.js`, `refreshUI()` helper in `app.js`
   - `manifest.json` gefixt (theme-kleuren Apple Dark)
   - `setCascadeVerwijderd()` geëxtraheerd — cascade delete+undo logica op één plek
2. **Mobiele PWA v1:** Inbox, menu, multi-view, swipe gestures, auto-redirect
3. **Filter UX:** "Alles / Geen" snelle toggle in filter-popups
4. **Prullenmand UX:** "Alles verwijderen" knop (hard delete met bevestiging)
5. **Analyse-layout:** fix waar paneel onder sidebar viel, Geschat-grafiek verwijderd
6. **Mobiele PWA v3 (24 april):**
   - Taak-detailscherm (naam, deadline, context-modal, prio-ster, kinderen, verwijderen)
   - `+` knop in project-view en detail-scherm → nieuwe subtaak / sub-subtaak
   - Undo-toast (5 sec "Ongedaan maken") bij soft-delete, shared via `showToast()` in `ui.js`
   - Swipe-van-linkerrand in detail-scherm = terug (i.p.v. menu openen)

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
- **Mobiele app state:** `allTaken, allSubtaken, allSubsubtaken, allContexten, currentView, viewItems, detailItem, detailCtxSelected, addCtx` in `mobile.js`. Views via `getViewItems()` → `allFlat()` + filters
- **Mobiel detail-scherm:** `openDetail(id,table)` → `fillDetail()` zet alle velden; `wireRowInteractions(el)` hergebruikt voor zowel `#taskList` als `#detailChildList` (row-click = detail, button-click = actie); `addCtx = {mode, parentId}` bepaalt wat `saveNewTask()` aanmaakt (inbox/subtaak/subsubtaak)
- **Prio-veld per tabel** (verschillend): `taken.prioriteit === 'hoog'` (string), `subtaken.prio_ster` (bool), `sub_subtaken.prioriteit` (bool) → helpers `isPrio()` en `prioPatch()` in `mobile.js`
- **Context DB-shape:** array van strings (Postgres text[]) of `null`. `normalizeContext()` accepteert beide; patch gebruikt `context: array | null`
- **Mobiele swipe:** `touchstart` registreert `clientX, clientY`. `touchend` checkt `dy<60` voor horizontale beweging, dan `touchStartX<30 && dx>80` voor menu-open, of `dx<-80` voor menu-sluiten
- **Cache busting mobile:** alle script/css refs in `mobile.html` hebben `?v=2` query. Bump dit getal bij grote wijzigingen aan `mobile.js`/`mobile.css`
- **`.screen[hidden]` in mobile.css** is noodzakelijk omdat `.screen` `display: flex` heeft, wat het HTML `hidden` attribuut overschrijft
- **Hard delete volgorde** in prullenmand-leegmaken: eerst `sub_subtaken`, dan `subtaken`, dan `taken` (FK constraints)
- **btn-new dual-mode:** in `renderAll()` wordt `.btn-new` tekst en `.btn-danger` class per view gezet. De click-handler zelf vertakt op `currentView === 'prullenmand'`
