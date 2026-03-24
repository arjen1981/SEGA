# Implementation Plan: Accessibility Improvements

**Branch**: `010-a11y-improvements` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-a11y-improvements/spec.md`

## Summary

Add keyboard navigation (Arrow Up/Down, Enter, Escape) to the search suggestion dropdown following the WAI-ARIA Combobox pattern, and add an `aria-live="polite"` region to the detail panel so screen readers announce content changes automatically. Both changes target WCAG 2.1 Level A compliance for existing UI components.

## Technical Context

**Language/Version**: JavaScript ES2020+ (vanilla, no framework, no build step)
**Primary Dependencies**: vis-network 10 (CDN), QUnit 2.25.0 (CDN)
**Storage**: N/A (static JSON files)
**Testing**: QUnit (browser-based, served via PowerShell `serve.ps1` on port 8080)
**Target Platform**: Modern browsers (desktop + mobile)
**Project Type**: Single static web application
**Performance Goals**: Visual feedback within 200 ms of keyboard interaction (Constitution V)
**Constraints**: No build step, no NPM runtime dependencies, CDN-only external libs
**Scale/Scope**: ~150 nodes, ~200 edges, single-page application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Code Readability & Maintainability | PASS | Keyboard logic will be a focused addition to `app.js`; functions have single responsibility |
| II | User-Centric Design | PASS | User scenarios and acceptance criteria defined in spec before implementation |
| III | Test-Driven Quality Assurance (NON-NEGOTIABLE) | PASS | Tests will cover keyboard navigation and aria-live behavior |
| IV | Consistent Code Standards | PASS | Will follow existing event-listener and QUnit patterns |
| V | Performance & Accessibility | PASS | This feature directly improves accessibility (WCAG 2.1 AA); no performance regression expected |
| VI | Wikipedia as Single Source of Truth (NON-NEGOTIABLE) | N/A | No data content changes; purely UI/a11y |

All gates PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/010-a11y-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── index.html           # Search input + detail panel markup (ARIA attributes)
├── css/
│   └── styles.css       # Suggestion highlight styles, focus indicators
└── js/
    ├── app.js           # Keyboard handler, renderSuggestions(), ARIA wiring
    ├── search.js         # searchNodes(), selectSuggestion() — no changes expected
    └── detail-panel.js  # openDetailPanel(), closeDetailPanel() — aria-live wiring

tests/
├── unit/
│   ├── search.test.js        # Keyboard navigation tests (new)
│   └── detail-panel.test.js  # Aria-live announcement tests (new)
└── integration/
    └── (no new integration tests expected)
```

**Structure Decision**: Single project structure. All changes are in existing files — no new JS modules needed. Keyboard navigation logic is added to `app.js` (where search wiring already lives). Aria-live changes go in `detail-panel.js` and `index.html`.

## Complexity Tracking

> No violations. Table not needed.
