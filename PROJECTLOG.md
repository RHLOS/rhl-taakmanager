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

## 2026-05-03 — Calendar getest, modal verbeterd, kleurpreviews, e-mail uitgebreid

Drukke sessie: Calendar-view volledig getest en goedgekeurd. Daarna forse uitbreiding van de calendar-modal, twee kleurenpreviews gebouwd voor een nieuw stijlprofiel, toolbar-bug gefixed, en de dagelijkse e-mail uitgebreid met twee nieuwe secties.

Wijzigingen:
1. **Calendar-view getest:** alle vijf testpunten groen (maandgrid, rolling-week, dag-detail, afvink-modal, Werk/Privé-kleuren).
2. **Calendar modal uitgebreid:** deadline aanpasbaar via date-input + wis-knop; onderliggende subtaken/sub-subtaken zichtbaar bij project- en taakniveau; verwijderknop met bevestigingsstap (soft-delete naar prullenmand); knopkleuren: Afvinken=groen, Bewaren=blauw, Verwijderen=rood, Sluiten=grijs.
3. **Kleurpreviews:** twee nieuwe preview-bestanden aangemaakt (originelen onaangepast): `index-preview.html` + `style-preview.css` (donker warm taupe) en `index-preview-2.html` + `style-preview-2.css` (licht ivoor). Aanbeveling gegeven voor preview 2 (licht); gebruiker heeft nog geen keuze gemaakt.
4. **Toolbar-bug gefixed:** `toolbar.style.display=''` verwijderde de flex-layout na view-switch. Opgelost: `display:flex` in `style.css` gezet, JS gebruikt nu `'flex'` bij terugkeer naar Lijst-modus.
5. **Dagelijkse e-mail uitgebreid:** Edge Function `dagelijkse-reminder` herschreven met drie secties: 🔴 Vandaag & Verlopen, 📅 Deze week (deadline t+1 t/m t+7), ⭐ Prioriteit (`prioriteit='hoog'` / `prio_ster=true`). Getest en bevestigd werkend (7 items, mail ontvangen).

Open:
1. **Kleurkeuze preview** — gebruiker moet beslissen of preview 1 (donker), preview 2 (licht) of geen van beide live gaat.

## 2026-05-03 — Mobiele versie verwijderd + Calendar-view gebouwd

Opruim-sessie: mobiele PWA volledig weggehaald en de lang geplande Calendar-view eindelijk gebouwd. Kanban getest en goedgekeurd door gebruiker. Alle desktop-assets hebben nu cache-busting. Tussendoor ook een layout-bugfix (mobile-notice div stond foutief in `<head>`).

Wijzigingen:
1. **Mobiele versie verwijderd:** `mobile.html`, `mobile.css`, `mobile.js` weg. Auto-redirect in `index.html` vervangen door CSS-melding voor kleine schermen. Apple-mobile meta-tags verwijderd. `manifest.json` uitgehold: `orientation` → `landscape`. `BRIEFING.md` opgeschoond.
2. **Cache-busting `?v=1`** toegevoegd aan alle desktop-assets in `index.html` (`style.css`, `analyse.css`, `ui.js`, `api.js`, `render.js`, `app.js`, `analyse.js`).
3. **Prio-veldnaam-verschil** gedocumenteerd in `BRIEFING.md`: `taken.prioriteit = 'hoog'` vs `subtaken/sub_subtaken.prio_ster = true`.
4. **Calendar-view** gebouwd in nieuwe bestanden `calendar.js` + `calendar.css`: maandgrid met navigatie, rolling-week (vandaag + 6 dagen), dag-detail onderaan bij klik op dag, afvink-modal bij klik op taak. Kleurcodering Werk (blauw) / Privé (oranje).
5. **Bugfix:** `<div id="mobile-notice">` stond foutief in `<head>` — verplaatst naar `<body>`. Veroorzaakte toolbar-layout-breuk (knoppen stapelden verticaal).

Open:
1. **Calendar gebruiker-test** — nog niet uitvoerig getest in productie.

## 2026-05-04 — WIE-kolom, bila-projecten, bugfixes

Productieve sessie: kleurkeuze definitief afgerond, twee bugfixes doorgevoerd, kolom "W/P" omgebouwd naar "WIE" met drie categorieën, context-kolom volledig verwijderd, en twee vaste bila-projecten aangemaakt in Supabase.

Wijzigingen:
1. **Kleurkeuze gesloten:** gebruiker besloot geen nieuw kleurenprofiel. Preview-bestanden (`index-preview.html`, `index-preview-2.html`) verwijderd. Apple Dark definitief.
2. **Deadline-bug fix:** deadline-wijziging werd teruggedraaid na tab-wissel omdat de in-memory array (`allSubtaken` / `allSubsubtaken` / `allProjecten`) niet bijgewerkt werd na een succesvolle patch. Fix: na patch ook de array in sync brengen. Getest en goedgekeurd.
3. **WIE-kolom:** "W/P" → "WIE". Badges hernoemd: Werk → RHLC (blauw), Privé → Raimon (oranje), nieuw Natasja (groen). Filterknoppen toolbar aangepast. Supabase constraint `taken_categorie_check` uitgebreid met 'Natasja'. Dropdown nieuwe-taak-modal heeft nu drie opties.
4. **Context-kolom verwijderd:** kolomheader, `editableContext()` functie, alle ~18 aanroepen, `allContexten`, `attachSelects()`, `normalizeContext()`, context-sort/filterlogica, contexts-API-fetch, en bijbehorende CSS — alles weg.
5. **Bila-projecten aangemaakt:** twee vaste bila-projecten in Supabase:
   - "Bila — Raimon" (Privé, deadline 09/05, 12 taken waaronder HSPI met 4 sub-subtaken en ster-prio)
   - "Bila — Natasja" (Natasja, deadline 09/05, 8 taken waaronder Huisstijl deadline 13/05, Norton 17/07)
6. **WIE-filter fixes:** Natasja-filterknop groen, filterpopup toont gekleurde badges, `activeFilters['cat']` werkt nu ook in Vandaag/Week/Prioriteit-views (was alleen in projectlijst-view).

Open:
1. **Kanban Natasja-kolom:** in `kanban.js` vallen Natasja-taken door de fallback in de 'Werk'-kolom. Beslissen: aparte Natasja-kolom toevoegen of anders oplossen.

## 2026-05-05 — Inspectie + bevindingen doorvoeren

Brede inspectie van de app (features, code, UI, veiligheid) resulteerde in 16 bevindingen. De vier hoogste prioriteiten zijn direct aangepakt. Overige bevindingen staan als open punten in de todolijst voor de volgende sessie.

Wijzigingen:
1. **Kanban Natasja-taken verborgen:** besloten om Natasja-taken niet te tonen in Kanban (waren via fallback in 'Werk' beland). Één filterregel toegevoegd in `kanban.js`.
2. **RLS policies gefixed (veiligheid):** alle Supabase-tabellen stonden op `public, ALL`. Policies omgezet naar `anon`-rol zodat toegang minimaal de anon-key vereist.
3. **Dode CSS opgeruimd:** `style-preview.css` + `style-preview-2.css` verwijderd (454 regels).
4. **Deadline-urgentie gradatie:** drie niveaus ingevoerd: rood ≤2 dagen, oranje 3–7 dagen, grijs >7 dagen. Was voorheen alles ≤7 rood.
5. **Metrics meeschalen met WIE-filter:** tellers (projecten, open taken, alle taken, prio) volgen nu de actieve catFilter mee. Waren voorheen altijd totalen.

Open:
1. **B13** — Keyboard shortcut voor nieuwe taak (N)
2. **B2** — `delWhere` heeft geen input-validatie
3. **B8** — Undo ontbreekt bij verwijderen naar prullenmand
4. **B9** — Inbox-badge telt sub_subtaken; controleer of view die ook toont
5. **B10** — Zoekfunctie wist query stil bij sidebar-klik
6. **B11** — Kanban en Calendar hebben geen WIE-filter
7. **B6** — Sortering O(n²) in `sortItems`
8. **B4** — Prio-veldnaam uniformeren (Supabase-migratie nodig)
9. **B7** — Calendar placeholder-tekst dode code in `index.html:179`
10. **B16** — Cache-busting `?v=1` is handmatig
11. **B5/B15** — Architectuur: alles globaal, geen ES modules
