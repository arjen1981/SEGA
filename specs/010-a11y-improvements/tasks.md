# Tasks: Accessibility Improvements

**Input**: Design documents from `/specs/010-a11y-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/aria-contracts.schema.json, quickstart.md

**Tests**: Included — Constitution Principle III (TDD, NON-NEGOTIABLE) requires tests written first and failing before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add ARIA infrastructure to HTML markup shared by both user stories

- [x] T001 Add `role="combobox"`, `aria-expanded="false"`, `aria-controls="search-suggestions"`, and `aria-activedescendant=""` attributes to the search input element in `src/index.html`
- [x] T002 Add `aria-live="polite"` attribute to the `#detail-content` div in `src/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS and render-function changes that both user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `.search-suggestion-item.highlighted` CSS class (matching existing `:hover` style: `background-color: rgba(0, 68, 255, 0.1)`) in `src/css/styles.css`
- [x] T004 Update `renderSuggestions()` in `src/js/app.js` to assign each suggestion item an `id` attribute in the format `search-suggestion-{index}` (0-based) and set `aria-selected="false"` on each item
- [x] T005 Update `renderSuggestions()` in `src/js/app.js` to set `aria-expanded` on `#search-input` to `"true"` when suggestions are rendered and `"false"` when the list is cleared or hidden

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Keyboard Navigation for Search Suggestions (Priority: P1) 🎯 MVP

**Goal**: Keyboard-only users can navigate, select, and dismiss search suggestions using Arrow Down, Arrow Up, Enter, and Escape keys following the WAI-ARIA Combobox pattern.

**Independent Test**: Tab to search input, type a query, use arrow keys to navigate suggestions, Enter to select, Escape to dismiss — all without a mouse.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T006 [P] [US1] Add test: Arrow Down from no highlight selects first suggestion in `tests/unit/search.test.js`
- [x] T007 [P] [US1] Add test: Arrow Down moves highlight to next suggestion in `tests/unit/search.test.js`
- [x] T008 [P] [US1] Add test: Arrow Down on last suggestion wraps to first in `tests/unit/search.test.js`
- [x] T009 [P] [US1] Add test: Arrow Up moves highlight to previous suggestion in `tests/unit/search.test.js`
- [x] T010 [P] [US1] Add test: Arrow Up on first suggestion wraps to last in `tests/unit/search.test.js`
- [x] T011 [P] [US1] Add test: Enter with highlighted suggestion selects it (focuses graph, opens detail panel, closes dropdown) in `tests/unit/search.test.js`
- [x] T012 [P] [US1] Add test: Enter with no highlight active does nothing in `tests/unit/search.test.js`
- [x] T013 [P] [US1] Add test: Escape closes dropdown and keeps focus on search input in `tests/unit/search.test.js`
- [x] T014 [P] [US1] Add test: typing new characters resets highlight to -1 in `tests/unit/search.test.js`
- [x] T015 [P] [US1] Add test: `aria-activedescendant` updates to highlighted item ID on arrow navigation in `tests/unit/search.test.js`
- [x] T016 [P] [US1] Add test: `aria-selected="true"` is set on the highlighted item and `"false"` on all others in `tests/unit/search.test.js`
- [x] T017 [P] [US1] Add test: Arrow Down with empty suggestion list does nothing in `tests/unit/search.test.js`
- [x] T018 [P] [US1] Add test: single-item list — Arrow Down and Arrow Up keep the same item highlighted in `tests/unit/search.test.js`

### Implementation for User Story 1

- [x] T019 [US1] Add `highlightIndex` state variable (default `-1`) and helper functions `updateHighlight(index)` to apply/remove `.highlighted` class, update `aria-selected`, and set `aria-activedescendant` on the input in `src/js/app.js`
- [x] T020 [US1] Implement Arrow Down / Arrow Up key handling in the existing `keydown` listener on `#search-input` in `src/js/app.js`: increment/decrement `highlightIndex` with wrap-around, call `updateHighlight()`
- [x] T021 [US1] Implement Enter key handling in the `keydown` listener in `src/js/app.js`: if `highlightIndex >= 0`, call `selectSuggestion()` with the highlighted node, close dropdown, reset `highlightIndex` to `-1`; if `highlightIndex === -1`, do nothing
- [x] T022 [US1] Implement Escape key handling in the `keydown` listener in `src/js/app.js`: hide suggestion list, reset `highlightIndex` to `-1`, keep focus on `#search-input`
- [x] T023 [US1] Reset `highlightIndex` to `-1` and clear `aria-activedescendant` on every `input` event in the existing input listener in `src/js/app.js`
- [x] T024 [US1] Verify all T006–T018 keyboard navigation tests pass in `tests/unit/search.test.js`

**Checkpoint**: User Story 1 is fully functional — keyboard-only search navigation works end-to-end

---

## Phase 4: User Story 2 — Screen Reader Announcements for Detail Panel (Priority: P2)

**Goal**: Screen reader users are automatically informed when the detail panel content changes (opens, updates, or closes) via `aria-live` announcements.

**Independent Test**: Enable a screen reader, click different nodes — screen reader announces entity name each time. Click same node twice — no re-announcement. Close panel — "Detail panel closed" announced.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T025 [P] [US2] Add test: opening detail panel sets announcement text containing entity name in `tests/unit/detail-panel.test.js`
- [x] T026 [P] [US2] Add test: updating detail panel with a different node announces new entity name in `tests/unit/detail-panel.test.js`
- [x] T027 [P] [US2] Add test: selecting the same node consecutively does NOT re-announce (duplicate suppression) in `tests/unit/detail-panel.test.js`
- [x] T028 [P] [US2] Add test: closing detail panel announces "Detail panel closed" in `tests/unit/detail-panel.test.js`

### Implementation for User Story 2

- [x] T029 [US2] Add `lastAnnouncedNodeId` module-level variable (default `null`) to `src/js/detail-panel.js`
- [x] T030 [US2] Update `openDetailPanel()` in `src/js/detail-panel.js` to: compare `nodeId` with `lastAnnouncedNodeId`; if different, set a visually-hidden status span inside `#detail-content` with announcement text (e.g., "Showing details for {entity name}") and update `lastAnnouncedNodeId`; if same, suppress announcement
- [x] T031 [US2] Update `closeDetailPanel()` in `src/js/detail-panel.js` to: set the `#detail-content` text to "Detail panel closed" (triggering the `aria-live` announcement) and reset `lastAnnouncedNodeId` to `null`
- [x] T032 [US2] Verify all T025–T028 aria-live tests pass in `tests/unit/detail-panel.test.js`

**Checkpoint**: User Stories 1 AND 2 are both independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation, regression, and cleanup

- [x] T033 Run Biome lint check (`npx @biomejs/biome check src/ tests/`) and fix any violations
- [x] T034 Run full QUnit test suite in browser (`http://localhost:8080/tests/`) and verify zero regressions
- [x] T035 Run quickstart.md manual testing checklist (keyboard navigation, screen reader, mouse regression)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (HTML ARIA attributes must be in place)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (`renderSuggestions()` IDs, `aria-expanded`, CSS highlight class)
- **User Story 2 (Phase 4)**: Depends on Phase 1 only (`aria-live` attribute on `#detail-content`). Can run in parallel with US1 after Phase 2
- **Polish (Phase 5)**: Depends on Phases 3 and 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Requires Foundational phase. No dependency on US2. **MVP candidate.**
- **User Story 2 (P2)**: Requires only Phase 1 setup (`aria-live` attribute). Independent of US1 — can be developed in parallel.

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks are sequential within each story (state → handlers → integration)
- All tests for a story marked [P] can be written in parallel

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel [P] (different attributes on different elements in same file, but logically independent)
- **Phase 3 tests**: T006–T018 can ALL be written in parallel (all in same file but independent test cases)
- **Phase 4 tests**: T025–T028 can ALL be written in parallel
- **Phase 3 & Phase 4**: After Phase 2, US1 and US2 can be developed in parallel by different agents/developers

---

## Parallel Example: User Story 1

```text
# Write all keyboard navigation tests in parallel:
T006: Arrow Down from no highlight → first suggestion
T007: Arrow Down moves to next
T008: Arrow Down wraps at end
T009: Arrow Up moves to previous
T010: Arrow Up wraps at start
T011: Enter selects highlighted
T012: Enter with no highlight = no-op
T013: Escape closes dropdown
T014: Typing resets highlight
T015: aria-activedescendant updates
T016: aria-selected updates
T017: Arrow Down on empty list = no-op
T018: Single-item list wrap

# Then implement sequentially:
T019: highlightIndex state + updateHighlight helper
T020: Arrow key handlers
T021: Enter handler
T022: Escape handler
T023: Input event reset
T024: Verify all tests pass
```

---

## Parallel Example: User Story 2

```text
# Write all aria-live tests in parallel:
T025: Opening panel announces entity name
T026: Updating panel announces new entity
T027: Same node = no re-announcement
T028: Closing panel announces "closed"

# Then implement sequentially:
T029: lastAnnouncedNodeId state
T030: openDetailPanel() announcement logic
T031: closeDetailPanel() announcement logic
T032: Verify all tests pass
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (add ARIA attributes to HTML)
2. Complete Phase 2: Foundational (CSS highlight class, suggestion IDs, aria-expanded)
3. Complete Phase 3: User Story 1 (keyboard navigation)
4. **STOP and VALIDATE**: Test keyboard-only search flow end-to-end
5. Delivers: WCAG 2.1 Level A compliant keyboard navigation for search

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Add User Story 1 → Test independently → Keyboard-accessible search (MVP!)
3. Add User Story 2 → Test independently → Screen reader announcements
4. Each story adds accessibility value without breaking previous functionality

### Parallel Team Strategy

With two developers:

1. Both complete Phase 1 + Phase 2 together
2. Once Foundational is done:
   - Developer A: User Story 1 (keyboard navigation in `app.js`)
   - Developer B: User Story 2 (aria-live in `detail-panel.js`)
3. No file conflicts — US1 modifies `app.js` + `search.test.js`, US2 modifies `detail-panel.js` + `detail-panel.test.js`

---

## Notes

- [P] tasks = different files or independent test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- All source changes are in existing files — no new JS modules needed
- Tests use QUnit 2.25.0 (browser-based, CDN-loaded)
- Keyboard highlight state uses `aria-activedescendant` pattern (focus stays on input)
- CSS highlight style mirrors existing `:hover` style for visual consistency
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
