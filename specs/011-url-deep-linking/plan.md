# Implementation Plan: URL-Based Deep Linking

**Branch**: `011-url-deep-linking` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-url-deep-linking/spec.md`

## Summary

Add URL hash-based deep linking so users can share direct links to specific graph nodes (e.g., `#node=virtua-fighter`). On load, the app reads the hash and navigates to that node; on node selection, the hash updates. Browser back/forward navigation is supported. Invalid hashes fall back gracefully with a brief notification.

## Technical Context

**Language/Version**: Vanilla JavaScript (ES2015+), ES modules via browser `type="module"`  
**Primary Dependencies**: vis-network v10 (CDN), Biome (dev linter)  
**Storage**: N/A (static JSON data files, no server-side state)  
**Testing**: QUnit 2.25.0 (CDN), unit + integration tests  
**Target Platform**: Static HTML site, served via PowerShell dev server on localhost:8080  
**Project Type**: Single static web app — no build step  
**Performance Goals**: Hash updates must not cause page reloads; node focus must appear within 200ms of load  
**Constraints**: Zero additional runtime dependencies; no build pipeline changes  
**Scale/Scope**: ~100 nodes, single-user browser app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Readability & Maintainability | PASS | New deep-link module will have single responsibility; clear naming |
| II. User-Centric Design | PASS | Feature starts from user scenarios (sharing links); error messages in plain language |
| III. Test-Driven Quality (NON-NEGOTIABLE) | PASS | Unit tests for hash parsing/writing + integration test for navigation flow |
| IV. Consistent Code Standards | PASS | Follows existing ES module pattern; Biome linting enforced |
| V. Performance & Accessibility | PASS | No performance regression — hash changes are synchronous; no new UI elements requiring a11y beyond notification |
| VI. Wikipedia as Single Source of Truth (NON-NEGOTIABLE) | N/A | Feature does not introduce or modify any data content |

**Gate Result**: PASS — no violations.

### Post-Design Re-Check

| Principle | Status | Post-Design Notes |
|-----------|--------|-------------------|
| I. Code Readability | PASS | Single new module `deep-link.js` with 3 exports; single responsibility |
| II. User-Centric Design | PASS | Toast notification for invalid nodes uses plain language; auto-dismisses |
| III. Test-Driven Quality | PASS | Unit + integration tests planned covering happy paths, edge cases, errors |
| IV. Consistent Code Standards | PASS | Follows existing ES module pattern; Biome linting applies |
| V. Performance & Accessibility | PASS | Hash ops are synchronous; toast uses `aria-live="polite"` |
| VI. Wikipedia SSOT | N/A | No data content changes |

**Post-Design Gate Result**: PASS — no violations or complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/011-url-deep-linking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── index.html           # Existing — no changes needed (modules loaded via type="module")
├── css/
│   └── styles.css       # Add toast notification styles
├── js/
│   ├── app.js           # Modify init flow: integrate deep-link module, conditional spotlight
│   ├── deep-link.js     # NEW — hash read/write, hashchange listener, navigation logic
│   ├── detail-panel.js  # Existing — no changes (already exports openDetailPanel/closeDetailPanel)
│   ├── ego-graph.js     # Existing — no changes (already exports applyEgoGraph/resetEgoGraph)
│   ├── graph.js         # Existing — getNetwork() used for focus/viewport centering
│   ├── filters.js       # Existing — no changes
│   ├── search.js        # Existing — no changes
│   └── icons.js         # Existing — no changes
└── data/
    └── (unchanged)

tests/
├── unit/
│   └── deep-link.test.js  # NEW — unit tests for hash parsing, URL updates, invalid hash handling
└── integration/
    └── deep-link-integration.test.js  # NEW — integration tests for navigation flow
```

**Structure Decision**: Single new module `deep-link.js` following the existing pattern of one-file-per-concern. All integration happens in `app.js` where the init flow is wired.
