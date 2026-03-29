# RHL Taakmanager — Overdrachtsdocument voor nieuwe sessie

**Datum:** 28 maart 2026
**Project:** rhl-taakmanager
**Repo:** RHLOS/rhl-taakmanager
**Branch:** claude/build-task-manager-app-grXDc

---

## Wat is er al gedaan

### 1. Supabase opgezet
- **Project URL:** `https://fhkttfzqdjynzmtjbujv.supabase.co`
- **Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoa3R0ZnpxZGp5bnptdGpidWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDg5NjgsImV4cCI6MjA5MDI4NDk2OH0.0p7IK97uPxBcazlUwredncV8EIFuvgjAhe46N9P118I`
- RLS ingeschakeld, policies "Alles toegestaan" (1 gebruiker, geen auth nodig)

### 2. Database schema aangemaakt en gevuld
Tabellen die bestaan in Supabase:
- `taken` — hoofdtaken/projecten
- `subtaken` — subtaken per hoofdtaak
- `sub_subtaken` — sub-subtaken per subtaak
- `laag_prioriteit` + `laag_items` — oude structuur, wordt niet meer gebruikt
- `afgerond_log` — historie van afgeronde taken
- `meta` — instellingen (volgend_nr, laatste_update)

Data is geïmporteerd uit `taken.json`. Scripts die al zijn uitgevoerd:
- `supabase/schema.sql` — basis tabellen
- `supabase/import.sql` — initiële data
- `supabase/sub_subtaken.sql` — sub-subtaken tabel + opsplitsing 8c/8d/8h/10e + migratie laag prioriteit
- `supabase/update_v2.sql` — extra velden (tijd_uitgevoerd, context, prio_ster, etc.)
- `supabase/hernummer.sql` — taken hernummerd vanaf 1

### 3. GitHub Pages geactiveerd
- URL: `https://rhlos.github.io/rhl-taakmanager/`
- Deployt vanaf `main` branch

### 4. Webapp (index.html) — HUIDIGE STAAT
Er is een werkende webapp maar die moet volledig herschreven worden (zie "Wat moet gebouwd worden").

---

## Wat moet gebouwd worden

### De webapp moet herschreven worden als een platte tabel met deze kolommen:

| # | W/P | Project | Taak | Subtaak | Deadline | Geschat | Werkelijk | Context | Prio | Gedaan |
|---|-----|---------|------|---------|----------|---------|-----------|---------|------|--------|

### Kolom-specificaties:

1. **#** — doorlopend rijnummer (1, 2, 3...), elke rij krijgt een nummer ongeacht niveau
2. **W/P** — Werk of Privé, klikbaar dropdown om te wijzigen
3. **Project** — de hoofdtaak (bijv. "HSPI project"). Wordt herhaald op elke rij die bij dit project hoort
4. **Taak** — de subtaak (bijv. "Bellen reguliere leden"). Wordt herhaald op elke rij die bij deze taak hoort
5. **Subtaak** — het laagste niveau (bijv. "Auke (RFH)")
6. **Deadline** — ALTIJD een datum (DD-MM-YYYY), nooit relatief ("maandag")
7. **Geschat** — dropdown: <15 min, <30 min, <60 min, <90 min, <120 min
8. **Werkelijk** — vrij invoerveld, aantal minuten
9. **Context** — meerdere keuzes mogelijk, onder elkaar: @Kantoor, @Thuis, @Onderweg, @Computer, @Telefoon, @Online
10. **Prio** — klikbare ster (leeg = geen prio, gevuld/geel = prio). Klik om te togglen
11. **Gedaan** — checkbox om af te vinken (alleen op het laagste niveau)

### Voorbeeld hoe de tabel eruitziet:

| # | W/P | Project | Taak | Subtaak | Deadline | Geschat | Werkelijk | Context | Prio | Gedaan |
|---|-----|---------|------|---------|----------|---------|-----------|---------|------|--------|
| 1 | W | HSPI project | Bellen reguliere leden | Auke (RFH) | | | | | ☆ | ○ |
| 2 | W | HSPI project | Bellen reguliere leden | Nick (MS) | | | | | ☆ | ○ |
| 3 | W | HSPI project | Bellen reguliere leden | Sean (JBB) | | | | | ☆ | ○ |
| 4 | W | HSPI project | Bellen handelaren | VDP | 30-03-2026 | | | | ☆ | ○ |
| 5 | W | HSPI project | Bellen handelaren | DFG | 30-03-2026 | | | | ☆ | ○ |
| 6 | P | Privé divers | Retour SugarCity | | | | | | ☆ | ○ |
| 7 | P | Privé divers | Paspoort verlengen | | | | | | ☆ | ○ |

### Gedrag:

- **In/uitklappen:** op Project-niveau EN op Taak-niveau. Bij inklappen verdwijnen de onderliggende rijen. Standaard alles ingeklapt bij openen
- **Alles inklappen / Alles uitklappen:** twee knoppen bovenaan naast de filters
- **Nieuwe taak toevoegen:** knop bovenaan die een lege rij onderaan toevoegt
- **+ knop per rij:** om een subtaak/sub-subtaak toe te voegen aan die rij
- **Elk veld is bewerkbaar:** klik op een cel om te bewerken (tekst, dropdown, datum). Wijzigingen worden direct opgeslagen naar Supabase
- **Afgevinkte items:** worden bewaard in de database (gedaan=true) maar niet meer getoond in de tabel. Later worden ze filterbaar/analyseerbaar (nog uit te werken)

### Filters (bovenaan):
- **Combineerbaar:** meerdere tegelijk selecteerbaar
- Alles (reset alle filters), Prioriteit, Werk, Privé
- Werk + Privé tegelijk = alles tonen

### Metrics bovenaan:
- Totaal / Open / Werk / Prioriteit

### Design:
- Apple-native look & feel (mix van Herinneringen, Todoist, Things 3, Microsoft Todo)
- Font: -apple-system / SF Pro
- Kleuren: Apple systeem kleuren
- Desktop-first (mobiel doen we later apart)

---

## Architectuur beslissingen

| Onderdeel | Beslissing |
|-----------|-----------|
| **Webapp** | PWA, Apple-native design, vanilla HTML/CSS/JS |
| **Hosting** | GitHub Pages (gratis), deployt vanaf main branch |
| **Backend** | Supabase (gratis tier), PostgreSQL + REST API |
| **Mobiel** | PWA op homescreen — geen aparte app. Mobielvriendelijk design doen we later |
| **Claude integratie** | MCP — Claude praat direct met Supabase (nog te bouwen) |
| **Hersenspinsels** | Direct POST naar Supabase API (instructie nog te schrijven) |
| **Email-integratie** | Vervallen — vervangen door Hersenspinsels-route |
| **RHLOS koppeling** | Geparkeerd — nice to do voor later |
| **Gebruikers** | Alleen Raimon, geen auth nodig |
| **AI-analyse** | Nog uit te werken, later |

---

## Werkafspraken met de gebruiker

1. **NOOIT iets bouwen of aanpassen zonder vooraf toestemming**
2. **Altijd verduidelijkingsvragen stellen** voordat je begint — kwaliteit boven snelheid
3. **Vragen altijd nummeren** — makkelijker te beantwoorden
4. **Stap voor stap** door processen lopen die de gebruiker moet uitvoeren
5. **Bij SQL uitvoeren in Supabase:** altijd expliciet zeggen "wis eerst het tekstveld"
6. **Gebruiker is een leek** — alles simpel uitleggen, stap voor stap
7. De gebruiker werkt op een **Mac** (MacBook Air), bestanden staan in `~/ClaudeCodeZandbak/rhl-taakmanager/`
8. De gebruiker heeft `gh` CLI geïnstalleerd en is ingelogd als RHLOS

---

## Nog te doen

1. **Webapp herschrijven** naar het nieuwe tabelmodel (beschreven hierboven) — dit is de eerstvolgende stap
2. **Database mogelijk bijwerken** — het doorlopend rijnummer-systeem vereist mogelijk een nieuw nummerveld
3. **Claude MCP configureren** — zodat de gebruiker via Claude Chat taken kan aanmaken/afstrepen/verwijderen
4. **Hersenspinsels instructie schrijven** — voor directe koppeling met Supabase
5. **Mobiele versie** — later, in overleg

---

## Referentie bestanden in de repo

```
/
├── index.html              # Webapp (moet herschreven worden)
├── manifest.json           # PWA manifest
├── taken.json              # Originele dataset (referentie)
├── ClaudeCode_Briefing_Taakmanager.md   # Originele briefing
├── Taakanalyse_Briefing_RHL_v2.md       # Taakanalyse
├── supabase/
│   ├── schema.sql          # Basis tabellen (al uitgevoerd)
│   ├── import.sql          # Initiële data (al uitgevoerd)
│   ├── sub_subtaken.sql    # Sub-subtaken + migraties (al uitgevoerd)
│   ├── update_v2.sql       # Extra velden (al uitgevoerd)
│   └── hernummer.sql       # Hernummering (al uitgevoerd)
└── README.md
```
