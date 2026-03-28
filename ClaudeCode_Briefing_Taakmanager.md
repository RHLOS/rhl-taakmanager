# Taakmanager R.H.L. Consultancy — Claude Code Briefing

**Datum:** 27 maart 2026  
**Doel:** Bouw een volledige taakmanager webapp + API, klaar voor koppeling met een bestaande Swift app en email-integratie.

---

## Wat dit project is

Een persoonlijke taakmanager voor R.H.L. Consultancy. De gebruiker werkt dagelijks met taken en subtaken, logt voortgang via Claude (chat), bekijkt de status via een webapp (desktop + mobiel), en wil dezelfde data in een bestaande Swift app.

De webapp is eerder als widget gebouwd in Claude.ai. Nu wordt het een echte standalone applicatie met een centrale backend.

---

## Stack

| Laag | Keuze | Reden |
|------|-------|-------|
| Database + API | **Supabase** | PostgreSQL, automatische REST API, gratis tier, Swift-support |
| Frontend | **HTML/CSS/JS** (vanilla) | Geen framework nodig, werkt overal, makkelijk te hosten |
| Hosting | **GitHub Pages** | Gratis, al in gebruik, automatisch deployen |
| Email-integratie | **Zapier of Make** | Luistert op dedicated emailadres, stuurt naar Supabase API |
| Swift koppeling | **Supabase Swift SDK** | Bestaande app, directe koppeling via dezelfde API |
| Claude koppeling | Via project uploads van `taken.json` | Claude leest/schrijft data, gebruiker synct handmatig |

---

## Architectuur

```
Email (dedicated adres)
    → Zapier/Make
    → Supabase REST API
          ↑↓
    Claude (via export/import taken.json)
          ↑↓
    Webapp (GitHub Pages) ← gebruiker bekijkt op desktop + mobiel
          ↑↓
    Swift app (bestaand, iPhone/iPad)
```

Alle clients lezen en schrijven naar dezelfde Supabase database. Data is altijd gesynchroniseerd.

---

## Database schema (Supabase / PostgreSQL)

### Tabel: `taken`

```sql
create table taken (
  id uuid default gen_random_uuid() primary key,
  nr integer unique not null,
  taak text not null,
  categorie text check (categorie in ('Werk', 'Privé')) not null,
  prioriteit text check (prioriteit in ('hoog', 'normaal', 'laag')) default 'normaal',
  type text check (type in ('normaal', 'laag')) default 'normaal',
  deadline date,
  locatie text[],                    -- array: ['Thuis', 'Kantoor', 'Telefoon', 'Onderweg', 'PC']
  tijdsinschatting text check (tijdsinschatting in ('<15min', '<1uur', '>1uur')),
  gedaan boolean default false,
  gedaan_datum date,
  aangemaakt_op timestamp default now(),
  bijgewerkt_op timestamp default now()
);
```

### Tabel: `subtaken`

```sql
create table subtaken (
  id uuid default gen_random_uuid() primary key,
  taak_id uuid references taken(id) on delete cascade,
  sub_id text not null,              -- bijv. "8a", "10e"
  tekst text not null,
  prioriteit boolean default false,  -- [!] markering
  deadline date,
  locatie text[],
  tijdsinschatting text check (tijdsinschatting in ('<15min', '<1uur', '>1uur')),
  gedaan boolean default false,
  gedaan_datum date,
  volgorde integer default 0,
  aangemaakt_op timestamp default now()
);
```

### Tabel: `laag_prioriteit`

```sql
create table laag_prioriteit (
  id uuid default gen_random_uuid() primary key,
  nr integer unique not null,
  taak text not null,
  categorie text check (categorie in ('Werk', 'Privé')) not null,
  aangemaakt_op timestamp default now()
);
```

### Tabel: `laag_items`

```sql
create table laag_items (
  id uuid default gen_random_uuid() primary key,
  lijst_id uuid references laag_prioriteit(id) on delete cascade,
  tekst text not null,
  gedaan boolean default false,
  gedaan_datum date,
  volgorde integer default 0
);
```

### Tabel: `afgerond_log`

```sql
create table afgerond_log (
  id uuid default gen_random_uuid() primary key,
  taak_nr text not null,             -- bijv. "8a" of "20"
  taak_tekst text not null,
  categorie text,
  gedaan_datum date not null,
  notities text,
  aangemaakt_op timestamp default now()
);
```

### Tabel: `meta`

```sql
create table meta (
  sleutel text primary key,
  waarde text
);
-- Initiële waarden:
insert into meta values ('volgend_nr', '33');
insert into meta values ('laatste_update', '27-03-2026');
```

---

## Webapp — gewenste features

### Weergave
- Responsive: werkt op desktop én mobiel (iPhone)
- Alle hoofdtaken standaard **ingeklapt**, klik om uit te klappen
- Afgeronde subtaken **volledig verborgen** (niet doorgestreept, gewoon weg)
- Als alle subtaken van een hoofdtaak gedaan zijn → hoofdtaak verdwijnt

### Prioriteit & kleuren
- **Rode linkerbalk** = prioriteit (hoog, of deadline ≤ 7 dagen, of prio-subtaak)
- **Grijze linkerbalk** = lage prioriteit
- **Geen balk** = normaal
- Alle prioriteitstaken tonen badge "Prioriteit" — geen onderscheid in oorzaak

### Deadline
- Deadline per hoofdtaak: zichtbaar in aparte kolom rechts
- Deadline per subtaak: inline badge direct achter de subtaaktekst
- ≤ 7 dagen: rood · > 7 dagen: grijs
- Relatieve datums automatisch omzetten ("maandag" → "30-03-2026")
- Deadlines ≤ 7 dagen trekken taak automatisch naar prioriteit

### Filters
- **Alles / Prioriteit / Werk / Privé** (bestaand)
- **Locatie:** Thuis / Kantoor / Telefoon / Onderweg / PC
- **Tijdsinschatting:** <15 min / <1 uur / >1 uur
- **Type:** Normaal / Laag prioriteit

### Secties
1. **Taken** — alle normale taken, gesorteerd op prioriteit eerst
2. **Lage prioriteit** — Kijklijst, Shoplijst, Nice to do — standaard ingeklapt

### Metrics bovenaan
- Totaal taken / Open / Werk / Prioriteit

### Snelcommando's (voor Claude.ai integratie)
- `#taken` → toont de widget in Claude.ai chat

---

## Bestaande taakdata

Zie bijgevoegd bestand `taken.json` voor de volledige huidige dataset inclusief:
- 9 actieve hoofdtaken met subtaken
- 3 lage prioriteit lijsten (Kijklijst, Shoplijst, Nice to do)
- 17 afgeronde taken/subtaken met datum

Volgend taaknummer: **#33**

---

## Email-naar-taak integratie

### Werking
1. Dedicated emailadres: bijv. `taken@rhlconsultancy.nl` (of Gmail alias)
2. Zapier/Make luistert op dit adres
3. Bij binnenkomende mail: parse onderwerp + body
4. Stuur naar Supabase via REST API als nieuwe taak/subtaak

### Parsing regels (zelfde als Claude coderingen)
- `[w]` in onderwerp → categorie Werk
- `[p]` in onderwerp → categorie Privé
- `[!]` in onderwerp → prioriteit hoog
- Datumreferenties in tekst → deadline veld
- Zonder hoofdtaak → subtaak onder Werk divers of Privé divers

### Voorbeeld email
```
Van: gebruiker@gmail.com
Aan: taken@rhlconsultancy.nl
Onderwerp: [w][!] Terugbellen Jan vrijdag
Body: Follow-up over PPWR project
```
→ Wordt: subtaak onder Werk divers, prioriteit hoog, deadline vrijdag

---

## Swift app koppeling

### Wat de Swift app nodig heeft
- Supabase Swift SDK: `https://github.com/supabase/supabase-swift`
- Dezelfde Supabase project URL + anon key
- Lees: alle open taken + subtaken per categorie
- Schrijf: taak/subtaak markeren als gedaan

### Endpoints die de webapp gebruikt (ook voor Swift)
```
GET  /rest/v1/taken?gedaan=eq.false&order=prioriteit.desc
GET  /rest/v1/subtaken?gedaan=eq.false&taak_id=eq.{id}
PATCH /rest/v1/subtaken?id=eq.{id}  body: {"gedaan": true, "gedaan_datum": "2026-03-27"}
POST /rest/v1/taken  body: {nieuw taak object}
POST /rest/v1/subtaken  body: {nieuw subtaak object}
```

---

## Werkafspraken & coderingen (voor Claude-integratie)

- `[w]` = werktaak, `[p]` = privétaak, `[NR]` = taak voor Natasja, `[!]` = hoge prioriteit
- Taak zonder expliciete hoofdtaak → subtaak onder **Werk divers** (#15) of **Privé divers** (#10)
- `[NR]` taak → subtaak onder **Natasja** (#28)
- Taken worden afgerond via tekstmelding aan Claude, niet via checkbox in chat
- Claude werkt wijzigingen bij in `taken.json`, gebruiker uploadt naar Supabase
- Voertaal: Nederlands
- Relatieve datums worden automatisch omgezet naar DD-MM-YYYY

---

## Bestandsstructuur project

```
/
├── index.html          # Webapp (alle HTML/CSS/JS in één file)
├── taken.json          # Initiële dataset voor import in Supabase
├── supabase/
│   └── schema.sql      # Database schema
├── zapier/
│   └── email_parser.js # Parsing logica voor email-integratie
└── README.md           # Setup instructies
```

---

## Setup volgorde voor Claude Code

1. Maak `supabase/schema.sql` aan met alle tabellen
2. Importeer `taken.json` data in Supabase (script schrijven)
3. Bouw `index.html` webapp met Supabase JS client
4. Test alle CRUD operaties
5. Stel GitHub Pages in op de repo
6. Schrijf `zapier/email_parser.js` voor email-integratie
7. Documenteer Swift SDK koppeling in README

---

## Openstaande punten — invullen voor start in Claude Code

De volgende vier punten moeten beantwoord zijn voordat Claude Code kan beginnen. Vul ze hieronder in en geef dit document mee bij de start.

---

### 1. Supabase

- **Account aangemaakt?** → [ ] Ja / [ ] Nee (aanmaken op supabase.com, gratis)
- **Project URL:** `https://________________.supabase.co`
- **Anon key:** `eyJ...` _(te vinden onder Project Settings → API in Supabase dashboard)_
- **Opmerking:** Maak een nieuw Supabase project aan met naam bijv. `rhl-taakmanager`. De regio "EU West" (Frankfurt) is het dichtstbij.

---

### 2. GitHub repository

- **Repo naam:** `________________` _(bijv. `rhl-taakmanager`)_
- **GitHub gebruikersnaam:** `________________`
- **Repo URL wordt:** `https://github.com/{gebruikersnaam}/{repo-naam}`
- **GitHub Pages URL wordt:** `https://{gebruikersnaam}.github.io/{repo-naam}`
- **Opmerking:** Maak de repo public aan op github.com zodat GitHub Pages gratis werkt. Zet GitHub Pages aan onder repo Settings → Pages → Branch: main.

---

### 3. Emailadres voor taken-inkomst

- **Eigen domein beschikbaar?** → [ ] Ja, domein: `________________` / [ ] Nee, gebruik Gmail alias
- **Gekozen emailadres:** `taken@________________` _(bijv. `taken@rhlconsultancy.nl` of `rhl.taken@gmail.com`)_
- **Automatiseringstool:** [ ] Zapier (gratis t/m 100 taken/maand) / [ ] Make (gratis t/m 1000 operaties/maand)
- **Opmerking:** Als je geen eigen domein hebt, werkt een Gmail alias prima. Zapier is eenvoudiger te configureren voor dit gebruik.

---

### 4. Swift app datamodel

- **Heeft de Swift app al een eigen datamodel?** → [ ] Ja / [ ] Nee
- **Huidige backend van de Swift app:** `________________` _(bijv. Core Data, Firebase, geen)_
- **Welke data verwacht de Swift app minimaal:**
  - [ ] Lijst van open taken per categorie
  - [ ] Subtaken per taak
  - [ ] Deadlines
  - [ ] Prioriteit
  - [ ] Locatie / tijdsinschatting
  - [ ] Anders: `________________`
- **Supabase Swift SDK:** `https://github.com/supabase/supabase-swift` — voeg toe via Swift Package Manager
- **Opmerking:** Als de Swift app al een datamodel heeft, geef dan de struct/model-definitie mee zodat Claude Code het Supabase schema daarop kan afstemmen.

---
