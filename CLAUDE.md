# rhl-taakmanager

Persoonlijke taakmanager voor R.H.L. Consultancy. Webapp (desktop) + PWA (mobiel) + Supabase backend + dagelijkse e-mailreminder. In gebruik door 1 gebruiker.

## Context

Voor mijn identiteit, toon en huisstijl: zie @_shared/CLAUDE.md

## Projectspecifiek

**Stack:** Vanilla HTML/CSS/JS, Supabase (Postgres + REST), GitHub Pages, Resend (e-mail), Chart.js (analyse).

**Fase:** Productie. Desktop + mobiel v1 in gebruik. Volgende sessie = mobiel v2.

**Belangrijk: lees eerst `OVERDRACHT.md`** — dat is het levende overdrachtsdocument met werkafspraken, openstaande items, file-overzicht en code-referentie. Werk daaruit, niet uit dit bestand.

**Afwijkende conventies (samenvatting, OVERDRACHT.md is leidend):**
- Token-zuinig werken: `grep` + `offset/limit` ipv hele bestanden lezen. Sonnet ipv Opus tenzij anders gevraagd.
- Niets bouwen of aanpassen zonder vooraf toestemming. Stap voor stap, vragen nummeren.
- Bij Supabase-SQL: altijd zeggen "wis eerst het tekstveld".
- Na elke werkende wijziging: committen + pushen naar `main` (GitHub Pages deployt automatisch). Link meesturen bij refresh-verzoek.
- Gebruiker is een leek — simpel uitleggen.
