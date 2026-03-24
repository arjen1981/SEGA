# Tasks: Fix Ego-Graph Physics Jank

**Input**: Design documents from `/specs/009-fix-bugs-techdebt/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — the plan.md explicitly requires new test coverage for physics state tracking and same-node click behavior, and FR compliance requires existing tests to pass unchanged (SC-004).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: No new project structure needed — this feature modifies a single existing module. Setup ensures the working environment is ready.

- [x] T001 Verify dev server starts and existing tests pass by running `.\serve.ps1` and opening `http://localhost:8080/tests/`
- [x] T002 Read current `src/js/ego-graph.js` and confirm location of `applyEgoGraph()`, `expandAll()`, and module-level state variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add module-level state variables that both user stories depend on. These changes are prerequisites for all subsequent work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `physicsEnabled` (boolean, initial `false`) module-level variable in `src/js/ego-graph.js` — tracks whether physics is currently active to avoid redundant `setOptions` calls (R1, R3)
- [x] T004 Add `lastPhysicsIsMobile` (boolean, initial `false`) module-level variable in `src/js/ego-graph.js` — tracks which viewport-specific physics config was last applied (R3)
- [x] T005 Add `pendingStabilizationHandler` (Function|null, initial `null`) module-level variable in `src/js/ego-graph.js` — stores reference to current pending `stabilized` event handler for cancel-and-replace (R2)

**Checkpoint**: Three new module-level variables declared. No behavior changes yet — all existing tests still pass.

---

## Phase 3: User Story 1 — Smooth Rapid Node Navigation (Priority: P1) 🎯 MVP

**Goal**: Eliminate visual jitter when clicking through multiple ego-graph nodes in quick succession by preventing redundant `setOptions({ physics: ... })` calls and implementing cancel-and-replace for stabilization handlers.

**Independent Test**: Open the graph, let it load into ego-graph mode. Rapidly click 3–4 different neighbor nodes in sequence. The graph layout must not jitter or reset between transitions.

### Tests for User Story 1

- [x] T006 [P] [US1] Add unit test in `tests/unit/ego-graph.test.js`: verify `applyEgoGraph()` does NOT call `network.setOptions` when physics is already enabled with matching viewport config (FR-001)
- [x] T007 [P] [US1] Add unit test in `tests/unit/ego-graph.test.js`: verify `applyEgoGraph()` DOES call `network.setOptions` when transitioning from full→ego mode (FR-003)
- [x] T008 [P] [US1] Add unit test in `tests/unit/ego-graph.test.js`: verify cancel-and-replace — calling `applyEgoGraph()` twice removes the first `stabilized` handler before registering the second (FR-002)
- [x] T009 [P] [US1] Add unit test in `tests/unit/ego-graph.test.js`: verify same-node click (`nodeId === spotlightId`) skips neighborhood updates and calls `network.focus()` to re-center camera (FR-006)
- [x] T010 [P] [US1] Add unit test in `tests/unit/ego-graph.test.js`: verify physics is disabled after stabilization completes — `stabilized` handler sets `physicsEnabled = false` and calls `setOptions({ physics: false })` (FR-004)

### Implementation for User Story 1

- [x] T011 [US1] Implement same-node early return guard in `applyEgoGraph()` in `src/js/ego-graph.js` — when `nodeId === spotlightId`, skip neighborhood computation, call `network.focus(spotlightId)` with panel offset, and return (FR-006, R4)
- [x] T012 [US1] Implement cancel-and-replace for stabilization handlers in `applyEgoGraph()` in `src/js/ego-graph.js` — before registering a new `once("stabilized")` handler, call `network.off("stabilized", pendingStabilizationHandler)` if one exists, then store the new handler reference (FR-002, R2)
- [x] T013 [US1] Implement physics state tracking in `applyEgoGraph()` in `src/js/ego-graph.js` — only call `network.setOptions({ physics: ... })` when `physicsEnabled === false`; update `physicsEnabled = true` after enabling (FR-001, R1)
- [x] T014 [US1] Update stabilization handler in `applyEgoGraph()` in `src/js/ego-graph.js` — on `stabilized` event, set `physicsEnabled = false`, clear `pendingStabilizationHandler = null`, then disable physics via `setOptions({ physics: false })` (FR-004)
- [x] T015 [US1] Implement cancel-and-replace in `expandAll()` in `src/js/ego-graph.js` — call `network.off("stabilized", pendingStabilizationHandler)` before any state reset; reset `physicsEnabled = false`, `lastPhysicsIsMobile = false`, `pendingStabilizationHandler = null` (R5)
- [x] T016 [US1] Add integration test in `tests/integration/ego-graph-integration.test.js`: rapid navigation scenario — call `applyEgoGraph()` with 3 different node IDs in sequence and verify only the final spotlight is applied, no stale handlers fire (SC-001)

**Checkpoint**: User Story 1 complete. Rapid node navigation is smooth — no redundant physics calls, stale handlers are cancelled, same-node clicks re-center. All existing tests still pass (SC-004).

---

## Phase 4: User Story 2 — Consistent Mobile vs Desktop Physics (Priority: P2)

**Goal**: Ensure physics configuration updates when viewport changes between mobile (springLength: 80) and desktop (default) during ego-graph navigation, while avoiding redundant re-application within the same viewport.

**Independent Test**: On a mobile viewport (≤767px), click through 3 nodes rapidly — no jitter. Resize to desktop (>767px) and click a new node — physics spring length updates smoothly.

### Tests for User Story 2

- [x] T017 [P] [US2] Add unit test in `tests/unit/ego-graph.test.js`: verify `applyEgoGraph()` re-applies physics settings when `isMobile()` result differs from `lastPhysicsIsMobile` (FR-003)
- [x] T018 [P] [US2] Add unit test in `tests/unit/ego-graph.test.js`: verify `applyEgoGraph()` skips `setOptions` when `isMobile()` matches `lastPhysicsIsMobile` and physics is already enabled (FR-001)

### Implementation for User Story 2

- [x] T019 [US2] Extend physics state check in `applyEgoGraph()` in `src/js/ego-graph.js` — add viewport comparison: call `setOptions` when `isMobile() !== lastPhysicsIsMobile` even if `physicsEnabled === true`; update `lastPhysicsIsMobile = isMobile()` after applying (FR-003, R3)

**Checkpoint**: User Story 2 complete. Viewport changes correctly trigger physics reconfiguration. Repeated clicks within the same viewport skip redundant calls.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, no-regression confirmation, and documentation

- [x] T020 Run all existing unit tests in `tests/unit/ego-graph.test.js` and confirm they pass without modification (SC-004)
- [x] T021 Run all existing integration tests in `tests/integration/ego-graph-integration.test.js` and confirm they pass without modification (SC-004)
- [x] T022 Manual smoke test per `specs/009-fix-bugs-techdebt/quickstart.md` — rapid navigation (5 nodes in 3s), same-node click, expand-all, mobile viewport (SC-001, SC-002, SC-003)
- [x] T023 Run Biome linter/formatter on `src/js/ego-graph.js` to ensure code style compliance
- [x] T024 Validate no visual regressions — spotlight centering, panel offset, and node pinning behavior remain unchanged (FR-005, SC-002)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) — extends the physics check logic added in US1
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on US2
- **User Story 2 (P2)**: Depends on US1 — extends the physics state check added in T013 with viewport comparison

### Within Each User Story

- Tests (T006–T010, T017–T018) MUST be written and FAIL before implementation
- Implementation tasks within a story are sequential (they modify the same file and function)
- Integration tests after unit-level implementation

### Parallel Opportunities

**Phase 3 (US1) tests — all parallel**:
```
T006: setOptions skip test
T007: full→ego transition test
T008: cancel-and-replace test
T009: same-node click test
T010: physics disable after stabilize test
```

**Phase 4 (US2) tests — parallel**:
```
T017: viewport change re-apply test
T018: same viewport skip test
```

**Phase 5 polish — partial parallel**:
```
T020: unit test run
T021: integration test run
T023: Biome lint
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (add 3 module-level variables)
3. Complete Phase 3: User Story 1 (physics skip, cancel-and-replace, same-node guard)
4. **STOP and VALIDATE**: Run all tests + manual rapid-click test
5. This alone resolves the core jank defect

### Incremental Delivery

1. Complete Setup + Foundational → Variables declared, no behavior change
2. Add User Story 1 → Core jank fix deployed (MVP!)
3. Add User Story 2 → Mobile/desktop viewport awareness added
4. Polish → Full validation against all success criteria

---

## Notes

- All implementation changes are isolated to `src/js/ego-graph.js` — single file modification
- Test additions span two files: `tests/unit/ego-graph.test.js` and `tests/integration/ego-graph-integration.test.js`
- No data model, schema, or HTML/CSS changes required
- The [P] marker on test tasks indicates they modify different test sections and can be written in parallel
- Implementation tasks within each story are sequential because they modify the same functions in the same file
