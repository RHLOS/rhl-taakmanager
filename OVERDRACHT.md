# Overdracht — rhl-taakmanager
*Laatste update: 2026-04-29*

## Openingsbericht volgende sessie

```
Sessie rhl-taakmanager — vorige sessie 2026-04-29
Lees CLAUDE.md, BRIEFING.md en OVERDRACHT.md van dit project.
We waren bezig met de view-switcher (Kanban afgerond + drag-and-drop, Calendar nog placeholder). Aan het eind besloten dat de mobiele versie weg moet — onderhoud kost te veel moeite.
Volgende actie: mobiele versie volledig verwijderen. Voor er bestanden weg gaan, eerst de drie vragen onderaan deze OVERDRACHT beantwoorden.
```

---

## Waar staan we

Stap 1, 2 en 3 van de view-switcher zijn live op `main`. Bezig-toggle werkt in Lijst-weergave (groen rondje naast prio-ster, alleen op subtaken + sub-subtaken). Kanban-view met drag-and-drop is functioneel maar nog niet user-getest. Calendar is een placeholder. Mobiele PWA draait nog maar wordt in de volgende sessie volledig verwijderd.

## Open punten

1. **Mobiele versie verwijderen** (focus volgende sessie). Bestanden weg: `mobile.html`, `mobile.css`, `mobile.js`. Auto-redirect-script bovenaan `index.html` weg. Mobile-refs in `manifest.json` checken. Mobiele secties uit `BRIEFING.md` (regels 47-54 + status-zin op regel 79) opruimen.
2. **Stap 4: Calendar-view bouwen.** Placeholder staat in `index.html` (`#calendarContainer`). Te beslissen voor bouw: (a) klik op dag = wat? Lijst van die dag tonen onderaan? (b) klik op event = detail-modal of doorklikken naar Lijst-view? (c) week- en maand-toggle of alleen één?
3. **Cache-busting `?v=N` op desktop assets.** Alleen `kanban.js?v=1` heeft het nu. `style.css`, `analyse.css`, `ui.js`, `api.js`, `render.js`, `app.js`, `analyse.js` ontbreken. Mobile heeft het al. Zonder dit moet je hard refreshen na elke deploy.
4. **Kanban gebruiker-test.** Sessie eindigde voordat de gebruiker de Kanban-flow kon bevestigen. Eerstvolgende sessie kort verifiëren dat: drag-and-drop werkt, kaarten in juiste kolom landen, terug-slepen naar Werk/Privé klopt, sidebar-klik tijdens Kanban-modus terug naar Lijst gaat.
5. **Reference-content in oude OVERDRACHT.md.** De vorige OVERDRACHT bevatte uitgebreide code-referentie (uitleg over `buildIndexes`, `catFilter`, sticky header, prio-veld-naam-verschillen per tabel, soft-delete-conventies, etc.) en een SQL-scripts-overzicht. Dat is met deze skill-replace niet meegenomen. Beoordelen of het naar `BRIEFING.md` moet als losse subsectie "Code-referentie" of dat de huidige BRIEFING genoeg is.

## Volgende actie

Mobiele versie verwijderen. Vóór er ook maar één bestand weg gaat, eerst antwoord op deze drie vragen:

1. **Cache-busting `?v=` op mobile asset-refs in `mobile.html`** — irrelevant want het bestand gaat zelf weg, klopt?
2. **`manifest.json`** — helemaal weghalen, of uitkleden zodat we eventueel later een desktop-PWA kunnen aanzetten?
3. **Auto-redirect in `index.html`** — helemaal weg, of vervangen door een nette boodschap "deze app is desktop-only, gebruik een groter scherm" voor mobile bezoekers?
