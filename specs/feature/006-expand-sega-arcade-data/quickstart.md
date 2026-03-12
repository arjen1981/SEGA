# Quickstart: Major SEGA Arcade Data Expansion

**Feature**: 006-expand-sega-arcade-data  
**Branch**: `feature/006-expand-sega-arcade-data`

## Prerequisites

- Git repository checked out on branch `feature/006-expand-sega-arcade-data`
- PowerShell available for validation
- Browser for manual testing

## What This Feature Does

Expands the SEGA arcade graph dataset from **140 nodes / 296 edges** to **~225 nodes / ~460 edges** by adding:
- ~70 new game nodes (1966–2018)
- 5 new platform nodes (Hikaru, RingEdge, RingEdge 2, Nu, Europa-R)
- 4 new studio nodes (Compile, Westone, Sega Rosso, Sega AM4)
- 6 new creator nodes (Ohba, Uchida, Ueda, Nakayama, Rosen, Niitani)
- ~165 new edges connecting them all

**Zero code changes.** Only `src/data/nodes.json` and `src/data/edges.json` are modified.

## Implementation Steps

### Step 1: Add new studio nodes

Add 4 studio objects to `nodes.json`:
- Compile, Westone (external studios)
- Sega Rosso, Sega AM4 (Sega divisions)

Add corresponding edges to `edges.json`:
- `sega-rosso → sega` ("division of")
- `sega-am4 → sega` ("division of")

### Step 2: Add new platform nodes

Add 5 platform objects to `nodes.json`:
- Hikaru, RingEdge, RingEdge 2, Nu, Europa-R

### Step 3: Add new game nodes (by era)

Add game objects to `nodes.json` in batches by era, following the catalog in `research.md`. For each batch:

1. Add game node objects to `nodes.json`
2. Add `"developed by"` and `"runs on"` edges to `edges.json`
3. Run validation script

**Batch order** (recommended):
1. Pre-digital / EM games (1966–1980): ~6 games
2. G80 era (1981–1982): ~5 games
3. System 1/2 era (1983–1985): ~5 games
4. System 16 / Super Scaler (1986–1989): ~7 games
5. System 18/32 / Transition (1989–1993): ~9 games
6. Model 2 / ST-V (1993–1997): ~7 games
7. Model 3 (1996–1999): ~4 games
8. NAOMI / NAOMI 2 (1998–2004): ~10 games
9. Chihiro (2002–2005): ~2 games
10. Lindbergh / Europa-R (2005–2009): ~5 games
11. Card-based (2003–2016): ~3 games
12. Modern (2009–2018): ~6 games

### Step 4: Add new creator nodes

Add 6 creator objects to `nodes.json` with their edges:
- `"worked at"` edges to studios
- Credit edges to games (directed, designed, etc.)

### Step 5: Fix existing edge corrections

1. Change Initial D developer from `"sega"` to `"sega-rosso"`
2. Add Westone developer edges for Wonder Boy games

### Step 6: Validate

Run the PowerShell validation after each batch:

```powershell
$n = Get-Content src/data/nodes.json -Raw | ConvertFrom-Json
$e = Get-Content src/data/edges.json -Raw | ConvertFrom-Json
$ids = $n | ForEach-Object { $_.id }
$dups = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
$broken = $e | Where-Object { $_.from -notin $ids -or $_.to -notin $ids }
"Nodes: $($n.Count) | Edges: $($e.Count) | Dups: $($dups.Count) | Broken: $($broken.Count)"
$n | Group-Object group | ForEach-Object { "  $($_.Name): $($_.Count)" }
```

### Step 7: Manual visual test

Open `src/index.html` in a browser (via the `serve.ps1` script) and verify:
- Graph renders without JavaScript errors
- New nodes appear and are clickable
- Detail panel shows correct data for new nodes
- Ego-graph spotlight works on new nodes
- Graph stabilizes within reasonable time

## Acceptance Checklist

- [ ] 225+ total nodes
- [ ] 460+ total edges
- [ ] 0 duplicate node IDs
- [ ] 0 broken edges
- [ ] Every new node has `wikipediaUrl`
- [ ] Existing 140 nodes unchanged
- [ ] Graph renders in browser
- [ ] All existing QUnit tests still pass
