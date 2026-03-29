# Analyse Dashboard — Plan

## Zes analyses op basis van de huidige data

| # | Analyse | Grafiek | Data beschikbaar? |
|---|---------|---------|---|
| 1 | **Productiviteit** — afgeronde taken per week/maand | Staafdiagram | Volledig (gedaan_datum) |
| 2 | **Werk / Privé verdeling** — open en afgerond | Donut chart | Volledig (categorie) |
| 3 | **Geschat vs Werkelijk tijd** | Staafdiagram | Alleen als geschat/werkelijk ingevuld |
| 4 | **Deadline compliance** — % op tijd afgerond | KPI + staafdiagram | Alleen voor items met deadline + gedaan_datum |
| 5 | **Context analyse** — waar wordt het meeste werk gedaan | Staafdiagram | Alleen als context ingevuld |
| 6 | **Project voortgang** — % afgerond per project | Voortgangsbalken (CSS) | Volledig |

## UI Layout

```
┌─────────────────────────────────────────────────┐
│ Analyse                                         │
├──────────┬──────────┬──────────┬────────────────┤
│ Afgerond │ Open     │ Op tijd  │ Gem. doorloop- │  ← KPI kaarten
│ deze week│ totaal   │ %        │ tijd (dagen)   │
├──────────┴──────────┴──────────┴────────────────┤
│ [Week / Maand]          [Alles / Werk / Privé]  │  ← filters
├────────────────────────┬────────────────────────┤
│ Productiviteit         │ Werk/Privé verdeling   │  ← rij 1
│ (staafdiagram)         │ (donut)                │
├────────────────────────┼────────────────────────┤
│ Geschat vs Werkelijk   │ Deadline compliance    │  ← rij 2
│ (staafdiagram)         │ (KPI + donut)          │
├────────────────────────┼────────────────────────┤
│ Context analyse        │ Project voortgang      │  ← rij 3
│ (staafdiagram)         │ (CSS voortgangsbalken) │
└────────────────────────┴────────────────────────┘
```

## Technische aanpak

- **Chart.js** via CDN voor de grafieken (lightweight, geen build nodig)
- Project voortgang puur met CSS (geen library nodig)
- Alle berekeningen client-side op de al geladen data
- `afgerond_log` tabel extra laden bij init
- Bij te weinig data: melding "Nog geen data beschikbaar"

## Implementatie in 3 stappen

1. **Sidebar knop + basis layout** — CSS grid, KPI kaarten, lege containers
2. **Data-aggregatie + grafieken** — Chart.js laden, 6 render-functies
3. **Filter toolbar** — Week/Maand toggle, Categorie filter
