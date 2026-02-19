# Tasks: Expand SEGA Arcade Graph Data

**Input**: Design documents from `/specs/004-expand-sega-arcade/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Yes — Constitution III requires test coverage. New QUnit test for role badge rendering. Data validated via `validate-data.ps1`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. This feature is primarily data expansion (JSON files) with one small code change (role badges in detail panel + CSS).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths included in all task descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Migrate existing data to new schema before any expansion begins

- [X] T001 Migrate 4 "created" edges to "designed" + "programmed" edges (Yu Suzuki → hang-on, space-harrier, out-run, after-burner) in src/data/edges.json
- [X] T002 Correct Mizuguchi edge label from "directed" to "produced" for sega-rally-championship in src/data/edges.json
- [X] T003 Add `roles` array to existing creator yu-suzuki (`["director", "producer", "designer", "programmer"]`) in src/data/nodes.json
- [X] T004 Add `roles` array to existing creator toshihiro-nagoshi (`["director", "producer", "designer"]`) in src/data/nodes.json
- [X] T005 Add `roles` array to existing creator yuji-naka (`["designer", "programmer"]`) in src/data/nodes.json
- [X] T006 Add `roles` array to existing creator rieko-kodama (`["artist", "director", "producer"]`) in src/data/nodes.json
- [X] T007 Add `roles` array to existing creator tetsuya-mizuguchi (`["designer", "producer"]`) in src/data/nodes.json

**Checkpoint**: Existing data migrated — `validate-data.ps1` should pass. No "created" edges remain. All 5 existing creators have `roles` arrays.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Code changes and CSS that MUST be complete before user stories can be fully verified

**⚠️ CRITICAL**: Role badge rendering must work before US1 can be visually validated

- [X] T008 [P] Add `.detail-roles` and `.role-badge` CSS classes for role badge styling in src/css/styles.css
- [X] T009 [P] Add role badge rendering logic in `renderNode()` function (after group badge, before summary) in src/js/detail-panel.js
- [X] T010 [P] Add QUnit test for role badge rendering (roles present, roles absent, escaping) in tests/unit/detail-panel.test.js

**Checkpoint**: Foundation ready — role badges render correctly when clicking a creator node. Test passes. Run `npm run lint` to verify.

---

## Phase 3: User Story 1 — Expanded Creator Network with Wikipedia Role Types (Priority: P1) 🎯 MVP

**Goal**: Expand from 5 to 20+ creators with structured `roles` arrays and Wikipedia-sourced credit edges. Each creator links to games via specific credit labels (directed, produced, designed, programmed, composed for, artwork for).

**Independent Test**: Open the app, expand full graph, count creator nodes (≥20). Click any new creator — verify role badges, summary, Wikipedia link. Check edges use credit-specific labels (not "created").

### Implementation for User Story 1

#### Platform + Game Prerequisites for Nishizawa (SC-001 fulfillment)

- [X] T094 [P] [US1] Add platform nodes system-1 (1983, Sega System 1) and system-2 (1985, Sega System 2) in src/data/nodes.json
- [X] T095 [US1] Add game nodes wonder-boy (1986, platform, Sega System 1) and wonder-boy-monster-land (1987, platform/RPG, Sega System 2) with "runs on" + "developed by" edges in src/data/nodes.json + src/data/edges.json

#### New Creator Nodes (15 new creators in src/data/nodes.json)

- [X] T011 [US1] Add creator node hiroshi-kawaguchi (composer, AM2) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T012 [US1] Add creator node takenobu-mitsuyoshi (composer, AM2) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T013 [US1] Add creator node takayuki-nakamura (composer, AM2) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T014 [US1] Add creator node hisao-oguchi (director/producer, AM3) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T015 [US1] Add creator node naoto-ohshima (designer/artist/director, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T016 [US1] Add creator node hirokazu-yasuhara (designer, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T017 [US1] Add creator node takashi-iizuka (designer/director, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T018 [US1] Add creator node jun-senoue (composer, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T019 [US1] Add creator node kazuyuki-hoshino (artist/designer, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T020 [US1] Add creator node shun-nakamura (designer/director, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T021 [US1] Add creator node tomoya-ohtani (composer, Sonic Team) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T022 [US1] Add creator node hideki-naganuma (composer, Smilebit) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T023 [US1] Add creator node masayoshi-yokoyama (designer/director/producer, RGG Studio) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T024 [US1] Add creator node richard-jacques (composer, Sega Europe) with roles, summary, Wikipedia URL in src/data/nodes.json
- [X] T096 [US1] Add creator node mie-kumagai (producer/director, AM3/Hitmaker) with roles `["director", "producer"]`, summary, Wikipedia URL in src/data/nodes.json
- [X] T097 [US1] Add credit edges for mie-kumagai: virtua-tennis (produced), gunblade-ny (produced), derby-owners-club (produced), confidential-mission (directed), sega-marine-fishing (produced), jambo-safari (produced), brave-firefighters (directed) in src/data/edges.json
- [ ] T092 [US1] ~~Add creator node ryuichi-nishizawa~~ — **BLOCKED**: English Wikipedia article https://en.wikipedia.org/wiki/Ryuichi_Nishizawa does not exist (verified Page ID: 0). Constitution VI prohibits adding nodes without a valid Wikipedia source.

#### Creator "worked at" Edges (14 new edges in src/data/edges.json)

- [X] T025 [US1] Add "worked at" edges for all 15 new creators to their respective studio nodes in src/data/edges.json

#### Existing Creator Edge Expansion (src/data/edges.json)

- [X] T026 [US1] Add additional credit edges for yu-suzuki to existing games (power-drift directed; g-loc directed/designed/programmed; fighting-vipers/virtua-cop/virtua-cop-2/sonic-the-fighters/scud-race/daytona-usa/outrun-2 produced; virtua-fighter-3 directed+produced; virtua-cop-3 directed; virtua-fighter-4 directed+produced) in src/data/edges.json
- [X] T027 [US1] Add additional credit edges for toshihiro-nagoshi to existing games (g-loc designed; virtua-racing designed; virtua-fighter designed; virtua-fighter-2 designed; scud-race directed+produced; virtua-fighter-3 designed; spikeout directed+produced+designed; daytona-usa-2 produced) in src/data/edges.json
- [X] T028 [US1] Add additional credit edges for yuji-naka (samba-de-amigo produced) and tetsuya-mizuguchi (sega-rally-2 produced) in src/data/edges.json

#### New Creator Credit Edges to Existing Games (src/data/edges.json)

- [X] T029 [US1] Add "composed for" edges for hiroshi-kawaguchi to existing games (hang-on, space-harrier, fantasy-zone, out-run, after-burner, power-drift, g-loc-air-battle, segasonic-the-hedgehog, virtua-fighter-3, wave-runner) in src/data/edges.json
- [X] T030 [US1] Add "composed for" edges for takenobu-mitsuyoshi to existing games (g-loc-air-battle, virtua-racing, daytona-usa, virtua-fighter-2, virtua-striker, sega-rally-championship, manx-tt-superbike, sonic-the-fighters, virtua-fighter-3, daytona-usa-2) in src/data/edges.json
- [X] T031 [US1] Add "composed for" edges for takayuki-nakamura to existing games (virtua-fighter, virtua-fighter-2, virtua-fighter-3) in src/data/edges.json
- [X] T032 [US1] Add credit edges for hisao-oguchi (rad-mobile directed), naoto-ohshima (segasonic-the-hedgehog designed), jun-senoue (sega-rally-2 composed for), shun-nakamura (samba-de-amigo directed), tomoya-ohtani (samba-de-amigo composed for), richard-jacques (outrun-2 composed for) in src/data/edges.json
- [ ] T093 [US1] ~~Add credit edges for ryuichi-nishizawa~~ — **BLOCKED**: Depends on T092 (creator node). Wonder Boy games remain in graph but without creator credit edges.
- [X] T033 [US1] Run `validate-data.ps1` and verify all new creators + edges pass validation

**Checkpoint**: 20 creator nodes visible (SC-001 met via Mie Kumagai as 15th new creator instead of Nishizawa). All edges use specific credit labels. Role badges display on click. Wonder Boy games present but lack creator credit edges (Nishizawa blocked — no Wikipedia article).

---

## Phase 4: User Story 2 — More Arcade Games with Full Credit Chains (Priority: P2)

**Goal**: Add 20+ new arcade game nodes spanning 1981–2018, each linked to studio ("developed by"), platform ("runs on"), and relevant creators via credit edges. Games sourced from research.md Part 8.

**Independent Test**: Count game nodes (≥87 total, ≥20 new). Click any new game — verify year, genre, summary, Wikipedia URL. Check edges to studio, platform, and creators.

### Platform Nodes Required by New Games (src/data/nodes.json)

> **Note**: system-1 and system-2 already added in Phase 3 (T094). y-board, system-24, system-32 already exist in dataset.

- [X] T034 [P] [US2] Add platform node vco-object (1981, VCO Object, Z80 + sprite scaling) in src/data/nodes.json
- [X] T038 [P] [US2] Add platform node system-18 (1989, Sega System 18, improved System 16) in src/data/nodes.json
- [X] T041 [P] [US2] Add platform node system-c (1990, Sega System C, Mega Drive-based arcade) in src/data/nodes.json
- [X] T042 [P] [US2] Add platform node alls (2018, Sega ALLS, Windows 10 IoT + Unreal Engine 4) in src/data/nodes.json

### Pre-System 16 Game Nodes (1981–1985) in src/data/nodes.json

- [X] T043 [US2] Add game node turbo-arcade (1981, racing, VCO Object) in src/data/nodes.json
- [X] T044 [US2] Add game node buck-rogers (1982, rail shooter, VCO Object) in src/data/nodes.json
- [X] T045 [US2] Add game node zaxxon (1982, scrolling shooter) in src/data/nodes.json
- [X] T046 [US2] Add game node pengo (1982, maze) in src/data/nodes.json
- [X] T047 [US2] Add game node congo-bongo (1983, platform) in src/data/nodes.json
- [X] T048 [US2] Add game node astron-belt (1983, rail shooter, Sega Laserdisc) in src/data/nodes.json
- [X] T049 [US2] Add game node star-trek-sos (1983, space combat sim) in src/data/nodes.json
- [X] T050 [US2] Add game node flicky (1984, platform, Sega System 1) in src/data/nodes.json
- [X] T051 [US2] Add game node choplifter (1985, scrolling shooter, Sega System 1) in src/data/nodes.json

### System 1/16 Era Game Nodes (1986–1989) in src/data/nodes.json

> **Note**: wonder-boy and wonder-boy-monster-land moved to Phase 3 US1 (T094–T095).

- [X] T054 [US2] Add game node alien-syndrome (1987, run and gun, System 16) in src/data/nodes.json
- [X] T055 [US2] Add game node dynamite-dux (1988, beat 'em up, System 16) in src/data/nodes.json
- [X] T058 [US2] Add game node galaxy-force (1988, rail shooter, Sega Y Board) in src/data/nodes.json
- [X] T059 [US2] Add game node eswat (1989, run and gun, System 16) in src/data/nodes.json
- [X] T060 [US2] Add game node shadow-dancer (1989, platform/action, Sega System 18) in src/data/nodes.json

### System 32/Modern Era Game Nodes (1990–2018) in src/data/nodes.json

> **Note**: columns, bonanza-bros, rad-mobile, golden-axe-revenge-of-death-adder already exist in dataset — only credit edges needed.

- [X] T062 [US2] Add game node alien-storm (1990, beat 'em up, Sega System 18) in src/data/nodes.json
- [X] T066 [US2] Add game node hotd-scarlet-dawn (2018, rail shooter, Sega ALLS) in src/data/nodes.json

### Additional Games for FR-006 Coverage (src/data/nodes.json)

- [X] T086 [US2] Add game node super-monaco-gp (1989, racing, X-Board) in src/data/nodes.json
- [X] T087 [US2] Add game node outrunners (1992, racing, System 32) in src/data/nodes.json
- [X] T088 [US2] Add game node ollie-king (2003, sports, Chihiro) in src/data/nodes.json

### Game Edges: "developed by" + "runs on" (src/data/edges.json)

- [X] T067 [US2] Add "developed by" edge for each new game to its studio, and "runs on" edge to its platform in src/data/edges.json

### Game → Creator Credit Edges (src/data/edges.json)

- [X] T069 [US2] Add credit edges for dynamite-dux (yu-suzuki produced, kawaguchi composed for) in src/data/edges.json
- [X] T071 [US2] Add credit edge for hotd-scarlet-dawn (kawaguchi composed for) in src/data/edges.json
- [X] T073 [US2] Add credit edge for rad-mobile (hisao-oguchi directed) — if not already added in T032, update here in src/data/edges.json
- [X] T089 [US2] Add credit edges for super-monaco-gp (oguchi directed, kawaguchi composed for) in src/data/edges.json
- [X] T090 [US2] Add credit edges for outrunners (kawaguchi + mitsuyoshi + nakamura composed for) in src/data/edges.json
- [X] T091 [US2] Add credit edges for ollie-king (naganuma composed for, yokoyama directed) in src/data/edges.json
- [X] T074 [US2] Run `validate-data.ps1` and verify all new game nodes + edges pass validation

**Checkpoint**: 87+ game nodes visible (67 existing + 2 from US1 + 18+ from US2). Every game has "developed by" + "runs on" edges. Games with known creators have credit edges. New games include Super Monaco GP, OutRunners, and Ollie King for cross-creator connectivity.

---

## Phase 5: User Story 3 — Additional Arcade Platforms for Coverage Gaps (Priority: P3)

**Goal**: Ensure every game has a valid "runs on" edge to a platform. Add any remaining platforms needed by new games that weren't covered in Phase 4.

**Independent Test**: Verify every game node has exactly one "runs on" edge. Click new platform nodes — verify release year, generation, features, Wikipedia URL.

### Implementation for User Story 3

- [X] T075 [P] [US3] Add platform nodes for remaining boards if needed: sega-laserdisc (1983), g80 (1981), or pre-system-1 generic platform for Zaxxon/Pengo/Congo Bongo custom boards in src/data/nodes.json
- [X] T076 [P] [US3] Add "runs on" edges for zaxxon, pengo, congo-bongo, star-trek-sos, and astron-belt to their respective platform nodes in src/data/edges.json
- [X] T077 [P] [US3] Add "division of" edge for any new platform to sega company node if applicable in src/data/edges.json
- [X] T078 [US3] Run `validate-data.ps1` and verify all platform nodes + "runs on" edges pass validation
- [X] T098 [US3] Add platform nodes super-scaler (1985, Sega Super Scaler) and outrun-board (1986, Sega OutRun Hardware) in src/data/nodes.json — remediation for missing "runs on" edges on hang-on, space-harrier, out-run
- [X] T099 [US3] Add "runs on" edges: hang-on → super-scaler, space-harrier → super-scaler, out-run → outrun-board in src/data/edges.json
- [X] T100 [US1] Add "artwork for" edge: rieko-kodama → quartet in src/data/edges.json — Wikipedia confirms Kodama's character design work on Quartet

**Checkpoint**: Every game has exactly one "runs on" edge. All new platforms have complete metadata (releaseYear, generation, notableFeatures, wikipediaUrl, wikidataId).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, performance check, and visual verification across all stories

- [X] T079 Run full `validate-data.ps1` — verify zero errors across all nodes and edges
- [X] T080 Run `npm run lint` — verify zero Biome linting/formatting errors
- [X] T081 Open tests/index.html — verify all QUnit tests pass (including new role badge test)
- [X] T082 Open app in browser — perform 9-point manual verification from quickstart.md (full graph, creator count ≥20, game count ≥80, edge labels, multi-edges, role badges, new platforms, ego graph, performance <5s)
- [X] T083 Verify total node count stays under 200 (FR-012) — count nodes in nodes.json
- [X] T084 Verify SC-001 through SC-007 success criteria are met per spec.md
- [X] T085 Commit all changes on branch 004-expand-sega-arcade

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. Migrates existing data.
- **Phase 2 (Foundational)**: Can run in parallel with Phase 1 (different files: CSS/JS vs JSON). BLOCKS visual validation of user stories.
- **Phase 3 (US1 — Creators)**: Depends on Phase 1 (edges.json migrated) + Phase 2 (role badges work). Includes platform prerequisites (system-1, system-2) and Wonder Boy games for Nishizawa. **MVP delivery point.**
- **Phase 4 (US2 — Games)**: Depends on Phase 1 (edges.json clean). Platform nodes (T034–T042) must be added before game nodes that reference them.
- **Phase 5 (US3 — Platforms)**: Depends on Phase 4 (games added, gaps identified). Fills remaining platform coverage.
- **Phase 6 (Polish)**: Depends on all previous phases.

### User Story Dependencies

- **US1 (Creators)**: Independent after Setup + Foundational. Can be delivered as MVP.
- **US2 (Games)**: Independent after Setup. Platforms added inline (T034–T042) before games need them.
- **US3 (Platforms)**: Depends on US2 (gap analysis after games added). Fills remaining platform holes.

### File Conflict Map

| File | Phases Writing | Sequential Constraint |
|------|---------------|----------------------|
| src/data/nodes.json | 1, 3, 4, 5 | All node additions sequential within phases (same file) |
| src/data/edges.json | 1, 3, 4, 5 | All edge additions sequential within phases (same file) |
| src/css/styles.css | 2 | One-time change, no conflicts |
| src/js/detail-panel.js | 2 | One-time change, no conflicts |
| tests/unit/detail-panel.test.js | 2 | One-time change, no conflicts |

### Parallel Opportunities

- **Phase 2**: T008, T009, T010 are all [P] — different files (CSS, JS, test JS)
- **Phase 4**: Platform nodes T035–T042 are [P] — same file but can be batched as one edit
- **Across phases**: Phase 1 (JSON) and Phase 2 (CSS/JS/test) touch different files — can proceed in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# These can all run in parallel (different files):
T008: Add role badge CSS in src/css/styles.css
T009: Add role badge rendering in src/js/detail-panel.js
T010: Add role badge QUnit test in tests/unit/detail-panel.test.js
```

## Parallel Example: Phase 1 + Phase 2

```bash
# Phase 1 (JSON data) and Phase 2 (CSS/JS) touch different files:
Developer A: T001–T007 (edge migration + roles in nodes.json/edges.json)
Developer B: T008–T010 (role badge CSS + JS + test)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (edge migration + roles on existing creators)
2. Complete Phase 2: Foundational (role badge CSS + JS + test)
3. Complete Phase 3: US1 (14 new creators + all credit edges)
4. **STOP and VALIDATE**: Run validate-data.ps1 + visual check + QUnit tests
5. Demo: 19+ creators, role badges, specific credit labels — core value delivered

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (existing data clean, role badges work)
2. Phase 3 (US1) → Creators added → **MVP!** (validate independently)
3. Phase 4 (US2) → Games + platforms added → Richer catalog (validate independently)
4. Phase 5 (US3) → Platform gaps filled → Full coverage (validate independently)
5. Phase 6 → Final polish, all success criteria checked, commit

### SC-001 Note

15 new creators (Nishizawa blocked — replaced by Mie Kumagai, added in Phase 3 T096) + 5 existing = 20, meeting the SC-001 minimum target exactly. Wonder Boy games added in Phase 3 (T094–T095) currently lack creator credit edges.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- This feature is ~80% data (JSON editing), ~20% code (role badge rendering)
- `validate-data.ps1` is the primary automated validation tool — run after every JSON batch
- Edge labels work with vis-network automatically — no graph.js changes needed (FR-014)
- `additionalProperties: false` in schemas — every new field must be in the contract
- Uncertain edges from research.md: Oguchi → crazy-taxi and Mizuguchi → samba-de-amigo excluded (Wikipedia ambiguous). Kodama → quartet confirmed and added (T100).
- wikidataId and thumbnail fields need Wikidata lookups during implementation — not researched yet
- All summaries sourced from Wikipedia article opening paragraphs (Constitution VI)
