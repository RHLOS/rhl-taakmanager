# RHL Taakmanager

Persoonlijke taakmanager voor R.H.L. Consultancy.

## Stack

| Laag | Technologie |
|------|-------------|
| Database + API | Supabase (PostgreSQL + REST API) |
| Frontend | Vanilla HTML/CSS/JS |
| Hosting | GitHub Pages |
| AI-integratie | Claude MCP (Supabase MCP Server) |

## Webapp

Open `index.html` of bezoek: `https://rhlos.github.io/rhl-taakmanager/`

### Features
- Platte tabel met 10 kolommen: ✓, P, W/P, Project, Taak, Subtaak, Deadline, Geschat, Werkelijk, Context
- Drie niveaus: Projecten → Taken → Subtaken
- Alles bewerkbaar: klik op een cel om te wijzigen
- Sidebar met snelle weergaven: Alle taken, Inbox, Vandaag, Deze week, Prioriteit, Voltooid
- Dynamische projectenlijst met tellingen
- Prullenmand met auto-cleanup na 7 dagen
- Kolom-header filters en sortering (Excel-stijl)

## Claude MCP configuratie

Claude Chat kan direct taken lezen, aanmaken, afvinken en verwijderen via de Supabase MCP server.

### Vereisten
- Claude Desktop app (Mac)
- Node.js geïnstalleerd (`node --version` moet werken)
- Supabase Personal Access Token (PAT)

### Installatie

1. **Maak een PAT aan** op https://supabase.com/dashboard/account/tokens

2. **Configuratiebestand aanmaken/bewerken:**

```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Voeg toe (of merge met bestaande config):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "/opt/homebrew/bin/npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref", "fhkttfzqdjynzmtjbujv"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_JOUW_TOKEN_HIER"
      }
    }
  }
}
```

> **Let op:** Pas het pad naar `npx` aan als `which npx` een ander pad toont.

3. **Herstart Claude Desktop** (Cmd+Q, opnieuw openen)

4. **Test** in een nieuwe Claude Chat:
   > "Toon alle tabellen in mijn Supabase database"

### Claude Chat project-instructie

Maak in Claude Chat een Project aan met deze instructies zodat taken automatisch in de Inbox verschijnen:

```
Je hebt toegang tot mijn Supabase database via MCP. Dit is mijn persoonlijke taakmanager.

Database structuur:
- taken = projecten (hoofdtaken)
- subtaken = taken binnen een project
- sub_subtaken = subtaken binnen een taak

Regels:
- Bij het AANMAKEN van een nieuwe subtaak of sub_subtaak: zet ALTIJD inbox=true
- Bij het AANMAKEN van een nieuw project (taken tabel): zet ALTIJD inbox=true
- Voertaal is Nederlands
- Deadlines altijd als YYYY-MM-DD formaat opslaan
- Als ik een taak noem zonder specifiek project, voeg het toe aan 'Werk divers' (categorie Werk) of 'Privé divers' (categorie Privé)
- Als ik zeg dat iets af/gedaan is: zet gedaan=true en gedaan_datum=vandaag
- Als ik zeg "verwijder": gebruik soft-delete via verwijderd_op=now(), niet DELETE
```

## Database

### Tabellen

| Tabel | Beschrijving |
|-------|-------------|
| `taken` | Projecten/hoofdtaken |
| `subtaken` | Taken binnen een project |
| `sub_subtaken` | Subtaken binnen een taak |
| `afgerond_log` | Historie van afgeronde taken |
| `meta` | Instellingen (volgend_nr, laatste_update) |

### Supabase project
- **URL:** `https://fhkttfzqdjynzmtjbujv.supabase.co`
- **Project ref:** `fhkttfzqdjynzmtjbujv`

## Bestanden

```
├── index.html              # Webapp (alles in één bestand)
├── manifest.json           # PWA manifest
├── taken.json              # Originele dataset (referentie)
├── supabase/
│   ├── schema.sql          # Basis tabellen
│   ├── import.sql          # Initiële data import
│   ├── sub_subtaken.sql    # Sub-subtaken + migraties
│   ├── update_v2.sql       # Extra velden
│   ├── hernummer.sql       # Hernummering
│   └── inbox.sql           # Inbox veld
├── ClaudeCode_Briefing_Taakmanager.md
└── Taakanalyse_Briefing_RHL_v2.md
```
