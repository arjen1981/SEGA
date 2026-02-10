# Implementation Plan: Random Ego-Graph Focus

**Branch**: `002-random-ego-focus` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-random-ego-focus/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extend the existing SEGA Arcade Graph application so that on every page load, a random non-company node is spotlighted: centered in the graph with only its direct neighbors visible and its detail panel open. Users explore by clicking neighbors to shift the spotlight (ego-graph navigation), or click "Expand All" to reveal the full graph. A new `ego-graph.js` module manages the spotlight state and neighborhood filtering using the proven vis.DataSet `hidden` property pattern from `filters.js`.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+) — no build step required  
**Primary Dependencies**: vis-network v10 (CDN: unpkg, already loaded)  
**Storage**: N/A — all new state is runtime-only (in-memory); existing JSON data unchanged  
**Testing**: QUnit v2.25 (CDN, browser-based test runner — already configured)  
**Linting**: Biome v2.3.14 (standalone binary at project root — already configured)  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge); static file hosting  
**Project Type**: single — static web application (extending feature 001)  
**Performance Goals**: Ego-graph displayed within 3s of page load (SC-001); spotlight navigation within 1s (SC-002); expand to full graph within 2s (SC-003)  
**Constraints**: No server-side processing; no npm/Node.js runtime; ego-graph views show 2–20 nodes on average (SC-005)  
**Scale/Scope**: 93 nodes, 156 edges (unchanged from feature 001)

## Constitution Check (Pre-Research)

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Code Readability & Maintainability | ✅ PASS | New `ego-graph.js` module has single responsibility (spotlight state + neighborhood filtering). Existing modules extended minimally. Clear function names: `applyEgoGraph`, `expandAll`, `pickRandomSpotlight`. |
| II. User-Centric Design | ✅ PASS | 3 user stories with acceptance criteria defined in spec. Edge cases documented. Clarifications resolved (filter visibility, search behavior, button placement, legend visibility, mode return). |
| III. Test-Driven Quality Assurance | ✅ PASS | New `ego-graph.test.js` unit tests + integration test planned. Tests cover: random selection excludes company, neighborhood computation, expand all, mode transitions. QUnit already configured. |
| IV. Consistent Code Standards | ✅ PASS | Same Biome config, same ES6 module pattern, same JSDoc style as feature 001. New module follows identical export/import conventions. |
| V. Performance & Accessibility | ✅ PASS | Performance targets defined (SC-001 through SC-003). Ego-graph reduces visible nodes to 2–20 (faster rendering than full 93-node graph). "Expand All" button has accessible label. Filter toolbar hidden via CSS class (not DOM removal) for instant restoration. |
| VI. Wikipedia as Single Source of Truth | ✅ PASS | No new data introduced. All node data continues to come from Wikipedia-sourced nodes.json. Detail panel rendering unchanged. |

**Gate Result**: ✅ PASS — all 6 principles satisfied; no NEEDS CLARIFICATION items remain.

## Constitution Check (Post-Design)

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Code Readability & Maintainability | ✅ PASS | Research R7 confirms ego-graph.js as separate module with 6 exported functions. No god-function — each function has a single purpose. |
| II. User-Centric Design | ✅ PASS | Data model state transitions document all user flows. Quickstart provides clear run/test instructions. |
| III. Test-Driven Quality Assurance | ✅ PASS | Contract schema defines testable API surface. Test file list in quickstart.md. |
| IV. Consistent Code Standards | ✅ PASS | Module API contract follows same pattern as existing modules (init, action, getter). |
| V. Performance & Accessibility | ✅ PASS | Research R3 identifies physics-on-hidden-nodes issue and solution (set `physics: false`). This ensures clean layout. |
| VI. Wikipedia as Single Source of Truth | ✅ PASS | No new data sources. |

**Gate Result**: ✅ PASS — no violations introduced by design decisions.

## Project Structure

### Documentation (this feature)

```text
specs/002-random-ego-focus/
├── plan.md              # This file
├── research.md          # Phase 0 output — vis-network API research
├── data-model.md        # Phase 1 output — runtime state model
├── quickstart.md        # Phase 1 output — run/test instructions
├── contracts/           # Phase 1 output — JSON schemas
│   ├── ego-graph-state.schema.json
│   └── ego-graph-module-api.schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.html           # Modified: add "Expand All" button in header
├── css/
│   └── styles.css       # Modified: "Expand All" button styles, filter toolbar hidden state
├── js/
│   ├── app.js           # Modified: wire ego-graph into init flow, update selectNode handler
│   ├── ego-graph.js     # NEW: ego-graph state, neighborhood filtering, random selection
│   ├── graph.js         # Unchanged
│   ├── detail-panel.js  # Unchanged
│   ├── filters.js       # Unchanged (filter toolbar hidden/shown via CSS in app.js)
│   └── search.js        # Modified: selectSuggestion triggers ego-graph navigation
└── data/
    ├── nodes.json       # Unchanged
    └── edges.json       # Unchanged

tests/
├── unit/
│   └── ego-graph.test.js          # NEW: unit tests for ego-graph module
├── integration/
│   └── ego-graph-integration.test.js  # NEW: integration test for ego-graph flow
└── index.html           # Modified: add new test file references
```

**Structure Decision**: Follows the same single-project layout from feature 001. One new JS module (`ego-graph.js`) added alongside existing modules. Two new test files follow the existing unit/integration split.
