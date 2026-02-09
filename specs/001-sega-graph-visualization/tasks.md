# Tasks: SEGA Studio Graph Visualization

**Input**: Design documents from `/specs/001-sega-graph-visualization/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included — Constitution Principle III (Test-Driven Quality Assurance) is NON-NEGOTIABLE. QUnit v2.25 (CDN, browser-based) per research decision R2.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [ ] T001 Create project directory structure: src/, src/css/, src/js/, src/data/, tests/, tests/unit/, tests/integration/
- [ ] T002 [P] Create dev-only package.json with @biomejs/biome devDependency in package.json
- [ ] T003 [P] Configure Biome linter/formatter with project defaults in biome.json
- [ ] T004 [P] Create QUnit test runner HTML with CDN imports (qunit-2.25.0.js + qunit-2.25.0.css) in tests/index.html. Load test modules as <script type="module"> tags that import from src/js/ using relative paths. Add an import map if needed to alias src/ paths for test imports.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Base HTML scaffold, CSS foundation, and pre-compiled Wikipedia data. MUST be complete before ANY user story can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete — the graph cannot render without data files and a host page.

- [ ] T005 [P] Create index.html scaffold with vis-network CDN script tag, charset/viewport meta, semantic layout containers (header, main, aside) in src/index.html
- [ ] T006 [P] Create base CSS with document reset, CSS custom properties for node-group colors, layout grid (graph area + side panel), and box-sizing in src/css/styles.css
- [ ] T007 Compile nodes.json with all SEGA arcade entities (~100–200 nodes) from Wikipedia REST API (/page/summary/) and Wikidata SPARQL, per schema in contracts/nodes.schema.json, output to src/data/nodes.json
- [ ] T008 Compile edges.json with all entity relationships from Wikidata properties (P749, P178, P400, P108, P800), per schema in contracts/edges.schema.json, output to src/data/edges.json
- [ ] T009 Validate nodes.json and edges.json against JSON Schemas in specs/001-sega-graph-visualization/contracts/ — verify all IDs unique, all edge references valid, exactly one company node, every node has at least one edge, and per-group required fields present (founded+headquarters for company, status for studio, etc. per data-model.md)

**Checkpoint**: Foundation ready — data files compiled and validated, HTML scaffold in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Explore the SEGA Graph (Priority: P1) 🎯 MVP

**Goal**: Render an interactive force-directed graph with SEGA at the center, color-coded node categories, labeled edges, and pan/zoom/drag navigation.

**Independent Test**: Open src/index.html in a browser via local HTTP server. Confirm the graph renders with SEGA as center node, four distinct node categories visually differentiated, labeled edges, and working pan/zoom/drag.

### Tests for User Story 1

> **Write these tests FIRST — they MUST fail before implementation**

- [ ] T010 [P] [US1] Write unit tests for graph module: Network initialization, node group configuration (5 groups with distinct colors/shapes), physics solver config, and edge label rendering in tests/unit/graph.test.js
- [ ] T011 [P] [US1] Write integration test: fetch nodes.json and edges.json, initialize graph, assert node count matches data, assert SEGA node exists at center, assert all edge labels visible in tests/integration/graph-render.test.js

### Implementation for User Story 1

- [ ] T012 [US1] Implement graph module: create vis.Network instance, configure node groups (company=star/red, studio=dot/blue, platform=diamond/green, game=square/orange, creator=triangle/purple), set barnesHut physics solver, enable pan/zoom/drag interactions, render edge labels from data in src/js/graph.js
- [ ] T013 [US1] Implement app bootstrap: fetch src/data/nodes.json and src/data/edges.json via fetch(), parse JSON, pass DataSet to graph.init(), handle fetch errors with user-visible message in src/js/app.js
- [ ] T014 [US1] Wire graph container div (#graph-container), link src/js/graph.js and src/js/app.js as ES6 modules, verify vis-network CDN loads before app init in src/index.html
- [ ] T015 [US1] Add graph container full-viewport sizing, loading spinner state, node-group color legend bar, and vis-network canvas styles in src/css/styles.css

**Checkpoint**: User Story 1 complete — interactive graph renders with all node types, edges, and navigation. MVP is deployable.

---

## Phase 4: User Story 2 — View Node Details (Priority: P2)

**Goal**: Click any node to open a detail panel showing Wikipedia-sourced name, summary, key facts, thumbnail, and article link. Panel is closeable. Missing data shows explicit fallback.

**Independent Test**: Click any node in the graph. Confirm a detail panel slides in with entity name, Wikipedia summary, relevant facts (year, genre, etc.), and a working Wikipedia link. Click close to dismiss. Click a node with missing data and confirm "no data available" message appears.

### Tests for User Story 2

> **Write these tests FIRST — they MUST fail before implementation**

- [ ] T016 [P] [US2] Write unit tests for detail panel: render with full data (all 5 entity types), render with missing optional fields, close on button click, close on outside click, "no data available" fallback for empty summary in tests/unit/detail-panel.test.js

### Implementation for User Story 2

- [ ] T017 [US2] Implement detail-panel module: listen for vis-network selectNode event, look up node data by ID, render entity name/summary/facts/thumbnail/Wikipedia link, dispatch per group type (company shows founded+HQ, studio shows founded+status+focus, platform shows releaseYear+generation+features, game shows releaseYear+genre, creator shows birthYear+roles) in src/js/detail-panel.js
- [ ] T018 [US2] Add detail panel aside element with close button, content container, and Wikipedia link placeholder markup in src/index.html
- [ ] T019 [US2] Add detail panel styles: slide-in from right, max-width 400px, responsive full-width on mobile, thumbnail image, close button, scrollable content, backdrop overlay in src/css/styles.css
- [ ] T020 [US2] Handle missing Wikipedia data: when summary is empty or node not found, display "No Wikipedia data available for this entity" message with a Wikipedia search link (FR-009) in src/js/detail-panel.js

**Checkpoint**: User Stories 1 AND 2 complete — graph is interactive with informative detail panels.

---

## Phase 5: User Story 3 — Filter by Node Type (Priority: P3)

**Goal**: Toggle visibility of node categories (studios, platforms, games, creators) via checkbox controls. Hidden nodes and their edges disappear; re-enabling restores them.

**Independent Test**: With the graph displayed, uncheck "Games" — all game nodes and their edges disappear. Re-check "Games" — they reappear. Uncheck multiple categories and verify only the remaining category's nodes and mutual edges are shown. Filter updates complete in under 0.5 seconds.

### Tests for User Story 3

> **Write these tests FIRST — they MUST fail before implementation**

- [ ] T021 [P] [US3] Write unit tests for filters module: toggle single category hides/shows nodes, toggle hides connected edges, multiple toggles combine correctly, SEGA company node always visible, filter state restored on re-enable in tests/unit/filters.test.js

### Implementation for User Story 3

- [ ] T022 [US3] Implement filters module: read checkbox state, update vis.DataSet to hide/show nodes by group, hide edges where either endpoint is hidden, keep SEGA root always visible, emit filter-change event for other modules in src/js/filters.js
- [ ] T023 [US3] Add filter toolbar with labeled checkboxes for Studios, Platforms, Games, and Creators (all checked by default), placed above or beside the graph area in src/index.html
- [ ] T024 [US3] Add filter toolbar layout (horizontal bar or sidebar), checkbox label styling, active/inactive state indicators in src/css/styles.css

**Checkpoint**: User Stories 1, 2, AND 3 complete — graph is explorable, informative, and filterable.

---

## Phase 6: User Story 4 — Search for a Node (Priority: P4)

**Goal**: Type an entity name to get autocomplete suggestions, select one to pan/zoom the graph to that node and visually highlight it. No-match shows a message.

**Independent Test**: Type "Virtua" into the search field — suggestions including "Virtua Fighter" and "Virtua Racing" appear. Select "Virtua Fighter" — the graph smoothly pans and zooms to center that node, which is highlighted. Type a nonsense string — "No results found" message appears.

### Tests for User Story 4

> **Write these tests FIRST — they MUST fail before implementation**

- [ ] T025 [P] [US4] Write unit tests for search module: partial match returns suggestions, case-insensitive matching, select suggestion calls graph focus, no-match shows empty message, suggestion list closes on selection in tests/unit/search.test.js

### Implementation for User Story 4

- [ ] T026 [US4] Implement search module: listen for input events on search field, filter node labels by case-insensitive substring match, render suggestion dropdown, on selection call vis.Network.focus() and selectNodes() for pan/zoom/highlight animation, show "No results found" for zero matches in src/js/search.js
- [ ] T027 [US4] Add search input field with placeholder text and autocomplete dropdown container, placed in the header area in src/index.html
- [ ] T028 [US4] Add search input field width, dropdown suggestion list positioning and hover styles, highlighted-node outline ring in src/css/styles.css

**Checkpoint**: All four user stories complete — full-featured SEGA graph visualization.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, accessibility, performance validation, and final quality gates

- [ ] T029 [P] Add responsive CSS breakpoints for mobile (<768px) and tablet (768px–1024px): stack layout vertically, full-width detail panel, collapsible filter bar in src/css/styles.css
- [ ] T030 [P] Add WCAG 2.1 AA accessibility: aria-labels on interactive elements, keyboard navigation for graph nodes (Tab/Enter), focus ring management, sufficient color contrast (4.5:1 minimum) across all files in src/
- [ ] T031 [P] Add Wikipedia CC-BY-SA 3.0 attribution notice, Wikidata CC0 credit, and vis-network library attribution in page footer in src/index.html
- [ ] T032 Add duplicate display-name disambiguation: append node type in parentheses when two nodes share the same label (e.g., "Sonic Team (Studio)") in src/js/app.js
- [ ] T033 Validate performance targets in browser DevTools: initial load interactive within 3 seconds, pan/zoom/drag at 60fps, filter toggle completes within 0.5 seconds, up to 200 nodes rendered
- [ ] T034 Run Biome lint and format check on all source files with npx biome check --write
- [ ] T035 Run full QUnit test suite in tests/index.html, verify all tests pass, and walk through quickstart.md instructions end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational — **BLOCKS User Stories 2, 3, 4** (graph must exist)
- **User Stories 2, 3, 4 (Phases 4–6)**: All depend on User Story 1 completion. Independent of each other — can proceed in parallel.
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational)  ← BLOCKS everything
    │
    ▼
Phase 3 (US1: Graph)    ← MVP milestone
    │
    ├──────────┬──────────┐
    ▼          ▼          ▼
Phase 4    Phase 5    Phase 6
(US2)      (US3)      (US4)
    │          │          │
    └──────────┴──────────┘
               │
               ▼
        Phase 7 (Polish)
```

- **User Story 1 (P1)**: Depends on Phase 2 only. No dependencies on other stories. **This is the MVP.**
- **User Story 2 (P2)**: Depends on US1 (needs graph click events). Independent of US3 and US4.
- **User Story 3 (P3)**: Depends on US1 (needs graph DataSet for filtering). Independent of US2 and US4.
- **User Story 4 (P4)**: Depends on US1 (needs graph focus/select API). Independent of US2 and US3.

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (Constitution Principle III)
2. Core module implementation before HTML/CSS wiring
3. Happy path before edge cases
4. Story complete and testable before moving to next priority

### Parallel Opportunities

**Phase 1**: T002, T003, T004 can all run in parallel (different files)
**Phase 2**: T005 and T006 can run in parallel (different files). T007 and T008 can run in parallel (different output files, same data sources).
**Phase 3**: T010 and T011 can run in parallel (different test files)
**Phases 4–6**: Entire phases can run in parallel (different JS modules, additive HTML/CSS changes)
**Phase 7**: T029, T030, T031 can all run in parallel (different concerns)

---

## Parallel Example: User Story 1

```text
# Step 1 — Write both test files in parallel:
T010: Unit tests for graph module          → tests/unit/graph.test.js
T011: Integration test for graph render    → tests/integration/graph-render.test.js

# Step 2 — Run tests, confirm they FAIL

# Step 3 — Implement graph module (core):
T012: Graph module with vis-network        → src/js/graph.js

# Step 4 — Implement bootstrap (depends on T012):
T013: App bootstrap with fetch + init      → src/js/app.js

# Step 5 — Wire HTML and add CSS:
T014: Update index.html with scripts       → src/index.html
T015: Add graph container styles           → src/css/styles.css

# Step 6 — Run tests, confirm they PASS
```

## Parallel Example: User Stories 2, 3, 4 (after US1)

```text
# These three phases can proceed simultaneously:

Developer A (US2):                Developer B (US3):                Developer C (US4):
T016 detail-panel tests           T021 filter tests                 T025 search tests
T017 detail-panel.js              T022 filters.js                   T026 search.js
T018 update index.html            T023 update index.html            T027 update index.html
T019 update styles.css            T024 update styles.css            T028 update styles.css
T020 FR-009 fallback
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational — compile Wikipedia data (T005–T009)
3. Complete Phase 3: User Story 1 — interactive graph (T010–T015)
4. **STOP and VALIDATE**: Open in browser, verify graph renders with all node types, edges, and pan/zoom/drag
5. Deploy/demo if ready — this is a shippable MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready (T001–T009)
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)** (T010–T015)
3. Add User Story 2 → Test detail panels → Deploy/Demo (T016–T020)
4. Add User Story 3 → Test filters → Deploy/Demo (T021–T024)
5. Add User Story 4 → Test search → Deploy/Demo (T025–T028)
6. Polish pass → Final quality gate (T029–T035)
7. Each story adds value without breaking previous stories

### Single-Developer Sequential Strategy

1. Complete all phases in order: Setup → Foundational → US1 → US2 → US3 → US4 → Polish
2. Validate at each checkpoint before proceeding
3. Commit after each completed task or logical group
4. Run Biome check after each phase

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after US1
- Constitution Principle III: Write tests first, verify they fail, then implement
- Constitution Principle VI: All data from Wikipedia/Wikidata only — no fabricated content
- Data compilation (T007, T008) is the most time-intensive foundational task
- The SEGA company node is always visible and cannot be filtered out
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
