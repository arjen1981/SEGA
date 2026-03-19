# Quickstart: Expand Creator Nodes with Wikidata

**Feature**: 008-expand-creators  
**Branch**: `008-expand-creators`

## Prerequisites

- Git repository checked out on branch `008-expand-creators`
- PowerShell available for scripts and validation
- Internet access for Wikidata SPARQL queries and Wikipedia API
- Constitution amended to v1.3.0 (structured data exception for Wikidata)

## What This Feature Does

Expands the SEGA graph's creator coverage from **25 to ~45 creator nodes** by:
- Adding ~20 new creator nodes sourced from Wikidata SPARQL
- Adding ~30+ new creator–game edges
- Adding new edges for existing creators where Wikidata reveals additional credits
- Adding data attribution (ATTRIBUTION.md + UI footer)

**Changes**:
- `src/data/nodes.json` — new creator nodes
- `src/data/edges.json` — new creator–game edges
- `src/index.html` — attribution footer
- `src/css/styles.css` — attribution styling (if needed)
- `ATTRIBUTION.md` — new file documenting data sources
- `scripts/enrich-creators.ps1` — new enrichment script

## Implementation Steps

### Step 0: Amend Constitution

Before any implementation, amend `.specify/memory/constitution.md` to v1.3.0:
- Add "Structured data exception" to Principle VI
- Allows Wikidata as source for factual credit relationships

### Step 1: Build enrichment script

Create `scripts/enrich-creators.ps1` that:
1. Queries Wikidata SPARQL for Sega game creators (P943, P57, P86, P170, P162, P3080)
2. Filters out non-game-creators using exclusion list
3. Maps Wikidata game labels to graph game IDs
4. For creators with Wikipedia pages: fetches summary + thumbnail via Wikipedia API
5. Outputs new creator nodes and edges as JSON
6. Merges non-destructively with existing `nodes.json` and `edges.json`

### Step 2: Add Tier 1 creators (linked to existing games)

Add 3 creators that connect to games already in the graph:
- Katsuhiro Hayashi → Gain Ground, Rambo
- Yasuhiro Kawakami → Scramble Spirits, Crack Down
- Shinichi Sakamoto → Wonder Boy in Monster Land

Validate: `powershell -File validate-data.ps1`

### Step 3: Add Tier 2 creators (with Wikipedia, need game nodes)

Add ~11 creators and their associated game nodes:
- Yuzo Koshiro (Streets of Rage)
- Naofumi Hataya (Golden Axe II/III)
- Hidenori Shoji (Yakuza)
- Hitoshi Sakimoto (Valkyria Chronicles)
- etc.

For each: also add the associated game node if not in the graph.

Validate after each batch.

### Step 4: Add Tier 3 creators (Wikidata-only)

Add ~6 creators without Wikipedia pages. These get minimal summaries.

Validate: `powershell -File validate-data.ps1`

### Step 5: Add new edges for existing creators

Add edges where Wikidata reveals credits not already in the graph:
- takayuki-nakamura → eswat (composed for)
- takenobu-mitsuyoshi → lets-go-jungle (composed for)
- etc.

Verify no duplicate edges.

### Step 6: Add attribution

1. Create `ATTRIBUTION.md` at repository root
2. Add attribution line to `src/index.html` footer
3. Style if needed in `src/css/styles.css`

### Step 7: Final validation

```powershell
# Validate data integrity
powershell -File validate-data.ps1

# Run all tests
# Open tests/index.html in browser

# Manual verification
# Open src/index.html and check:
# - New creators appear in graph
# - Clicking a new creator shows detail panel
# - Attribution is visible
# - Existing creators unchanged
```

## Verification Checklist

- [ ] All 25 existing creators still present with unchanged data
- [ ] All existing edges unchanged
- [ ] New creator nodes pass `validate-data.ps1`
- [ ] New edges reference valid node IDs
- [ ] Attribution visible in UI
- [ ] ATTRIBUTION.md exists at repo root
- [ ] All existing QUnit tests pass
- [ ] Enrichment script is idempotent (run twice → same output)
