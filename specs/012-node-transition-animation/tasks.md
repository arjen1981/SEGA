# Tasks: Node Transition Animation

**Input**: Design documents from `/specs/012-node-transition-animation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Included — Constitution Principle III (Test-Driven Quality) is NON-NEGOTIABLE.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add foundational module-level state and helper functions that all user stories depend on

- [X] T001 Add `prefers-reduced-motion` media query and helper function to `src/js/ego-graph.js` (mirrors existing `mobileQuery` / `isMobile()` pattern)
- [X] T002 Add transition state variables (`animFrameId`, transition tracking fields) to module scope in `src/js/ego-graph.js`
- [X] T003 [P] Add `easeInOutQuad` easing helper function to `src/js/ego-graph.js`
- [X] T004 [P] Add `computeZoomDip` helper function implementing the parabolic dip curve (`1 - 0.3 * 4 * t * (1 - t)`) in `src/js/ego-graph.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core neighborhood computation and animation loop infrastructure — MUST be complete before any user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement `computeNeighborhoodDiff(oldNodeId, newNodeId)` function that computes departing, arriving, and shared node/edge sets in `src/js/ego-graph.js` (uses `network.getConnectedNodes()` and edge endpoint filtering per data-model.md)
- [X] T006 Implement `cancelTransition()` function that calls `cancelAnimationFrame(animFrameId)`, resets intermediate opacity states on all transitioning nodes/edges, and clears transition state in `src/js/ego-graph.js`
- [X] T007 Implement `finalizeTransition(nodeId, visibleNodeIds)` function that applies the canonical end state (departing nodes hidden, arriving nodes opacity=1, edges correct, physics disabled, spotlight unpinned) identical to current `applyEgoGraph` result in `src/js/ego-graph.js`

**Checkpoint**: Foundation ready — animation loop and state management available for all user stories

---

## Phase 3: User Story 1 — Smooth Zoom-Out / Zoom-In Transition (Priority: P1) 🎯 MVP

**Goal**: When clicking a neighbor node while in ego mode, the camera performs a single continuous animated move with zoom dip, departing nodes/edges fade out, arriving nodes/edges fade in, shared nodes stay stable — all within 600ms

**Independent Test**: Open the page, click a visible neighbor node. The camera smoothly animates from old to new spotlight with a zoom dip mid-transit. Departing nodes fade out, arriving nodes fade in. Shared nodes remain stable. The final state matches the current `applyEgoGraph` result.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T008 [P] [US1] Unit test: `computeNeighborhoodDiff` returns correct departing/arriving/shared sets for test graph in `tests/unit/ego-graph.test.js`
- [X] T009 [P] [US1] Unit test: `computeNeighborhoodDiff` handles leaf nodes (single neighbor) and hub nodes correctly in `tests/unit/ego-graph.test.js`
- [X] T010 [P] [US1] Unit test: `easeInOutQuad` returns correct values at t=0, t=0.5, t=1 in `tests/unit/ego-graph.test.js`
- [X] T011 [P] [US1] Unit test: `computeZoomDip` returns 1.0 at t=0 and t=1, and ~0.7 at t=0.5 in `tests/unit/ego-graph.test.js`
- [X] T012 [P] [US1] Integration test: node transition sets departing node opacity to 0 and arriving node opacity to 1 after 600ms in `tests/integration/ego-graph-integration.test.js`
- [X] T013 [P] [US1] Integration test: shared nodes maintain opacity=1 throughout transition (no flicker) in `tests/integration/ego-graph-integration.test.js`
- [X] T014 [P] [US1] Integration test: final state after transition matches canonical `applyEgoGraph` result (correct hidden/visible nodes, spotlight centered) in `tests/integration/ego-graph-integration.test.js`
- [X] T014b [P] [US1] Unit test: `finalizeTransition` resets `opacity: 1` on all visible nodes and `color.opacity: 1` on all visible edges after transition completes in `tests/unit/ego-graph.test.js`
- [X] T014c [P] [US1] Integration test: departing/arriving edge `color.opacity` values match their connected node `opacity` values at each animation frame in `tests/integration/ego-graph-integration.test.js`

### Implementation for User Story 1

- [X] T015 [US1] Implement the core rAF animation loop (`runTransition`) in `src/js/ego-graph.js` — each frame: interpolate camera position via `network.moveTo()`, apply zoom dip, update node `opacity` and edge `color.opacity` for departing/arriving sets
- [X] T016 [US1] Modify `applyEgoGraph(nodeId)` to detect ego-to-ego transition (existing `spotlightId !== null && spotlightId !== nodeId && viewMode === "ego"`) and invoke animated transition instead of instant swap in `src/js/ego-graph.js`
- [X] T017 [US1] Add transition pre-setup in `applyEgoGraph`: unhide arriving nodes with `opacity: 0`, unhide arriving edges with `color.opacity: 0`, get camera positions via `network.getPositions()`, start rAF loop in `src/js/ego-graph.js`
- [X] T018 [US1] Wire `finalizeTransition` as the completion callback of the rAF loop — set canonical end state and update `spotlightId`/`viewMode` in `src/js/ego-graph.js`
- [X] T019 [US1] Ensure initial page load (`spotlightId === null`) still uses the existing instant setup path (no animation) per FR-009 in `src/js/ego-graph.js`
- [X] T020 [US1] Ensure same-node re-click (`nodeId === spotlightId`) still uses the existing re-center path (no animation change) in `src/js/ego-graph.js`

**Checkpoint**: At this point, User Story 1 should be fully functional — smooth animated transition between ego-graphs with zoom dip, opacity fades, and correct end state

---

## Phase 4: User Story 2 — Transition Respects Device and Viewport (Priority: P2)

**Goal**: The animated transition uses the correct zoom scale and panel offset for desktop (side panel) and mobile (bottom sheet), matching existing centering behavior

**Independent Test**: On desktop (>767px), the transition animation centers the new spotlight offset to the left of the detail panel. On mobile (≤767px), it centers above the bottom sheet with mobile zoom scale.

### Tests for User Story 2

- [X] T021 [P] [US2] Unit test: transition uses desktop scale (1.5) and desktop panel offset when `isMobile()` returns false in `tests/unit/ego-graph.test.js`
- [X] T022 [P] [US2] Unit test: transition uses mobile scale (0.9) and mobile panel offset when `isMobile()` returns true in `tests/unit/ego-graph.test.js`

### Implementation for User Story 2

- [X] T023 [US2] Integrate `getPanelOffset({ anticipateOpen: true })` and `isMobile()` into the rAF loop target calculation — use correct scale (0.9 mobile / 1.5 desktop) and offset for `network.moveTo()` in `src/js/ego-graph.js`
- [X] T024 [US2] Ensure the final `finalizeTransition` call re-reads panel offset at completion time (not cached from animation start) so a viewport resize during transition lands correctly in `src/js/ego-graph.js`

**Checkpoint**: Transition animation works correctly on both desktop and mobile viewports

---

## Phase 5: User Story 3 — Transition Does Not Block Interaction (Priority: P2)

**Goal**: Clicking another node while a transition is in progress cancels the current animation and starts a new one from the current camera state — no visual artifacts

**Independent Test**: Click a neighbor, then immediately click a second neighbor before the first transition finishes. The graph animates directly to the second node. Repeat with 3+ rapid clicks — only the last target is reached.

### Tests for User Story 3

- [X] T025 [P] [US3] Unit test: `cancelTransition` stops the rAF loop and resets intermediate opacity on all affected nodes/edges in `tests/unit/ego-graph.test.js`
- [X] T026 [P] [US3] Integration test: rapid sequential calls to `applyEgoGraph` (A→B→C) result in only node C as the final spotlight in `tests/integration/ego-graph-integration.test.js`
- [X] T027 [P] [US3] Integration test: after cancel-and-replace, no nodes have intermediate opacity values (all are either 0, 1, or hidden) in `tests/integration/ego-graph-integration.test.js`

### Implementation for User Story 3

- [X] T028 [US3] Wire `cancelTransition()` at the start of `applyEgoGraph` — if `animFrameId !== null`, cancel the running animation and clean up intermediate state before starting a new transition in `src/js/ego-graph.js`
- [X] T029 [US3] Ensure `cancelTransition` also cancels any pending stabilization handler (`pendingStabilizationHandler`) to avoid stale callbacks from the canceled transition in `src/js/ego-graph.js`
- [X] T030 [US3] Ensure `expandAll()` also calls `cancelTransition()` if a transition is in progress (FR-010: expandAll behavior must not be altered by in-flight transitions) in `src/js/ego-graph.js`

**Checkpoint**: Rapid clicking produces no artifacts; only the final target node is the active spotlight

---

## Phase 6: User Story 4 — Reduced Motion Preference (Priority: P3)

**Goal**: When `prefers-reduced-motion: reduce` is active, ego-graph transitions skip all animation and use the existing instant-switch behavior

**Independent Test**: Enable "prefers-reduced-motion: reduce" in OS settings. Click a neighbor node — the ego-graph switches instantly (no zoom, pan, or fade). Disable setting — animation plays normally.

### Tests for User Story 4

- [X] T031 [P] [US4] Unit test: when `prefersReducedMotion()` returns true, `applyEgoGraph` does not start a rAF loop (uses instant path) in `tests/unit/ego-graph.test.js`
- [X] T032 [P] [US4] Integration test: with reduced motion enabled, node transition produces the same instant result as the pre-feature behavior in `tests/integration/ego-graph-integration.test.js`

### Implementation for User Story 4

- [X] T033 [US4] Add reduced-motion guard at the top of the ego-to-ego transition path in `applyEgoGraph` — if `prefersReducedMotion()` returns true, skip animated transition and use the existing instant swap logic in `src/js/ego-graph.js`

**Checkpoint**: Reduced motion users get the existing instant behavior; normal users get the animated transition

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, validation, and documentation

- [X] T034 Update JSDoc module header in `src/js/ego-graph.js` to document new transition animation exports/behavior
- [X] T035 Run Biome lint check (`npm run lint`) and fix any violations in `src/js/ego-graph.js`
- [X] T036 Run full test suite (unit + integration) and verify all existing tests still pass alongside new tests
- [X] T037 Run quickstart.md validation — manually test all scenarios from `specs/012-node-transition-animation/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — core animation, MVP
- **US2 (Phase 4)**: Depends on US1 (Phase 3) — extends the rAF loop with viewport-aware targeting
- **US3 (Phase 5)**: Depends on US1 (Phase 3) — adds cancel logic to existing animation loop
- **US4 (Phase 6)**: Depends on US1 (Phase 3) — adds guard at animation entry point
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Depends on US1 (the rAF loop must exist before viewport integration)
- **US3 (P2)**: Depends on US1 (must have an animation to cancel); can run in parallel with US2
- **US4 (P3)**: Depends on US1 (must have the animated path to guard); can run in parallel with US2/US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Helper functions before integration
- Core logic before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003 and T004 can run in parallel (independent helper functions)
- **Phase 2**: T005, T006, T007 are sequential (T006 uses T005 output, T007 uses the result structure)
- **Phase 3**: All test tasks T008–T014 can run in parallel (different test cases)
- **Phase 4+5+6**: US3 and US4 can start in parallel after US1; US2 depends on US1 but is parallel with US3/US4

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests in parallel (T008–T014):
Task: "Unit test: computeNeighborhoodDiff returns correct sets" (T008)
Task: "Unit test: computeNeighborhoodDiff handles leaf/hub nodes" (T009)
Task: "Unit test: easeInOutQuad correctness" (T010)
Task: "Unit test: computeZoomDip correctness" (T011)
Task: "Integration test: node opacity after transition" (T012)
Task: "Integration test: shared node stability" (T013)
Task: "Integration test: final state matches canonical" (T014)

# Then implement sequentially:
Task: "Implement rAF animation loop" (T015)
Task: "Modify applyEgoGraph for ego-to-ego detection" (T016)
Task: "Add transition pre-setup" (T017)
Task: "Wire finalizeTransition" (T018)
Task: "Preserve initial load path" (T019)
Task: "Preserve same-node re-click path" (T020)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T007)
3. Complete Phase 3: User Story 1 (T008–T020)
4. **STOP and VALIDATE**: Test smooth transition independently — open page, click neighbors, verify animation plays with zoom dip, opacity fades, correct end state
5. Deploy/demo if ready

### Full Feature

6. Complete Phase 4: User Story 2 (T021–T024) — viewport handling
7. Complete Phase 5: User Story 3 (T025–T030) — cancel-and-replace (can run parallel with US2)
8. Complete Phase 6: User Story 4 (T031–T033) — reduced motion (can run parallel with US2/US3)
9. Complete Phase 7: Polish (T034–T037)
10. **FINAL VALIDATION**: Run full test suite + quickstart manual walkthrough
