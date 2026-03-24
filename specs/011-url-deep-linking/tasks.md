# Tasks: URL-Based Deep Linking

**Input**: Design documents from `/specs/011-url-deep-linking/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Required (Constitution Principle III: Test-Driven Quality, NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create the new module file and toast notification CSS

- [X] T001 [P] Create deep-link module skeleton with exported API stubs (`initDeepLink`, `updateHash`, `clearHash`, `parseHash`) in src/js/deep-link.js
- [X] T002 [P] Add toast notification CSS styles (`.toast` class, fixed bottom-left, fade-out animation, `role="status"` + `aria-live="polite"` support) in src/css/styles.css
- [X] T003 [P] Register deep-link test files in tests/index.html (add script imports for tests/unit/deep-link.test.js and tests/integration/deep-link-integration.test.js)

**Checkpoint**: Module skeleton exists, toast styles ready, test runner configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the pure hash-parsing logic that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until `parseHash` is fully implemented and tested

- [X] T004 Write unit tests for `parseHash` function — valid hashes (`#node=virtua-fighter`), URL-encoded values (`#node=sega%20am2`), empty hash (`#`), malformed hashes (`#nonsense`, `#foo=bar`), empty node value (`#node=`) in tests/unit/deep-link.test.js
- [X] T005 Implement `parseHash(hash)` function — extract and URL-decode node ID from `#node=<value>` pattern, return `{ nodeId }` or `{ nodeId: null }` for malformed/empty hashes in src/js/deep-link.js

**Checkpoint**: `parseHash` is implemented and all unit tests pass

---

## Phase 3: User Story 1 — Share a Direct Link to a Node (Priority: P1) 🎯 MVP

**Goal**: Clicking a node updates the URL hash; opening a URL with a valid hash navigates to that node on load

**Independent Test**: Click a node → verify URL shows `#node=<id>` → copy URL → open in new tab → verify node is focused with detail panel open

### Tests for User Story 1

- [X] T006 [P] [US1] Write unit tests for `updateHash(nodeId)` — verify `history.pushState` is called with correct `#node=<id>` URL in tests/unit/deep-link.test.js
- [X] T007 [P] [US1] Write unit tests for `clearHash()` — verify hash is removed from URL via `history.pushState` in tests/unit/deep-link.test.js
- [X] T008 [P] [US1] Write unit tests for `initDeepLink` — verify it returns `{ initialNodeId }` for valid hash, `null` for no hash, and calls `onInvalidNode` for unknown node IDs in tests/unit/deep-link.test.js

### Implementation for User Story 1

- [X] T009 [US1] Implement `updateHash(nodeId)` — call `history.pushState(null, "", "#node=" + nodeId)` in src/js/deep-link.js
- [X] T010 [US1] Implement `clearHash()` — call `history.pushState(null, "", location.pathname + location.search)` in src/js/deep-link.js
- [X] T011 [US1] Implement `initDeepLink(nodeMap, { onNavigate, onInvalidNode })` — parse initial `location.hash`, validate against `nodeMap`, return `{ initialNodeId }` in src/js/deep-link.js
- [X] T012 [US1] Integrate deep-link module into app.js init flow — import `initDeepLink`, `updateHash`, `clearHash`; call `initDeepLink` after graph creation; use `initialNodeId` to skip random spotlight when deep link is present in src/js/app.js
- [X] T013 [US1] Wire `updateHash` to network `selectNode` event and `clearHash` to `deselectNode` event in src/js/app.js
- [X] T014 [US1] Implement `showToast(message)` helper function for transient notifications (auto-dismiss after 4s) in src/js/app.js

**Checkpoint**: US1 complete — selecting a node updates URL, opening a deep link URL navigates to the node

---

## Phase 4: User Story 2 — Browser History Navigation (Priority: P2)

**Goal**: Browser back/forward buttons navigate between previously selected nodes

**Independent Test**: Select node A → select node B → press back → verify node A is shown → press forward → verify node B is shown

### Tests for User Story 2

- [X] T015 [US2] Write unit tests for `popstate` handler in `initDeepLink` — verify `onNavigate` is called with correct node ID when hash changes via browser navigation; verify `onInvalidNode` called for unknown IDs; verify deselection when hash is cleared in tests/unit/deep-link.test.js

### Implementation for User Story 2

- [X] T016 [US2] Add `popstate` event listener inside `initDeepLink` — on popstate, parse `location.hash`, validate against `nodeMap`, call `onNavigate(nodeId)` for valid nodes or `onInvalidNode(nodeId)` for invalid ones in src/js/deep-link.js
- [X] T017 [US2] Add dedup guard — compare target node ID against current spotlight (`getSpotlightId()`) before calling `onNavigate`; skip if same node already active in src/js/deep-link.js
- [X] T018 [US2] Wire `onNavigate` callback in app.js to call `applyEgoGraph(nodeId)` + `openDetailPanel(nodeId)` + hide filter toolbar in src/js/app.js

**Checkpoint**: US2 complete — back/forward navigation works between previously selected nodes

---

## Phase 5: User Story 3 — Invalid Hash Handling (Priority: P2)

**Goal**: Invalid or non-existent node IDs in the URL are handled gracefully with user notification

**Independent Test**: Open app with `#node=nonexistent` → verify default view loads → verify toast notification appears → verify it auto-dismisses

### Tests for User Story 3

- [X] T019 [US3] Write integration test — verify opening app with invalid hash shows toast and falls back to random spotlight; verify malformed hashes (`#nonsense`, `#`, empty) are silently ignored in tests/integration/deep-link-integration.test.js

### Implementation for User Story 3

- [X] T020 [US3] Wire `onInvalidNode` callback in app.js to show toast notification (`showToast`) with "Node not found" message and fall back to random spotlight in src/js/app.js
- [X] T021 [US3] Add toast container element with `role="status"` and `aria-live="polite"` attributes to src/index.html

**Checkpoint**: US3 complete — invalid hashes show notification and fall back gracefully

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T022 Run Biome linting on all changed files (src/js/deep-link.js, src/js/app.js, src/css/styles.css)
- [X] T023 Run full QUnit test suite and verify all tests pass (existing + new)
- [X] T024 Run quickstart.md validation — manually test all 5 acceptance criteria from quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — all 3 tasks can run in parallel
- **Foundational (Phase 2)**: Depends on T001 (module skeleton) — T004/T005 implement and test `parseHash`
- **US1 (Phase 3)**: Depends on Phase 2 completion (`parseHash` working)
- **US2 (Phase 4)**: Depends on Phase 3 completion (needs `updateHash`/`clearHash` + app.js wiring)
- **US3 (Phase 5)**: Depends on Phase 3 completion (needs `initDeepLink` + `showToast`)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent — core deep-link functionality
- **US2 (P2)**: Depends on US1 — extends with `popstate` listener for history nav
- **US3 (P2)**: Depends on US1 — extends with invalid-hash handling + toast notification

### Within Each User Story

- Tests MUST be written and FAIL before implementation begins
- Core functions before integration (deep-link.js before app.js wiring)
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001, T002, T003 all target different files → full parallel
- **Phase 3 tests**: T006, T007, T008 all target tests/unit/deep-link.test.js but different test groups → can be written sequentially within the file but logically parallel
- **US2 and US3**: Both depend on US1, but are independent of each other → can run in parallel after US1 completes

---

## Parallel Example: Phase 1

```
# All three setup tasks can run simultaneously:
Task T001: Create src/js/deep-link.js (module skeleton)
Task T002: Add toast styles to src/css/styles.css
Task T003: Register test files in tests/index.html
```

## Parallel Example: After US1 Completes

```
# US2 and US3 can be worked on in parallel:
Stream A: T015 → T016 → T017 → T018 (US2: browser history)
Stream B: T019 → T020 → T021 (US3: invalid hash handling)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational — `parseHash` (T004–T005)
3. Complete Phase 3: User Story 1 (T006–T014)
4. **STOP AND VALIDATE**: Deep links work for sharing URLs
5. Deploy/demo if ready — URL sharing is the core value

### Incremental Delivery

1. Setup + Foundational → Hash parsing works
2. Add US1 → URL updates on click + deep link on load → **MVP!**
3. Add US2 → Browser back/forward works
4. Add US3 → Invalid hashes handled gracefully
5. Polish → Lint, full test suite, quickstart validation

---

## Notes

- Total tasks: **24**
- Tasks per user story: US1 = 9, US2 = 4, US3 = 3, Setup = 3, Foundational = 2, Polish = 3
- All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- Suggested MVP scope: Phase 1 + 2 + 3 (User Story 1 only) = 14 tasks
- Key new file: `src/js/deep-link.js` (single module, 4 exports)
- Key modified file: `src/js/app.js` (import + init flow + event wiring)
