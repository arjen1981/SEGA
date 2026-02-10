# Tasks: Random Ego-Graph Focus

**Input**: Design documents from `/specs/002-random-ego-focus/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included — Constitution III (Test-Driven Quality Assurance) is NON-NEGOTIABLE. Tests written before/alongside implementation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Extend existing project structure for the ego-graph feature

- [x] T001 Add "Expand All" button to header in src/index.html (next to search input, FR-015)
- [x] T002 [P] Add ego-graph CSS styles in src/css/styles.css (Expand All button, filter toolbar hidden state)
- [x] T003 [P] Register new test files in tests/index.html (ego-graph.test.js, ego-graph-integration.test.js)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core ego-graph module that ALL user stories depend on

**⚠️ CRITICAL**: US1, US2, and US3 all depend on this module existing

- [x] T004 [P] Write unit tests for pickRandomSpotlight in tests/unit/ego-graph.test.js (FR-001, FR-009: excludes company, returns valid node ID)
- [x] T005 [P] Write unit tests for neighborhood computation in tests/unit/ego-graph.test.js (FR-003: correct neighbor set, edge filtering, hidden+physics properties)
- [x] T006 [P] Write unit tests for getViewMode and getSpotlightId in tests/unit/ego-graph.test.js (mode transitions ego↔full, spotlightId null in full mode)
- [x] T007 Create ego-graph.js module skeleton with exports in src/js/ego-graph.js (initEgoGraph, applyEgoGraph, expandAll, getViewMode, getSpotlightId, pickRandomSpotlight per contracts/ego-graph-module-api.schema.json)
- [x] T008 Implement pickRandomSpotlight in src/js/ego-graph.js (filter non-company nodes, Math.random selection, FR-001 + FR-009)
- [x] T009 Implement initEgoGraph in src/js/ego-graph.js (store network reference, per research R7)

**Checkpoint**: ego-graph.js exists with random selection and initialization. Unit tests for pickRandomSpotlight pass.

---

## Phase 3: User Story 1 — Random Spotlight on Load (Priority: P1) 🎯 MVP

**Goal**: On page load, a random non-company node is centered with only its direct neighbors visible and detail panel open.

**Independent Test**: Open index.html — random node centered, only neighbors visible, detail panel open. Refresh for different node.

### Tests for User Story 1

- [x] T010 [P] [US1] Write unit test for applyEgoGraph in tests/unit/ego-graph.test.js (hides non-neighbors, shows neighborhood, sets hidden+physics on nodes, hides edges with non-visible endpoints)
- [x] T011 [P] [US1] Write integration test for page-load ego-graph in tests/integration/ego-graph-integration.test.js (verifies full flow: random select → filter → focus → detail panel)

### Implementation for User Story 1

- [x] T012 [US1] Implement applyEgoGraph(nodeId) in src/js/ego-graph.js (getConnectedNodes for neighbors, set hidden+physics on nodes, hide edges, focus camera, per research R1-R3-R6)
- [x] T013 [US1] Wire ego-graph into app.js init flow in src/js/app.js (import ego-graph, call initEgoGraph after createGraph, pickRandomSpotlight, applyEgoGraph, openDetailPanel on stabilization, per research R4)
- [x] T014 [US1] Hide filter toolbar on initial load in src/js/app.js (add CSS class to filter-toolbar element, FR-011)

**Checkpoint**: Page loads with random ego-graph spotlight. Unit + integration tests pass for US1.

---

## Phase 4: User Story 2 — Navigate from Spotlight to Neighbors (Priority: P2)

**Goal**: Click any visible neighbor node to shift the spotlight and see its neighborhood.

**Independent Test**: Click a neighbor — graph transitions, new neighborhood shown, detail panel updates.

### Tests for User Story 2

- [x] T015 [P] [US2] Write unit test for ego-graph navigation in tests/unit/ego-graph.test.js (applyEgoGraph called twice in sequence produces correct neighborhoods)
- [x] T016 [P] [US2] Write integration test for ego-graph navigation in tests/integration/ego-graph-integration.test.js (click neighbor → verify new ego-graph centered on clicked node)

### Implementation for User Story 2

- [x] T017 [US2] Update selectNode handler in src/js/app.js to call applyEgoGraph in ego mode (FR-005: click neighbor → new spotlight, animated transition FR-006, detail panel update)
- [x] T018 [US2] Update selectSuggestion in src/js/search.js to trigger applyEgoGraph instead of just focus (FR-012: search result → ego-graph mode on selected node)

**Checkpoint**: Ego-graph navigation works via click and search. US1 + US2 both functional.

---

## Phase 5: User Story 3 — Expand to Full Graph View (Priority: P3)

**Goal**: "Expand All" button reveals complete graph; clicking a node returns to ego mode.

**Independent Test**: Click "Expand All" — all nodes visible, filters appear. Click a node — back to ego mode.

### Tests for User Story 3

- [x] T019 [P] [US3] Write unit test for expandAll in tests/unit/ego-graph.test.js (all nodes unhidden, physics restored, mode = "full", spotlightId = null)
- [x] T020 [P] [US3] Write integration test for expand/collapse cycle in tests/integration/ego-graph-integration.test.js (ego → expand → click node → ego)

### Implementation for User Story 3

- [x] T021 [US3] Implement expandAll() in src/js/ego-graph.js (unhide all nodes+edges, restore physics, fit viewport with animation, per research R5)
- [x] T022 [US3] Wire "Expand All" button click handler in src/js/app.js (call expandAll, show filter toolbar, hide Expand All button, FR-007)
- [x] T023 [US3] Update selectNode handler to handle full-mode clicks in src/js/app.js (FR-008: click node in full mode → applyEgoGraph, hide filter toolbar, show Expand All button)
- [x] T024 [US3] Toggle "Expand All" button visibility based on view mode in src/js/app.js (visible in ego mode, hidden in full mode)

**Checkpoint**: Full ego↔full cycle works. All three user stories functional independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, accessibility, and validation across all user stories

- [x] T025 [P] Add ARIA attributes to "Expand All" button in src/index.html (aria-label, role)
- [x] T026 [P] Add keyboard support for "Expand All" button in src/js/app.js (Enter/Space triggers expand)
- [x] T027 Run Biome lint and format on all modified/new files (src/js/ego-graph.js, src/js/app.js, src/js/search.js, tests/)
- [x] T028 Run full QUnit test suite via tests/index.html (all unit + integration tests pass, no regressions from feature 001 tests)
- [x] T029 Run quickstart.md validation per specs/002-random-ego-focus/quickstart.md (manual: load page, verify random spotlight, navigate, expand, search-to-ego)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: T007-T009 can start in parallel with Phase 1. T004-T006 tests can be written in parallel.
- **US1 (Phase 3)**: Depends on T007-T009 (ego-graph.js skeleton + pickRandomSpotlight + initEgoGraph)
- **US2 (Phase 4)**: Depends on T012 (applyEgoGraph implementation from US1)
- **US3 (Phase 5)**: Depends on T012 (applyEgoGraph) and T017 (selectNode handler from US2)
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only → delivers MVP
- **US2 (P2)**: Depends on US1's applyEgoGraph (T012) → adds navigation
- **US3 (P3)**: Depends on US2's selectNode handler (T017) → adds expand/collapse cycle

### Within Each User Story

- Tests written FIRST → verify they FAIL
- Core module logic before wiring
- Wiring in app.js last (connects module to DOM events)

### Parallel Opportunities

- T001, T002, T003 all touch different files → run in parallel
- T004, T005, T006 all add test cases to same file but independent sections → can be written together
- T010, T011 touch different test files → run in parallel
- T015, T016 touch different test files → run in parallel
- T019, T020 touch different test files → run in parallel
- T025, T026 touch different files → run in parallel

---

## Parallel Example: US1 (Phase 3)

```
# Write tests in parallel (different files):
T010: Unit test for applyEgoGraph in tests/unit/ego-graph.test.js
T011: Integration test for page-load in tests/integration/ego-graph-integration.test.js

# Then implement sequentially:
T012: Implement applyEgoGraph in src/js/ego-graph.js
T013: Wire into app.js init flow
T014: Hide filter toolbar on load
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T009)
3. Complete Phase 3: US1 (T010-T014)
4. **STOP and VALIDATE**: Open page → random spotlight → neighbors visible → detail panel open
5. Deploy/demo if ready — ego-graph works but no navigation or expand

### Incremental Delivery

1. Setup + Foundational → ego-graph.js module ready
2. Add US1 → Test independently → Random spotlight on load (MVP!)
3. Add US2 → Test independently → Click-to-navigate between nodes
4. Add US3 → Test independently → Expand All / collapse cycle
5. Polish → Biome clean, QUnit pass, a11y, quickstart validated
6. Each story adds value without breaking previous stories
