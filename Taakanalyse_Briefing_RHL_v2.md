# Taakanalyse — Briefingsdocument R.H.L. Consultancy

**Versie:** 2.0  
**Laatste update:** 27 maart 2026  
**Huidige widgetversie:** v12

---

## Werkafspraken & coderingen

- `[w]` = werktaak, `[p]` = privétaak, `[NR]` = privétaak voor Natasja, `[!]` = prioriteit
- Een `[w]` of `[p]` taak zonder expliciete hoofdtaak wordt automatisch subtaak onder **Werk divers** (#15) of **Privé divers** (#10)
- Een `[NR]` taak wordt automatisch subtaak onder **Natasja** (#28, categorie: Privé)
- Taken worden alleen afgerond via tekstmelding, niet via checkbox
- Bij conflicten of dubbelingen: eerst check bij gebruiker voor uitvoering
- Voertaal: Nederlands
- Bij afronden: taak verplaatsen van **Openstaande taken** naar **Afgeronde taken** (incl. datum en categorie)
- Afgeronde taken en wijzigingen worden bijgehouden binnen de actieve chat. Pas bij het wisselen van chat wordt één grote update van het briefingsdocument gemaakt. De gebruiker vervangt vervolgens het bestand in het project.
- Relatieve datumreferenties ("maandag", "volgende week", "na het weekend") worden automatisch omgezet naar concrete datums (DD-MM-YYYY)
- Deadlines ≤ 7 dagen worden automatisch rood gemarkeerd en trekken de taak naar prioriteit

---

## Snelcommando's

- `#taken` → toont direct de interactieve widget

---

## Tabelformat

Kolommen: `#` | `Status` | `Categorie` | `Taak` | `Subtaken` | `Deadline`  
Status: `Afgerond` / `Open` / `Prioriteit` / `Laag`  
Categorie: `Werk` / `Privé`  
Subtaken altijd onder elkaar, genummerd a. b. c. etc.

---

## Weergave (widget)

- Interactieve widget met checkboxen per subtaak (sessietracking)
- Alle hoofdtaken standaard **ingeklapt** — klik op taaknaam om open te klappen
- Afgestreepte subtaken (`dn:1`) zijn **volledig verborgen** — niet zichtbaar als doorgestreept, gewoon weg. Hoofdtaken zonder open subtaken verdwijnen ook.
- **Prioriteit** = rode linkerbalk + rode badge. Geldt voor: handmatige [!], deadline ≤ 7 dagen, of prio-subtaak
- Alle prio-statussen tonen als "Prioriteit" — geen onderscheid tussen oorzaken
- **Lage prioriteit** = grijze linkerbalk + badge "Laag", aparte sectie onderaan, standaard ingeklapt
- Filterbar: Alles / Prioriteit / Werk / Privé
- Metrics bovenaan: Totaal / Open / Werk / Prioriteit
- **Deadline kolom** rechts: alleen voor hoofdtaken. Subtaak-deadlines als inline badge direct na de subtaaktekst
- Deadlines ≤ 7 dagen → rood. Overige deadlines → grijs
- ↻ Vernieuwen knop rechtsboven (voor persistent storage versie)

---

## Taakstructuur

### Normale taken (hoog/prio)
Hoofdtaken met subtaken. Prioriteit via `[!]` markering of deadline.

### Lage prioriteit taken
Aparte sectie onderaan de widget. Standaard ingeklapt. Drie vaste lijsten:
- **#29 Kijklijst** (Werk) — films/series om te kijken
- **#30 Shoplijst** (Privé) — items om te kopen
- **#32 Nice to do** (Privé) — leuke ideeën zonder urgentie

---

## Widgetversies

| Versie | Datum | Wijziging |
|--------|-------|-----------|
| v1 | 24 mrt 2026 | Initiële widget, basisstructuur met prioriteitsectie en filters |
| v2 | 24 mrt 2026 | Prio-subtaken (#15d, #26a) zichtbaar in prioriteitsfilter; oranje balk + Sub [!] badge |
| v3 | 24 mrt 2026 | Prioriteitsfilter toont alleen [!]-subtaken bij taken met prio-subtaken |
| v4 | 25 mrt 2026 | Deadline kolom toegevoegd per taak en subtaak; lage prioriteit sectie; Kijklijst (#29) en Shoplijst (#30) |
| v5 | 25 mrt 2026 | Deadlines automatisch rood bij ≤7 dagen; auto-prio bij naderende deadline |
| v6 | 25 mrt 2026 | Datum uitlijning fix (white-space:nowrap) |
| v7 | 26 mrt 2026 | Checkboxen hoofdtaken verwijderd; één gecombineerde lijst (geen aparte prio-sectie); alle statussen → "Prioriteit" |
| v8 | 26 mrt 2026 | table-layout:fixed met vaste kolombreedtes voor deadline uitlijning |
| v9 | 26 mrt 2026 | Persistent storage + ↻ Vernieuwen knop |
| v10 | 27 mrt 2026 | Subtaak deadlines als inline badge (geen uitlijnproblemen meer) |
| v11 | 27 mrt 2026 | Datumcorrecties (april→maart); 15e/15f/26a bijgewerkt |
| v12 | 27 mrt 2026 | Afgestreepte subtaken volledig verborgen; hoofdtaken zonder open subtaken verdwijnen |

---

## Huidige openstaande taken (stand 27 maart 2026)

Volgend taaknummer: **#33**

### Normale taken

| # | Status | Cat. | Taak | Subtaken | Deadline |
|---|---|---|---|---|---|
| 8 | Prioriteit | Werk | HSPI project | c. Bellen reguliere leden 6x: Auke (RFH), Nick (MS), Sean (JBB), Mark (FL), Jaap (CPA), Herman (AL) · d. Datumprikker verstuurd. Reactie: Ralph, Wouter, Robert. Wacht nog op: Desiree, Nora, Eveline. · h. Bellen handelaren 4x: RL (gedaan), FMG (gedaan), VDP (maandag), DFG (maandag) | h: 30-03-2026 |
| 10 | Open | Privé | Privé divers | a. Retour SugarCity · b. Paspoort verlengen · c. NordVPN op andere apparaten installeren · d. Andere mogelijkheden NordVPN verkennen · e. Belastingdocumenten verzamelen — nog te doen: Jaarruimte berekening, DG, RABO, SAXO, UPO (gedaan: ASN, DFG, ING, KNAB, NN, RAISIN) · f. Noodpakket aanvullen: €300 + vochtige doekjes · g. 2x webinar AI-Report kijken · h. Boeken op MacBook sorteren naar ext. HD · i. Inplannen langs camping Loman · j. ChatGPT afsluiten & Gemini openen · k. Follow-up Antonio (scheiding & morning routine) · l. Overhemden SS kopen · o. Agenda shortcuts instellen · p. Wandelschoenen schoonmaken · q. Whisky Harold uitzoeken · r. Bellen Roos (niet opgenomen) · s. Bellen Marjolein (niet opgenomen) · t. Alle AI dumps op 1 plek (Notion?) · u. Alle bookmarks uit Safari in Notion · v. Alle leeslijst en linkjes voortaan in CC? | e: 29-03-2026 · k: 29-03-2026 · p: 28-03-2026 · q: 28-03-2026 · r: 30-03-2026 · s: 30-03-2026 |
| 11 | Open | Privé | NGSJ — openstaande taken | a. Welkomstbrief nieuwe leden updaten & versturen · b. Kaartje Jubilea (25 jr) · c. Contact Gabriel (deel 3 pelgrimsverhaal) · d. Zoeken naar andere locaties café & presentaties | — |
| 12 | Open | Werk | Financieel maandoverzicht zakelijk | a. Overzicht invullen · b. Analyse maken | — |
| 15 | Open | Werk | Werk divers | a. Lunch met Rico inplannen · b. Leeslijst Chrome leegmaken · e. Bij Henri nagaan wanneer de PPWR tool kijken · h. Transcriptie maken met AI van twee gesprekken · k. Fotograaf en Vormgever/Website | e: 30-03-2026 |
| 18 | Open | Werk | Commercie | a. MPS over residu & uitgangsmateriaal · b. FSI over specifieke projecten · c. HSPI/GPA over certificering icm FSI · d. PM (nader in te vullen) · e. Artikel voor Manual Master · f. LinkedIn slider aanstaande wetgeving · g. Vanaf 1/8 concurrenten DFG benaderen | g: 01-08-2026 |
| 26 | Open | Werk | Leeslijst | b. AH impactverslag · c. Boek Marlot · d. Stuk Merieux · e. Intentioneel leven · f. Me, myself and AI · g. Obsidian · h. Verbaal meesterschap · i. Omdenken werk · j. Overtuigend debateren · k. Je podium pakken · l. 101 beïnvloedingstechnieken · m. Einde vd strategie · n. IMPACT herlezen · o. The devil has a name · p. Brother(s) · q. Chasing the sun | — |
| 28 | Open | Privé | Natasja | a. Autoverzekering · b. Auto wassen · c. VR experience · d. Cabiner | — |
| 31 | Prioriteit | Werk | Follow up commercial leads | a. Nabellen Mark-Jan Terwindt · b. Nabellen Merthus Bezemer · c. Nabellen Mindpact · d. Nutreco: terugbellen indien geen bericht | a: 30-03-2026 · b: 10-04-2026 · c: 30-03-2026 · d: 10-04-2026 |

### Lage prioriteit taken

| # | Cat. | Taak | Items |
|---|---|---|---|
| 29 | Werk | Kijklijst | a. Down the road · b. Pointer (elektrolyten, bloemen) · c. F1 · d. The North · e. I'll push you |
| 30 | Privé | Shoplijst | a. New Balance 9060 · b. Abisko Winter Stretch Trousers M, EU52/R, 550/Black |
| 32 | Privé | Nice to do | a. Stadsplattegronden van Apeldoorn, Delft, Amsterdam, Uithoorn · b. Bushcraft / Wildernis training / Outdoor-survival (re-wild.nl) · c. Stamboom — Coda Archief Apeldoorn? · d. Eigen planner maken (en laten drukken als relatiegeschenk) |

---

## Afgeronde taken

| # | Datum afgerond | Cat. | Taak | Notities |
|---|---|---|---|---|
| 20 | 25-03-2026 | Werk | Facturen Q3 opzoeken | a. Parool · b. AI Report |
| 27 | 25-03-2026 | Werk | Commerciële promotie | Samengevoegd met #18 Commercie |
| 29* | 25-03-2026 | Werk | Voorbereiding job interview Nutreco | Spoed prio — sollicitatiegesprek gehad |
| 8a | 25-03-2026 | Werk | HSPI: Notulen verwerken | — |
| 8b | 26-03-2026 | Werk | HSPI: Gesprekken nieuwe leden | Newwen, Poppelman, Pagter allen benaderd |
| 8d | 25-03-2026 | Werk | HSPI: Datumprikker werkgroepsessie | Verstuurd, wacht op reacties |
| 8e | 25-03-2026 | Werk | HSPI: AI overzichtsdocument | — |
| 8f | 26-03-2026 | Werk | HSPI: Contract Herold | Goedgekeurd |
| 8g | 25-03-2026 | Werk | HSPI: Presentatie kennismakingsmeetings | — |
| 10m | 25-03-2026 | Privé | Notion gekoppeld aan Claude | — |
| 10n | 25-03-2026 | Privé | Salaris overgemaakt | — |
| 15c | 26-03-2026 | Werk | Oefenen met PowerPoint via Claude | — |
| 15d | 25-03-2026 | Werk | Broodfonds/Schenkkring regelen | — |
| 15f | 27-03-2026 | Werk | Afspraak Lisa inplannen | — |
| 15g | 26-03-2026 | Werk | Omzetbelasting betalen | — |
| 15i | 26-03-2026 | Werk | Terugbellen Remco Jansen | — |
| 15j | 26-03-2026 | Werk | f.u. Newwen met info over PPWR | — |
| 26a | 27-03-2026 | Werk | IDH rapport lezen | — |

*Taak #29 was nieuw aangemaakt en direct afgerond (spoed); taaknummer 29 hergebruikt voor Kijklijst.

---

## Toekomstige ontwikkeling

### Standalone webapp (gepland)
- Losse HTML + taken.json, gehost op GitHub Pages
- Bereikbaar op desktop én mobiel
- Features: locatie-context, prio hoog/midden/laag, tijdsinschatting, meer filtertypen
- Claude leest/schrijft taken.json via project uploads
- Taken toevoegen via Claude app (mobiel) in natuurlijke taal
