# Tasks: Retro SEGA Visual Theme

**Input**: Design documents from `/specs/003-retro-sega-theme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — plan.md explicitly requires new tests for icon assignment/gender logic and updates to existing graph config tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Static web app — no build pipeline, no server-side processing

---

## Phase 1: Setup (Data Preparation)

**Purpose**: Update the node data set with the gender attribute required by the icon system

- [x] T001 Add `"gender"` field to all 5 creator nodes in `src/data/nodes.json` — Yu Suzuki (`"male"`), Toshihiro Nagoshi (`"male"`), Yuji Naka (`"male"`), Rieko Kodama (`"female"`), Tetsuya Mizuguchi (`"male"`). Values sourced from Wikidata P21 per data-model.md. Validate result against `specs/003-retro-sega-theme/contracts/nodes.schema.json`

---

## Phase 2: Foundational (SVG Icon Module)

**Purpose**: Create the shared icon module that US1 (graph nodes) and US4 (legend/filter swatches) both depend on

**⚠️ CRITICAL**: US1 and US4 cannot begin until this phase is complete. US2 and US3 have no dependency on this phase and CAN start in parallel if staffed.

- [x] T002 Create `src/js/icons.js` with `svgToDataUri(svgString)` helper function and all 7 SVG icon string constants: `PLATFORM_SYSTEM_BOARD` (green #2a9d8f, landscape PCB with chip slots), `GAME_JAMMA_PCB` (amber #e9a820, smaller PCB with 56-pin JAMMA edge connector teeth), `CREATOR_MALE` (purple #7b2d8e, male head silhouette with short hair), `CREATOR_FEMALE` (purple #7b2d8e, female head silhouette with longer hair), `CREATOR_NEUTRAL` (purple #7b2d8e, gender-neutral oval head), `STUDIO_BUILDING` (blue #457b9d, Japanese-style office with peaked roof), `COMPANY_SEGA` (red #e63946, hand-drawn SEGA italic block letter approximation). All icons use 64×64 viewBox with required `xmlns`, `width`, `height` attributes for Firefox compatibility. Use `encodeURIComponent()` encoding for data URIs.
- [x] T003 Add exported functions to `src/js/icons.js`: `getIconDataUri(group, gender?)` returns the correct data URI for a group/gender combination (creator uses gender-based selection with neutral fallback); `assignNodeIcons(nodesArray)` iterates nodes and sets `node.image` and `node.shape = "image"` per icon assignment rules in data-model.md

**Checkpoint**: Icon module complete — US1 and US4 can now begin

---

## Phase 3: User Story 1 — Distinctive Node Icons per Category (Priority: P1) 🎯 MVP

**Goal**: Every node category renders with its unique SVG icon in the graph; edges use SEGA blue

**Independent Test**: Open the app in a browser. Verify each node group shows its icon (green PCB for platforms, amber JAMMA PCB for games, head silhouettes for creators with male/female distinction, Japanese building for studios, SEGA wordmark for company). Verify edges are blue with a glow on hover.

### Tests for User Story 1

- [x] T004 [P] [US1] Create `tests/unit/icons.test.js` — unit tests for: `svgToDataUri()` returns a string starting with `data:image/svg+xml,`; `getIconDataUri("platform")` returns a data URI containing the platform SVG; `getIconDataUri("creator", "male")` vs `"female"` return different URIs; `getIconDataUri("creator")` (no gender) returns neutral icon; `assignNodeIcons()` sets `.image` and `.shape` on each node; creator node without gender gets neutral icon

### Implementation for User Story 1

- [x] T005 [US1] Update `GROUP_CONFIG` in `src/js/graph.js` — import icon data URIs from `icons.js`; change all 5 groups from geometric shapes (`star`, `dot`, `diamond`, `square`, `triangle`) to `shape: "image"` with corresponding `image` data URI from `getIconDataUri()`; keep existing `size`, `font`, and color config for highlights/hover; update edge color from `#484f58` to SEGA blue (`#0044FF`), highlight/hover to `#4488FF`, and `hoverWidth` to `3`
- [x] T006 [US1] Import `assignNodeIcons` from `icons.js` in `src/js/app.js` and call `assignNodeIcons(nodesArray)` after fetching nodes.json but before `createGraph()` — this sets per-node `image` properties for gender-differentiated creator icons
- [x] T007 [US1] Update `tests/unit/graph.test.js` — change GROUP_CONFIG assertions from `shape: "star"` / `"dot"` / `"diamond"` / `"square"` / `"triangle"` to `shape: "image"` for all 5 groups; add assertion that each group has a truthy `image` property; add assertion that edge color is `#0044FF` or matches SEGA blue

**Checkpoint**: All node categories display unique icons, edges are SEGA blue. Graph interactions unchanged. US1 is independently testable.

---

## Phase 4: User Story 2 — SEGA Mega Drive Dark Theme with Scanlines (Priority: P2)

**Goal**: Black background with CRT scanline overlay that doesn't interfere with interactions or readability

**Independent Test**: Open the app. Background must be solid black (#000). Faint horizontal scanlines visible across the full viewport. Click/drag/zoom the graph through the scanlines — all interactions work. Text on all surfaces remains legible.

### Implementation for User Story 2

- [x] T008 [US2] Add CRT scanline overlay and black background in `src/css/styles.css` — set `body` background to `#000`; add `body::after` pseudo-element with `content: ""`, `position: fixed`, full viewport coverage (`inset: 0`), `repeating-linear-gradient` producing 1px transparent / 1px `rgba(0,0,0,0.07)` lines (7% opacity, 2px spacing), `pointer-events: none`, `z-index: 9999`; adjust any existing dark theme CSS variables as needed for the pure-black base
- [x] T009 [US2] Add accessibility and responsive media queries for scanlines in `src/css/styles.css` — `@media (prefers-reduced-motion: reduce)` disables scanline overlay (`display: none` on `body::after`); `@media (max-width: 480px)` reduces scanline opacity or hides overlay to preserve readability on small screens

**Checkpoint**: Scanline overlay visible, non-interactive, accessible. US2 is independently testable.

---

## Phase 5: User Story 3 — Retro SEGA Typography and UI Chrome (Priority: P3)

**Goal**: Press Start 2P font on headings and UI chrome; retro hover/focus effects on interactive elements

**Independent Test**: Open the app. Header title, filter labels, legend text, and detail panel headings use a chunky pixel font. Body text (summaries) remains in a clean system font. Hover over buttons/inputs — retro glow or color shift feedback appears.

### Implementation for User Story 3

- [x] T010 [P] [US3] Add Press Start 2P font loading to `src/index.html` — add `<link rel="preconnect" href="https://fonts.googleapis.com">`, `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`, and `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">` in `<head>` before the existing stylesheet link
- [x] T011 [US3] Add retro typography CSS in `src/css/styles.css` — define `--font-retro: "Press Start 2P", monospace` custom property; apply retro font to `.app-title`, `.filter-checkbox`, `.legend-item`, `.detail-content h2`, `.expand-all-btn`, and other UI chrome selectors; reduce font sizes (~60-70% of current) to compensate for Press Start 2P rendering larger than system fonts; keep `.detail-content p`, `.detail-content li`, and body text in the existing `system-ui, sans-serif` stack for readability
- [x] T012 [US3] Add retro hover/focus effects in `src/css/styles.css` — style `.expand-all-btn:hover`, `.filter-checkbox:hover`, `.search-input:focus`, `.detail-close:hover`, and link hover states with retro-themed effects (e.g., `box-shadow` glow in SEGA blue, `color` shift to brighter accent, `border-color` transition); ensure keyboard `:focus-visible` indicators remain clearly visible per accessibility requirements

**Checkpoint**: All UI chrome uses retro typography. Hover effects feel arcade-like. Body text remains readable. US3 is independently testable.

---

## Phase 6: User Story 4 — Retro-Styled Legend with Icon Swatches (Priority: P4)

**Goal**: Legend and filter toolbar show miniature SVG icons instead of plain color squares

**Independent Test**: Open the app. Legend bar at bottom shows miniature PCB, head, building, and SEGA icons next to category labels. Filter toolbar checkboxes show matching miniature icons. Legend styling matches the retro theme.

### Tests for User Story 4

- [x] T013 [P] [US4] Add swatch icon tests to `tests/unit/icons.test.js` — verify that calling `getIconDataUri(group)` for each legend/filter group returns a valid data URI; verify the creator swatch uses the neutral icon when no gender is specified

### Implementation for User Story 4

- [x] T014 [US4] Add `data-group` attributes to legend and filter swatch elements in `src/index.html` — add `data-group="company"`, `data-group="studio"`, etc. to each `.legend-swatch` and `.filter-swatch` `<span>` element so JavaScript can target them by group; remove inline `style="background-color: var(--color-...);"` from swatches (icon images will replace background colors)
- [x] T015 [US4] Add legend/filter icon initialization in `src/js/app.js` — import `getIconDataUri` from `icons.js`; after DOM ready, query all `[data-group]` swatch elements; set each swatch's `style.backgroundImage` to `url('${getIconDataUri(group)}')` with `background-size: contain`, `background-repeat: no-repeat`, `background-position: center`; for the creator swatch, use the neutral icon
- [x] T016 [US4] Update legend and filter swatch CSS in `src/css/styles.css` — remove or override `background-color` on `.legend-swatch` and `.filter-swatch`; ensure swatch dimensions accommodate icon rendering (e.g., `width: 16px; height: 16px` for legend, `width: 14px; height: 14px` for filter); add `background-size: contain; background-repeat: no-repeat; background-position: center` defaults; style `.legend-bar` background, borders, and spacing for retro consistency

**Checkpoint**: Legend and filter swatches show icons. Visual consistency across all UI surfaces. US4 is independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories

- [x] T017 [P] Visual browser validation per quickstart.md testing strategy — open app in Chrome, Firefox, and Safari; verify all node categories render correct icons; scanlines visible and non-interactive; retro font loads; legend shows miniature icons; edges are SEGA blue with glow on hover
- [x] T018 [P] WCAG AA contrast verification — check text contrast ratios with scanline overlay active using browser DevTools or contrast checker; verify `pointer-events: none` on overlay; verify `:focus-visible` indicators on all interactive elements
- [x] T019 Run full QUnit test suite at `tests/index.html` — confirm all existing tests pass plus new `icons.test.js` tests; zero regressions in graph, filters, search, detail panel, ego-graph modules

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (needs gender data in nodes.json for icon assignment logic)
- **US1 (Phase 3)**: Depends on Phase 2 (needs icons.js module)
- **US2 (Phase 4)**: No dependencies — CSS-only changes, can start immediately in parallel with any phase
- **US3 (Phase 5)**: No dependencies — font/CSS-only changes, can start immediately in parallel with any phase
- **US4 (Phase 6)**: Depends on Phase 2 (needs `getIconDataUri()` from icons.js) and Phase 3 (needs GROUP_CONFIG updated)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Blocked by Phase 2 — no dependencies on other stories
- **US2 (P2)**: Fully independent — can start immediately, no prerequisites
- **US3 (P3)**: Fully independent — can start immediately, no prerequisites
- **US4 (P4)**: Depends on US1 (icons must be in the graph before matching them in legend)

### Within Each User Story

- Tests written FIRST (T004 for US1, T013 for US4) and should FAIL before implementation
- Graph module (graph.js) updated before app bootstrap (app.js)
- CSS changes within a story are sequential (same file)

### File Conflict Map

Tasks editing the **same file** must be sequential:

| File | Tasks (sequential order) |
|------|-------------------------|
| `src/data/nodes.json` | T001 |
| `src/js/icons.js` | T002 → T003 |
| `src/js/graph.js` | T005 |
| `src/js/app.js` | T006 → T015 |
| `src/index.html` | T010 → T014 |
| `src/css/styles.css` | T008 → T009 → T011 → T012 → T016 |
| `tests/unit/icons.test.js` | T004, T013 |
| `tests/unit/graph.test.js` | T007 |

---

## Parallel Opportunities

### Within Phases

```
Phase 3 (US1):
  ├── T004 [P] icons.test.js     ─┐ parallel (different files)
  ├── T005     graph.js            │
  ├── T006     app.js              │
  └── T007     graph.test.js      ─┘ (after T005)

Phase 5 (US3):
  ├── T010 [P] index.html        ─┐ parallel (different files)
  ├── T011     styles.css          │
  └── T012     styles.css         ─┘

Phase 6 (US4):
  ├── T013 [P] icons.test.js     ─┐ parallel (different files)
  ├── T014     index.html          │
  ├── T015     app.js              │
  └── T016     styles.css         ─┘

Phase 7 (Polish):
  ├── T017 [P] visual check      ─┐ parallel (independent activities)
  └── T018 [P] contrast check    ─┘
```

### Cross-Phase Parallelism (if staffed)

```
Immediately (no prerequisites):
  ├── Phase 4 (US2: scanlines)   ─┐ independent of all other phases
  └── Phase 5 (US3: typography)  ─┘

After Phase 1:
  └── Phase 2 (icons.js)

After Phase 2 + 3:
  └── Phase 6 (US4: legend icons) ── depends on both
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational icon module (T002–T003)
3. Complete Phase 3: US1 node icons (T004–T007)
4. **STOP and VALIDATE**: Open app, verify all node categories show icons, edges are blue
5. Deploy/demo if ready — the graph already looks dramatically different

### Incremental Delivery

1. Phase 1 + 2 → Icon module ready
2. Add US1 → Test independently → **Deploy (MVP!)**
3. Add US2 → Scanline overlay → Deploy
4. Add US3 → Retro typography → Deploy
5. Add US4 → Legend icons → Deploy (full retro experience)
6. Each story adds visual fidelity without breaking previous stories

### Optimal Solo Developer Path

1. T001 → T002 → T003 (setup + icons — 3 tasks)
2. T004 → T005 → T006 → T007 (US1 — 4 tasks, **MVP complete**)
3. T008 → T009 (US2 — 2 tasks)
4. T010 → T011 → T012 (US3 — 3 tasks)
5. T013 → T014 → T015 → T016 (US4 — 4 tasks)
6. T017 → T018 → T019 (polish — 3 tasks)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [US*] label maps each task to its user story for traceability
- All SVG icons MUST include `xmlns`, `width`, `height` on root `<svg>` element (Firefox bug workaround)
- Use `encodeURIComponent()` for SVG data URIs, not `btoa()` / base64
- Press Start 2P renders ~30% larger than system fonts — compensate with reduced `font-size` values
- The scanline `body::after` sits at `z-index: 9999` — ensure detail panel and modals remain interactive via `pointer-events: none` on the overlay
- Edge "glow" on canvas is approximated via `hoverWidth` and brighter hover color — true CSS shadow is not available on canvas-rendered edges
- Commit after each task or logical group; stop at any checkpoint to validate the story independently
