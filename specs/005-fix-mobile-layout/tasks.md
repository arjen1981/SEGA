# Tasks: Fix Mobile Layout & Detail Panel

**Feature**: `005-fix-mobile-layout` | **Date**: 2026-02-19

## Phase 1: Setup & Foundation

- [x] T101 — Read and understand spec, plan, research, quickstart docs
- [x] T102 — Verify both checklists pass (requirements.md 12/12, mobile.md 32/32)
- [x] T103 — Verify .gitignore contains required patterns

## Phase 2: CSS — Bottom Sheet Layout

- [x] T201 — Add mobile bottom sheet rules inside `@media (max-width: 767px)` block in `styles.css`
  - Override `.detail-panel`: `top: auto; bottom: 0; left: 0; right: 0; width: 100vw; height: 60vh; height: 60dvh; max-height: calc(100vh - 110px); transform: translateY(100%); border-left: none; border-top: 1px solid var(--color-border); overflow-y: auto; overscroll-behavior: contain`
  - Override `.detail-panel.open`: `transform: translateY(0)`
- [x] T202 — Add mobile close button tap target (44×44px minimum) inside `@media (max-width: 767px)` (FR-013)
- [x] T203 — Add `prefers-reduced-motion: reduce` rule to suppress bottom sheet animation (FR-014)
  - Inside existing `@media (prefers-reduced-motion: reduce)` block: `.detail-panel { transition: none; }`

## Phase 3: JavaScript — Mobile-Aware Centering

- [x] T301 — Add `mobileQuery` and `isMobile()` helper to `ego-graph.js`
  - `const mobileQuery = window.matchMedia("(max-width: 767px)");`
  - `function isMobile() { return mobileQuery.matches; }`
- [x] T302 — Update `getPanelOffset()` in `ego-graph.js` to return `{ x, y }` object
  - Desktop: `{ x: -panelWidth / 2, y: 0 }` (existing behavior)
  - Mobile + sheet open: `{ x: 0, y: -sheetHeight / 2 }` (center above sheet)
  - Mobile + sheet closed: `{ x: 0, y: 0 }` (center in full viewport)
- [x] T303 — Update `applyEgoGraph()` to use new `{ x, y }` offset from `getPanelOffset()`
- [x] T304 — Update `expandAll()` to use mobile-aware offset (skip horizontal offset on mobile)
- [x] T305 — Add `CustomEvent("detail-panel-closed")` dispatch in `closeDetailPanel()` in `detail-panel.js`
- [x] T306 — Add `aria-expanded` attribute management in `openDetailPanel()` and `closeDetailPanel()` in `detail-panel.js` (FR-015)
- [x] T307 — Add `"detail-panel-closed"` event listener in `ego-graph.js` for re-centering
- [x] T308 — Add debounced resize listener (250ms) + matchMedia change listener in `ego-graph.js` for orientation/resize re-centering

## Phase 4: Tests

- [x] T401 — Add mobile offset unit tests to `ego-graph.test.js`
  - Test `getPanelOffset()` returns `{ x, y }` object
  - Test mobile detection scenarios

## Phase 5: Validation

- [x] T501 — Run `biome check --write` for formatting/lint
- [x] T502 — Run QUnit test suite and verify all pass
- [x] T503 — Mark all tasks complete and commit
