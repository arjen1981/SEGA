# Implementation Plan: Major SEGA Arcade Data Expansion

**Branch**: `feature/006-expand-sega-arcade-data` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/feature/006-expand-sega-arcade-data/spec.md`

## Summary

Massively expand the SEGA arcade graph dataset from 140 nodes / 296 edges to 230+ nodes / 500+ edges without any code changes. Add 60+ new games spanning SEGA's full arcade history (1966 EM games through 2018 modern arcade), additional creators, studios, and platforms — all sourced exclusively from Wikipedia per Constitution Principle VI. The 200-node performance cap from spec 004 is explicitly lifted by the user.

## Technical Context

**Language/Version**: Static HTML/CSS/JS — no build step, no transpilation  
**Primary Dependencies**: vis-network 9.1.9 (CDN), no npm/node  
**Storage**: Two JSON files: `src/data/nodes.json`, `src/data/edges.json`  
**Testing**: QUnit (browser-based, `tests/index.html`)  
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Edge)  
**Project Type**: Single static web application  
**Performance Goals**: Graph renders and stabilizes within 5 seconds with 230+ nodes  
**Constraints**: No Node.js or Python on dev machine; PowerShell for validation. Wikipedia-only data sourcing (Constitution VI, NON-NEGOTIABLE).  
**Scale/Scope**: ~230+ nodes, ~500+ edges. Data-only expansion — zero code changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Readability | ✅ N/A | No code changes — data-only expansion |
| II. User-Centric Design | ✅ PASS | More content = richer exploration. User explicitly requested maximum expansion. |
| III. Test-Driven QA (NON-NEGOTIABLE) | ⚠️ CONDITIONAL | No new code → no new unit tests needed. Existing tests must still pass. Data integrity validated via PowerShell (no broken edges, no duplicate IDs). |
| IV. Consistent Code Standards | ✅ PASS | JSON data follows established schema from spec 004. No new patterns introduced. |
| V. Performance & Accessibility | ⚠️ NOTE | 200-node limit explicitly lifted by user. vis-network should handle 230+ nodes on modern hardware; verify manually after expansion. |
| VI. Wikipedia Source of Truth (NON-NEGOTIABLE) | ✅ PASS | Every new node requires a valid `wikipediaUrl`. This is the primary content gate. |

**Gate result: PASS** — No violations. Conditional items (III, V) addressed by data validation scripts and manual verification.

## Project Structure

### Documentation (this feature)

```text
specs/feature/006-expand-sega-arcade-data/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: catalog of games/creators/platforms to add
├── data-model.md        # Phase 1: node/edge additions
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: updated JSON schemas
│   ├── nodes.schema.json
│   └── edges.schema.json
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── nodes.json       # MODIFIED: 140 → 230+ nodes
│   └── edges.json       # MODIFIED: 296 → 500+ edges
├── index.html           # UNCHANGED
├── css/styles.css       # UNCHANGED
└── js/                  # UNCHANGED (all .js files)

tests/                   # UNCHANGED (all test files)
```

**Structure Decision**: No structural changes. This is purely a data expansion — only `nodes.json` and `edges.json` are modified.

## Complexity Tracking

No constitution violations to justify. This is a data-only feature with no architectural complexity.
