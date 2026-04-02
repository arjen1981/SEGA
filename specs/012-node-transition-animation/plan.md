# Implementation Plan: Node Transition Animation

**Branch**: `012-node-transition-animation` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-node-transition-animation/spec.md`

## Summary

Add a smooth animated transition when navigating between ego-graphs. Instead of the current abrupt node-swap, the camera performs a single continuous move (with a slight zoom dip mid-transit) from the old spotlight to the new spotlight. Departing nodes/edges fade out via opacity and arriving nodes/edges fade in, while shared nodes remain stable. The animation completes in 600ms, supports cancel-and-replace on rapid clicks, respects `prefers-reduced-motion`, and preserves the identical end state as the current `applyEgoGraph`.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2015+), ES modules via browser `type="module"`  
**Primary Dependencies**: vis-network v10 (CDN), Biome (dev linter)  
**Storage**: N/A (static JSON data files, no server-side state)  
**Testing**: QUnit 2.25.0 (CDN), unit + integration tests  
**Target Platform**: Static HTML site, served via PowerShell dev server on localhost:8080  
**Project Type**: Single static web app — no build step  
**Performance Goals**: Transition animation at 60 fps; 600ms fixed duration; visual feedback within 200ms of click  
**Constraints**: Zero additional runtime dependencies; no build pipeline changes; canvas-based rendering (vis.js owns the canvas)  
**Scale/Scope**: ~100 nodes, single-user browser app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Readability & Maintainability | PASS | Animation logic encapsulated in ego-graph.js with clear separation from existing spotlight logic |
| II. User-Centric Design | PASS | Feature starts from user scenario (jarring transition → smooth experience); edge cases and reduced-motion documented |
| III. Test-Driven Quality (NON-NEGOTIABLE) | PASS | Unit tests for transition state management + integration tests for animation flow; cancel-and-replace tested |
| IV. Consistent Code Standards | PASS | Follows existing ES module pattern in ego-graph.js; Biome linting enforced |
| V. Performance & Accessibility | PASS | 600ms transition meets 200ms feedback threshold (camera starts moving immediately); `prefers-reduced-motion` respected (FR-007) |
| VI. Wikipedia as Single Source of Truth (NON-NEGOTIABLE) | N/A | Feature does not introduce or modify any data content |

**Gate Result**: PASS — no violations.

### Post-Design Re-Check

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Code Readability | PASS | All animation logic stays in `ego-graph.js`; rAF loop has single responsibility (interpolation); helper functions have clear names |
| II. User-Centric Design | PASS | Smooth transition solves user-reported jarring switch; reduced motion honored; cancel-and-replace prevents blocking |
| III. Test-Driven Quality | PASS | Unit tests for state computation + integration tests for animation flow; cancel and edge case coverage planned |
| IV. Consistent Code Standards | PASS | Uses existing patterns: `matchMedia` for reduced motion (same as mobile detection), DataSet updates (same as current ego-graph), Biome enforced |
| V. Performance & Accessibility | PASS | 600ms animation starts immediately on click (<200ms feedback); 60 fps target on ~100 nodes; `prefers-reduced-motion` fully respected; `opacity` updates are lightweight |
| VI. Wikipedia SSOT | N/A | No data content changes |

**Post-Design Gate Result**: PASS — no violations or complexity tracking needed.

### Documentation (this feature)

```text
specs/012-node-transition-animation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no API contracts for this feature)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.html           # Existing — no changes needed
├── css/
│   └── styles.css       # Existing — no changes (canvas-rendered, not CSS)
├── js/
│   ├── app.js           # Existing — no changes (applyEgoGraph call sites unchanged)
│   ├── ego-graph.js     # MODIFIED — add transition animation logic to applyEgoGraph
│   ├── detail-panel.js  # Existing — no changes
│   ├── deep-link.js     # Existing — no changes
│   ├── graph.js         # Existing — no changes
│   ├── filters.js       # Existing — no changes
│   ├── search.js        # Existing — no changes
│   └── icons.js         # Existing — no changes
└── data/
    ├── nodes.json       # Existing — no changes
    └── edges.json       # Existing — no changes

tests/
├── unit/
│   └── ego-graph.test.js       # MODIFIED — add transition-specific unit tests
└── integration/
    └── ego-graph-integration.test.js  # MODIFIED — add transition animation integration tests
```

**Structure Decision**: Single static web app. All animation logic lives in the existing `ego-graph.js` module — no new source files needed. The `applyEgoGraph` function already orchestrates node visibility and camera focus; the transition animation extends this with a `requestAnimationFrame` loop for opacity interpolation and a coordinated `network.moveTo()` sequence.
