# Implementation Plan: Fix Ego-Graph Physics Jank

**Branch**: `009-fix-bugs-techdebt` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-fix-bugs-techdebt/spec.md`

## Summary

Fix the ego-graph physics jank by preventing unconditional `network.setOptions({ physics: ... })` calls on every ego-graph transition. The fix tracks current physics state (enabled status + viewport type) and only applies `setOptions` when the configuration actually needs to change. Additionally, implement cancel-and-replace for `stabilized` event handlers and add a same-node early return with camera re-center.

## Technical Context

**Language/Version**: JavaScript ES2020+ (vanilla, no build step)
**Primary Dependencies**: vis-network 10 (CDN)
**Storage**: N/A (static site, no backend)
**Testing**: QUnit (browser-based, served via serve.ps1)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), desktop + mobile
**Project Type**: Single static web application
**Performance Goals**: Smooth 60fps transitions when clicking through ego-graph nodes; no visible jitter during rapid navigation (5 clicks in 3 seconds)
**Constraints**: No build tools, no npm runtime dependencies, CDN-only for vis-network
**Scale/Scope**: ~150 nodes, ~200 edges, single-file module change (ego-graph.js)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Readability & Maintainability | PASS | Change is isolated to ego-graph.js; adds state tracking variables with clear naming |
| II. User-Centric Design | PASS | Spec has user scenarios with acceptance criteria; fix directly improves UX |
| III. Test-Driven Quality (NON-NEGOTIABLE) | PASS | Existing tests must pass unchanged; new tests will cover physics state tracking and same-node click |
| IV. Consistent Code Standards | PASS | Uses same patterns as rest of codebase (module-level state, JSDoc, Biome formatting) |
| V. Performance & Accessibility | PASS | This fix IS a performance improvement (eliminates redundant physics re-layout); no accessibility impact |
| VI. Wikipedia as Single Source of Truth (NON-NEGOTIABLE) | N/A | No data changes in this feature |

**Gate result: PASS** — no violations.

**Post-Phase 1 re-check (2026-03-24)**: PASS — design adds 3 module-level variables with clear naming (I), includes new test coverage (III), follows existing codebase patterns (IV), directly improves performance (V). No new concerns.

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-bugs-techdebt/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no data model changes)
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
└── js/
    └── ego-graph.js     # Primary file modified (physics state tracking)

tests/
├── unit/
│   └── ego-graph.test.js        # Add tests for physics skip + same-node click
└── integration/
    └── ego-graph-integration.test.js  # Add rapid navigation test
```

**Structure Decision**: Single static project. Only `src/js/ego-graph.js` is modified. Tests are added to existing test files.
