# Implementation Plan: Expand Creator Nodes with Wikidata

**Branch**: `008-expand-creators` | **Date**: 2026-03-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-expand-creators/spec.md`

> **Note**: The spec.md has been updated (2026-03-19) to replace all MobyGames references with Wikidata SPARQL. During research (this plan phase), MobyGames API credits were found to require Gold tier at $4,999.99/month — fundamentally unaffordable. The approach pivoted to **Wikidata SPARQL** as the primary automated source. Both spec and plan now reflect the corrected approach.

## Summary

Expand the SEGA arcade graph's creator coverage using Wikidata SPARQL as the primary automated data source. Wikidata provides structured game–person credit relationships (director, composer, producer, designer) that can be queried freely via SPARQL endpoint. Add ~12–18 new creator nodes and ~40+ new edges to the graph, enriching each creator with Wikipedia biographical data where available. Add data attribution (IGDB for images, Wikidata/Wikipedia for creator facts) to the application UI and repository. All factual text data remains Wikipedia/Wikidata-sourced per an amended Constitution Principle VI.

### Current → Target Baseline

| Metric | Current | Target |
|--------|---------|--------|
| Creator nodes | 25 | 35–43 |
| Games with creator links | 49 | 60+ |
| Total edges | 443 | 490+ |
| Data attribution | None visible | UI + ATTRIBUTION.md |

## Technical Context

**Language/Version**: Vanilla JavaScript (ES modules, no transpilation); PowerShell for enrichment script  
**Primary Dependencies**: vis-network 9.1.9 (CDN), QUnit (CDN), Wikidata SPARQL endpoint  
**Storage**: Static JSON files (`src/data/nodes.json`, `src/data/edges.json`)  
**Testing**: QUnit (browser-based, `tests/index.html`); `validate-data.ps1` for data integrity  
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Edge)  
**Project Type**: Single static web application  
**Performance Goals**: Graph renders within 5 seconds with expanded dataset  
**Constraints**: No Node.js (Bun 1.3.3 available); Wikidata SPARQL is free, rate-limited to 1 req/s with User-Agent; Constitution Principle VI requires amendment to cover Wikidata  
**Scale/Scope**: ~235–250 nodes, ~490+ edges after expansion

### External API: Wikidata SPARQL

- **Endpoint**: `https://query.wikidata.org/sparql`
- **License**: CC0 (public domain)
- **Rate limit**: Max 1 request/second, requires `User-Agent` header
- **Relevant properties**: P943 (game director), P57 (director), P86 (composer), P170 (creator), P162 (producer), P3080 (game designer)
- **Key entities**: Q122741 (Sega), Q7889 (video game)
- **Coverage**: 47 unique people found across 76 game–person relationships for Sega-published titles. After filtering non-game-creators (actors, film directors, unresolved QIDs), ~30 plausible candidates remain, of which ~15 are already in the graph → ~12–18 new creators

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Code Readability & Maintainability | ✅ PASS | Small UI addition for attribution. Enrichment script is standalone PowerShell. |
| II | User-Centric Design | ✅ PASS | Spec contains 3 user stories with acceptance scenarios and edge cases. |
| III | Test-Driven Quality Assurance | ✅ PASS | Data validated via `validate-data.ps1` and JSON schemas. Existing tests must pass. |
| IV | Consistent Code Standards | ✅ PASS | New nodes/edges follow existing schema. Edge labels use established past-tense verbs. |
| V | Performance & Accessibility | ✅ PASS | Adding ~12–18 nodes is marginal impact on 223-node graph. |
| VI | Wikipedia as Single Source of Truth | ⚠️ **VIOLATION** | Wikidata is a separate Wikimedia project, not Wikipedia. Structured credit relationships (P57, P86, etc.) have no Wikipedia equivalent. **Amendment required.** |

**Gate result**: **CONDITIONAL PASS** — Principle VI violation requires a constitution amendment before implementation. See Complexity Tracking below.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle VI: Wikidata as additional data source | Wikidata SPARQL provides structured game–person credit relationships (director, composer, producer, etc.) that cannot be extracted from Wikipedia prose. These are factual, CC0-licensed relationships within the Wikimedia ecosystem. | **Wikipedia-only**: Wikipedia articles don't systematically list all game credits in a structured, queryable format. Manual research was already done for 25 creators and can't scale further. **MobyGames API**: Credits data requires Gold tier at $4,999.99/month — unaffordable. **IGDB API**: Has no individual person credits, only `involved_companies`. **Sega Retro**: Bot-blocked by Anubis protection, cannot automate. |

### Proposed Constitution Amendment (v1.3.0)

Amend Principle VI to add a **structured data exception** alongside the existing media asset exception:

> **Structured data exception**: Factual, structured relationships (e.g., "Person X directed Game Y") MAY be sourced from Wikidata (wikidata.org) when the equivalent information is not available in structured form on Wikipedia. The data MUST be from the Wikimedia ecosystem (CC0 license). This exception applies solely to verifiable factual relationships — all descriptive text content (biographies, summaries, descriptions) remains Wikipedia-exclusive.

## Project Structure

### Documentation (this feature)

```text
specs/008-expand-creators/
├── plan.md              # This file
├── research.md          # Phase 0: Wikidata coverage analysis, creator vetting
├── data-model.md        # Phase 1: Creator node/edge additions
├── quickstart.md        # Phase 1: Setup and enrichment guide
├── contracts/           # Phase 1: Updated JSON schemas
│   ├── nodes.schema.json
│   └── edges.schema.json
├── checklists/
│   ├── requirements.md
│   └── data-governance.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── nodes.json       # PRIMARY: Add ~12–18 new creator nodes
│   └── edges.json       # PRIMARY: Add ~40+ new creator–game edges
├── js/
│   ├── app.js           # No change expected
│   ├── detail-panel.js  # No change expected (creator rendering exists)
│   ├── ego-graph.js     # No change expected
│   ├── filters.js       # No change expected
│   ├── graph.js         # No change expected
│   ├── icons.js         # No change expected
│   └── search.js        # No change expected
├── css/
│   └── styles.css       # MODIFY: Attribution footer styling (if needed)
└── index.html           # MODIFY: Add data attribution section

scripts/                 # NEW: Enrichment tooling
└── enrich-creators.ps1  # PowerShell script: Wikidata SPARQL → nodes/edges JSON

ATTRIBUTION.md           # NEW: Data source documentation
```

**Structure Decision**: Single static web app. This feature is primarily a data expansion (JSON files) with a small UI addition (attribution). A PowerShell enrichment script automates the Wikidata SPARQL queries and JSON generation.

## Constitution Check — Post-Design Re-evaluation

*Re-checked after Phase 1 design artifacts (data-model.md, contracts/, quickstart.md) are complete.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Code Readability & Maintainability | ✅ PASS | Enrichment script is standalone PowerShell with single responsibility. UI attribution is a small HTML/CSS addition. |
| II | User-Centric Design | ✅ PASS | 3 user stories with acceptance scenarios in spec. Data attribution serves user trust. |
| III | Test-Driven Quality Assurance | ✅ PASS | Data validated via `validate-data.ps1` and JSON schemas. Existing QUnit tests must pass. Script idempotency is verifiable by running twice. |
| IV | Consistent Code Standards | ✅ PASS | New nodes/edges follow identical schema (006 schemas carried forward, no changes). Edge labels use established past-tense verbs. Creator nodes use same format as existing 25 creators. |
| V | Performance & Accessibility | ✅ PASS | Adding ~20 nodes to a 223-node graph is marginal. Attribution uses semantic HTML. |
| VI | Wikipedia as Single Source of Truth | ⚠️ **VIOLATION — AMENDMENT REQUIRED** | Wikidata provides structured credit relationships not available from Wikipedia. Proposed amendment (v1.3.0) adds "structured data exception" analogous to existing media asset exception. All descriptive text remains Wikipedia-exclusive. |

**Post-design gate result**: **CONDITIONAL PASS** — Same as pre-design. Principle VI violation requires constitution amendment to v1.3.0 before implementation begins. The amendment is justified in the Complexity Tracking table above.
