# rhl-taakmanager — Projectlog

Chronologisch logboek van wat wanneer gebeurd is. Append-only — voeg nieuwe entries onderaan toe; oude entries niet wijzigen.

## 2026-03-29 — Initial commit

1. Eerste werkende versie: vanilla HTML/CSS/JS, Supabase backend, drie tabellen (`taken`, `subtaken`, `sub_subtaken`), desktop-tabel met 10 kolommen.
2. README.md gepubliceerd op GitHub met MCP-setup voor Claude Desktop.
3. Originele dataset in `taken.json` (referentie).

## 2026-04-01 — Apple Dark thema

1. `style.css` omgezet naar Apple Dark variabelen (`--bg #000000`, `--text #f5f5f7`, `--accent #0a84ff` etc.). Geen lichtmodus meer als optie.
2. PWA `manifest.json` theme-kleuren afgestemd op Apple Dark.

## 2026-04-13 — Mobiele PWA v1

1. Aparte `mobile.html` + `mobile.css` + `mobile.js` aangemaakt; auto-redirect in `index.html` voor viewports ≤768px.
2. Inbox-scherm als opening: lijst inbox-taken, afvinken, soft-delete met undo-toast (5 sec), `+` FAB voor nieuwe taak.
3. Volledige sidebar als full-screen menu met swipe-gestures (vanaf linkerrand, dx>80 om te openen, dx<-80 om te sluiten).

## 2026-04-23 — Analyse-dashboard

1. `analyse.js` + `analyse.css` toegevoegd: 4 KPI-kaarten (afgerond deze week, open taken, op tijd %, gem. doorlooptijd) + 6 Chart.js-grafieken (productiviteit, werk/privé, geschat vs werkelijk, deadline-compliance, context, project-voortgang).
2. Filters: Week/Maand + Alles/Werk/Privé.
3. Layout-fix waar paneel onder sidebar viel; Geschat-grafiek verwijderd na evaluatie.

## 2026-04-24 — Mobiele PWA v3 + opschoning

1. **Opschoning vóór mobiele bouw:** dode functies uit `render.js` (`starHtml`, `deadlineHtml`, `contextHtml`); dode CSS uit `style.css`; ontbrekende CSS-vars `--border` + `--bg2` toegevoegd; helpers `normalizeContext()` (in `ui.js`) en `refreshUI()` (in `app.js`); `setCascadeVerwijderd()` geëxtraheerd zodat cascade-delete-undo logica op één plek staat.
2. **Mobiele PWA v3:** taak-detailscherm met naam (textarea, opslaan op blur), deadline (date-picker), context (multi-select modal), prio-ster (toggle), kinderen (subtaken/sub-subtaken inline). `+` knop in project-view en detail-scherm voor nieuwe sub. Undo-toast (5 sec) bij soft-delete via gedeelde `showToast()` in `ui.js`. Swipe-van-linkerrand in detail = terug i.p.v. menu openen.
3. **Filter UX:** "Alles / Geen" snelle toggle bovenaan elke filter-popup.
4. **Prullenmand UX:** "Alles verwijderen"-knop in prullenmand-weergave (hard delete met bevestiging) — vervangt de groene "+ Nieuwe taak" knop daar.

## 2026-04-25 — Documenten + repo opschoning

1. Apple Dark vastgelegd als definitief thema; `preview-thema.html` + `preview-thema/` verwijderd, alternatieve thema-kleuren uit OVERDRACHT.md gehaald.
2. Obsolete docs verwijderd: `PLAN_ANALYSE_DASHBOARD.md` (dashboard is gebouwd), `Taakanalyse_Briefing_RHL_v2.md` (oude chat-widget), `ClaudeCode_Briefing_Taakmanager.md` (initial build-briefing — superseded door OVERDRACHT.md).
3. `code/rhl-taakmanager/.claude/` opgeruimd; permissies (Supabase + Preview MCP) gemerged naar `~/ClaudeCodeZandbak/.claude/settings.local.json`. Project valt voortaan onder de gedeelde "ClaudeCodeZandbak"-context.
4. `CLAUDE.md` voor dit project ingevuld met verwijzing naar OVERDRACHT.md voor details.

## 2026-04-27 — Spelfout-fix + zoekfunctie

1. **Edge Function `dagelijkse-reminder` v2:** typo `taaken` → `taken` in mailbody en subject (concat-bug `taak${...?'en':''}` → `${... ? 'taak' : 'taken'}`). Mail van 28 april zou correct moeten zijn.
2. **Zoekfunctie omgebouwd** van inline-tabelfilter naar aparte view `currentView='zoekresultaten'` met `renderZoekresultaten()` in `render.js`. Filtert op naam over alle 3 niveaus, exclusief verwijderd + gedaan. Auto-clear bij navigatie via `renderAll()`.
3. `OVERDRACHT.md` bijgewerkt naar de huidige werkstand.

## 2026-04-28 — Documentstructuur compleet

1. `BRIEFING.md` en `PROJECTLOG.md` toegevoegd conform documentstructuur uit `_shared/templates/project-code/` (verbeterplan-punt #8).
2. BRIEFING gedestilleerd uit `OVERDRACHT.md` en `README.md` (stabiele kern: doel, architectuur, conventies, werkafspraken). OVERDRACHT.md blijft het levende handover-document met actuele werklijst en code-referentie.
3. Geen functionele wijzigingen aan de app.

## 2026-04-29 — Bezig-toggle + Kanban-view + view-switcher

Grote feature-sessie: nieuwe `bezig` status, view-switcher bovenaan, en Kanban-view met drag-and-drop. Mail-typo (28 april) bevestigd correct. Stap 4 (Calendar) blijft staan als placeholder. Aan het eind besloten dat de mobiele versie in de volgende sessie verwijderd wordt — onderhoud kost te veel moeite voor wat het oplevert.

Wijzigingen:
1. **DB-migratie:** kolom `bezig boolean default false` op `subtaken` + `sub_subtaken` (eerst per ongeluk ook op `taken` gezet, daarna gedropt — projecten zijn containers, geen werk-units).
2. **Lijst-weergave kolommen:** `P` hernoemd naar `PRIO`, nieuwe kolom `BEZIG` toegevoegd. `cp`-cellen gesplitst in `cp` (alleen prio-ster) + `cbz` (bezig-rondje). 13 rij-renders aangepast, alle colspans +1, kolombreedtes herzien.
3. **Bezig-toggle:** helper `bezigHtmlData()` in `render.js` + click-handler `attachBezig()` in `app.js`. Klik togglet `bezig` in de DB en werkt lokale state direct bij zodat Kanban consistent blijft.
4. **View-switcher:** drie knoppen 📋 Lijst · ▦ Kanban · 📅 Calendar in de topbar. State `displayMode` in `app.js`. Sidebar/tile/project-clicks resetten automatisch naar Lijst-modus. Toolbar verbergt in Kanban/Calendar.
5. **Kanban-view** in nieuw bestand `kanban.js` (~150 regels): 4 kolommen Inbox · Bezig · Werk · Privé. Alleen subtaken + sub-subtaken. Classify-volgorde: `inbox > bezig > parent.categorie`. Sortering: prio eerst, dan deadline. Kaarten tonen project-pad, titel, prio-pill, deadline-pill (oranje of rood), context-pills.
6. **Drag-and-drop** native HTML5: drop op Inbox → `inbox=true,bezig=false`; op Bezig → `bezig=true,inbox=false`; op Werk/Privé → beide false (kaart komt in kolom matching parent.categorie).
7. **Calendar placeholder** in `index.html` ("komt in stap 4").
8. **Cache-busting `?v=1`** toegevoegd aan `kanban.js` (rest van desktop scripts heeft nog niets).
9. **OVERDRACHT.md** + **CLAUDE.md** bijgewerkt: focus volgende sessie = mobiel weg; mobiele bestanden gemarkeerd voor verwijdering in file-tree.

Open:
1. **Stap 4 Calendar-view** nog te bouwen — placeholder staat er. Vragen: klik op dag = wat? Klik op event = modal of doorklikken naar Lijst?
2. **Kanban-view nog niet user-getest** — sessie afgesloten voor verificatie. Eerstvolgende actie volgende sessie kan zijn: korte rondje door Kanban om te confirmeren dat alles werkt zoals bedoeld.
3. **Cache-busting** ontbreekt op `index.html`-script-tags voor `style.css`, `analyse.css`, `ui.js`, `api.js`, `render.js`, `app.js`, `analyse.js`. Mobile heeft `?v=N`, desktop niet — daarom hard refresh nodig na elke deploy.
4. **Volgende sessie:** mobiele versie verwijderen (`mobile.html` + `mobile.css` + `mobile.js`, auto-redirect in `index.html`, mobile-refs in `manifest.json`, secties in OVERDRACHT.md).
