# Tasks: Major SEGA Arcade Data Expansion

**Input**: Design documents from `/specs/feature/006-expand-sega-arcade-data/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in spec. Existing QUnit tests must pass (FR-012). Validation via PowerShell script.

**Organization**: Tasks grouped by user story. US3 (platforms & studios) is foundational — must complete before US1 (games) can add edges. All tasks modify the same 2 files (`src/data/nodes.json`, `src/data/edges.json`), so no parallelism is possible.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies) — not applicable for this data-only feature
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks target `src/data/nodes.json` and/or `src/data/edges.json`

---

## Phase 1: Setup

**Purpose**: Verify baseline state and branch readiness

- [x] T001 Verify branch is `feature/006-expand-sega-arcade-data` and working tree is clean
- [x] T002 Run baseline validation — confirm 140 nodes, 296 edges, 0 duplicate IDs, 0 broken edges in src/data/nodes.json and src/data/edges.json

**Checkpoint**: Baseline confirmed — ready for data expansion

---

## Phase 2: Foundational (Studios, Platforms & Edge Corrections)

**Purpose**: Add studio and platform nodes that new games depend on. Fix existing edge attribution errors. This phase serves US3 but is a blocking prerequisite for US1 game additions.

**⚠️ CRITICAL**: No game additions (Phase 3) can begin until studios and platforms exist as edge targets.

- [x] T003 Add 4 new studio nodes (Compile, Westone, Sega Rosso, Sega AM4) to src/data/nodes.json — use research.md Part 4 for all field values; each needs id, label, group:"studio", summary, founded, defunct, status, focus, wikipediaUrl, wikidataId, thumbnail
- [x] T004 Add 2 "division of" edges (sega-rosso → sega, sega-am4 → sega) to src/data/edges.json
- [x] T005 Add 5 new platform nodes (Hikaru, RingEdge, RingEdge 2, Nu, Europa-R) to src/data/nodes.json — use research.md Part 3 for all field values; each needs id, label, group:"platform", summary, releaseYear, generation, notableFeatures, wikipediaUrl, wikidataId, thumbnail
- [x] T006 Fix Initial D developer edge: change existing edge `{ from: "initial-d-arcade-stage", to: "sega", label: "developed by" }` to `{ from: "initial-d-arcade-stage", to: "sega-rosso", label: "developed by" }` in src/data/edges.json — per data-model.md edge corrections
- [x] T007 Add Westone developer edges for Wonder Boy games in src/data/edges.json: add `{ from: "wonder-boy", to: "westone", label: "developed by" }` and `{ from: "wonder-boy-monster-land", to: "westone", label: "developed by" }` — keep existing sega edges as publisher attribution
- [x] T008 Run validation — confirm 149 nodes (140+4+5), 300 edges (296+2+2), 0 duplicate IDs, 0 broken edges

**Checkpoint**: Foundation ready — all studio and platform targets exist for game edge references

---

## Phase 3: User Story 1 — Comprehensive SEGA Arcade History (Priority: P1) 🎯 MVP

**Goal**: Add 69 new game nodes spanning SEGA's full arcade history (1966–2018), each with "developed by" and "runs on" edges. This is the core content expansion.

**Independent Test**: Open graph → count game nodes (should be 157+) → click new games → verify detail panel shows complete data with Wikipedia links → verify each game has "developed by" and "runs on" edges.

**Source**: research.md Part 2 — all game field values (id, label, releaseYear, genre, developer, platform, wikipediaUrl) are listed per era. Use data-model.md studio/platform assignment rules for edge targets.

### Era Batches

- [ ] T009 [US1] Add Era 1: 6 Pre-digital/EM games (1966–1980) to src/data/nodes.json — Periscope, Heavyweight Champ, Head On, Monaco GP, Deep Scan, Carnival — plus 12 edges (6× developed-by → sega, 6× runs-on → pre-system-1) to src/data/edges.json
- [ ] T010 [US1] Add Era 2: 5 Early Digital/G80 games (1981–1982) to src/data/nodes.json — Frogger, Astro Blaster, Space Fury, Subroc-3D, Tac/Scan — plus 10 edges (5× developed-by → sega, 4× runs-on → g80, 1× runs-on → pre-system-1 for Frogger) to src/data/edges.json
- [ ] T011 [US1] Add Era 3: 5 System 1/2 games (1983–1985) to src/data/nodes.json — Champion Boxing, Bank Panic, My Hero, Teddy Boy Blues, Ninja Princess — plus 10 edges (5× developed-by → sega, 5× runs-on → system-1) to src/data/edges.json
- [ ] T012 [US1] Add Era 4: 7 System 16/Super Scaler games (1986–1989) to src/data/nodes.json — Enduro Racer, Action Fighter, SDI, Scramble Spirits, Turbo Out Run, Wrestle War, Crack Down — plus 14 edges to src/data/edges.json; use research.md for per-game platform targets (super-scaler, system-16, outrun-board, system-24)
- [ ] T013 [US1] Add Era 5: 9 System 18/32 Transition games (1989–1993) to src/data/nodes.json — Moonwalker, GP Rider, Laser Ghost, Bloxeed, Puyo Puyo, Rail Chase, Spider-Man, Arabian Fight, Alien³: The Gun — plus 18 edges to src/data/edges.json; note Puyo Puyo developed-by → compile, Rail Chase developed-by → sega-am3
- [ ] T014 [US1] Add Era 6: 7 Model 2/ST-V games (1993–1997) to src/data/nodes.json — Golden Axe: The Duel, Puyo Puyo Tsu, Wing War, Puyo Puyo Sun, Virtua Fighter Kids, Virtua Striker 2, Top Skater — plus 14 edges to src/data/edges.json; note Puyo Puyo Tsu/Sun developed-by → compile
- [ ] T015 [US1] Add Era 7: 4 Model 3 games (1996–1999) to src/data/nodes.json — Lost World: Jurassic Park, Star Wars Trilogy Arcade, L.A. Machineguns, F355 Challenge — plus 8 edges to src/data/edges.json
- [ ] T016 [US1] Add Era 8: 10 NAOMI/NAOMI 2 games (1998–2004) to src/data/nodes.json — Sega Bass Fishing, Fighting Vipers 2, Zombie Revenge, Typing of the Dead, Eighteen Wheeler, Outtrigger, Beach Spikers, Planet Harriers, WCCF, Puyo Puyo Fever — plus 20 edges to src/data/edges.json; note Planet Harriers runs-on → hikaru, Puyo Puyo Fever developed-by → sonic-team
- [ ] T017 [US1] Add Era 9: 2 Chihiro games (2002–2005) to src/data/nodes.json — Ghost Squad, OutRun 2 SP — plus 4 edges (2× developed-by → sega-am2, 2× runs-on → chihiro) to src/data/edges.json
- [ ] T018 [US1] Add Era 10: 5 Lindbergh/Europa-R games (2005–2009) to src/data/nodes.json — Sangokushi Taisen, Virtua Tennis 3, Rambo, Sega Rally 3, Sega Race TV — plus 10 edges to src/data/edges.json; note Sega Rally 3 and Sega Race TV runs-on → europa-r
- [ ] T019 [US1] Add Era 11: 3 Card-based games (2003–2016) to src/data/nodes.json — Mushiking, Love and Berry, KanColle Arcade — plus 6 edges to src/data/edges.json; note KanColle runs-on → nu
- [ ] T020 [US1] Add Era 12: 6 Modern games (2009–2018) to src/data/nodes.json — Border Break, Hatsune Miku Project DIVA Arcade, Maimai, Chunithm, Puyo Puyo Tetris, Ongeki — plus 12 edges to src/data/edges.json; note runs-on targets: ringedge, ringedge2, nu per research.md
- [ ] T021 [US1] Run validation — confirm 218 nodes (149+69 games), ~438 edges (300+138 game edges), 0 duplicate IDs, 0 broken edges, and game count ≥157

**Checkpoint**: User Story 1 complete — all 69 new games added with full metadata and edges. Graph should show comprehensive SEGA arcade history from 1966 through 2018.

---

## Phase 4: User Story 2 — Expanded Creator Network (Priority: P2)

**Goal**: Add 6 new creator nodes and all their relationship edges, plus credit edges from existing creators to newly added games.

**Independent Test**: Count creator nodes (should be 26+) → click new creators → verify detail panel shows birth year, roles, summary, Wikipedia link → verify worked-at and credit edges exist.

**Source**: research.md Part 5 for creator field values and edge mappings.

- [ ] T022 [US2] Add 6 new creator nodes to src/data/nodes.json — Noriyoshi Ohba, Makoto Uchida, Ryuta Ueda, Hayao Nakayama, David Rosen, Masamitsu Niitani — each needs id, label, group:"creator", summary, birthYear, notableRoles, roles[], gender, wikipediaUrl, wikidataId, thumbnail
- [ ] T023 [US2] Add "worked at" edges for new creators to src/data/edges.json — noriyoshi-ohba → sega-am1, makoto-uchida → sega, ryuta-ueda → sonic-team, hayao-nakayama → sega, david-rosen → sega, masamitsu-niitani → compile (6 edges)
- [ ] T024 [US2] Add credit edges from new creators to games in src/data/edges.json — Ohba directed house-of-the-dead + house-of-the-dead-2; Uchida directed golden-axe + alien-storm + golden-axe-revenge-of-death-adder; Ueda directed puyo-puyo-fever + puyo-puyo-tetris; Niitani designed puyo-puyo + puyo-puyo-tsu (~9 edges)
- [ ] T025 [US2] Add credit edges from existing creators to newly added games in src/data/edges.json — Yu Suzuki designed champion-boxing + produced f355-challenge; Hisao Oguchi produced eighteen-wheeler + top-skater; Hiroshi Kawaguchi composed-for enduro-racer + scramble-spirits; Takenobu Mitsuyoshi composed-for michael-jacksons-moonwalker (~7 edges)
- [ ] T026 [US2] Run validation — confirm 224 nodes (218+6 creators), ~454 edges, 0 duplicate IDs, 0 broken edges, and creator count ≥26

**Checkpoint**: User Story 2 complete — all creators added with full metadata and relationship edges. Graph shows expanded creator network with proper game credits.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, regression testing, and acceptance verification

- [ ] T027 Run full validation against all data integrity rules: unique IDs (kebab-case), valid groups, valid wikipediaUrl format, valid wikidataId format, valid edge labels (11-value enum), no broken edges, no orphan nodes, no duplicate edges — use validate-data.ps1 or PowerShell script from quickstart.md in src/data/nodes.json and src/data/edges.json
- [ ] T028 Open tests/index.html in browser and run all QUnit tests — confirm 0 failures, 0 regressions per FR-012
- [ ] T029 Open src/index.html via serve.ps1 and perform manual visual test: graph renders without JS errors, new nodes appear and are clickable, detail panel shows correct data for new nodes, ego-graph spotlight works on new nodes, graph stabilizes within reasonable time
- [ ] T030 Run quickstart.md acceptance checklist — verify: 224+ total nodes, 450+ total edges, 0 duplicate IDs, 0 broken edges, all existing 140 original nodes and 296 original edges intact

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ─────────────────► Phase 2: Foundational (Studios, Platforms, Edge Fixes)
                                       │
                                       ▼
                                  Phase 3: US1 — Games (69 nodes, 12 era batches)
                                       │
                                       ▼
                                  Phase 4: US2 — Creators (6 nodes + credit edges)
                                       │
                                       ▼
                                  Phase 5: Polish (validation, testing, acceptance)
```

- **Phase 1 → Phase 2**: Sequential — must verify baseline before modifying data
- **Phase 2 → Phase 3**: **BLOCKING** — studios and platforms must exist before games reference them in edges
- **Phase 3 → Phase 4**: Sequential — creator credit edges reference games added in Phase 3
- **Phase 4 → Phase 5**: Sequential — final validation requires all data to be in place

### Within Phase 3 (Era Batches)

Era batches (T009–T020) are **strictly sequential** — each writes to the same `nodes.json` and `edges.json` files. Process in chronological order (Era 1 → Era 12) to maintain a logical progression through SEGA's arcade history.

### User Story Dependencies

- **US3 (Platforms & Studios)**: Foundational — no dependencies, but BLOCKS US1
- **US1 (Games)**: Depends on US3 completion (needs studio/platform edge targets)
- **US2 (Creators)**: Depends on US1 completion (needs game nodes for credit edges)

### Parallel Opportunities

**None for this feature.** All tasks modify the same 2 JSON files (`src/data/nodes.json`, `src/data/edges.json`), preventing concurrent execution. This is inherent to a data-only expansion with a single data store.

---

## Implementation Strategy

### MVP First (Phase 1–3 = US1 Complete)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: Add studios + platforms + edge corrections
3. Complete Phase 3: Add all 69 games with edges
4. **STOP and VALIDATE**: Run validation, open graph, verify 218 nodes render correctly
5. This delivers the core value — a rich, expansive arcade history graph

### Incremental Delivery

1. Setup + Foundational → 149 nodes, foundation ready
2. Add Games (US1) → 218 nodes, core content complete → **MVP deliverable**
3. Add Creators (US2) → 224 nodes, full creator network → **Enhanced deliverable**
4. Polish → Validated, tested, acceptance-checked → **Final deliverable**

### Batch Cadence

Each era batch (T009–T020) should be followed by a quick inline validation:
```powershell
$n = Get-Content src/data/nodes.json -Raw | ConvertFrom-Json
$e = Get-Content src/data/edges.json -Raw | ConvertFrom-Json
$ids = $n | ForEach-Object { $_.id }
$dups = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
$broken = $e | Where-Object { $_.from -notin $ids -or $_.to -notin $ids }
"Nodes: $($n.Count) | Edges: $($e.Count) | Dups: $($dups.Count) | Broken: $($broken.Count)"
```

Catch errors per-batch rather than accumulating them across all 69 games.

---

## Notes

- All game data sourced from research.md — every field value is pre-cataloged per era
- Wikipedia URLs are pre-verified — see research.md Part 7 for excluded candidates
- `wikidataId` values may need lookup during implementation — use `Q0` placeholder if needed, resolve before Phase 5
- `thumbnail` can be `null` for all new nodes — no requirement to populate images
- Edge corrections (T006, T007) modify existing edges in `edges.json` — use care not to duplicate or remove unrelated edges
- Commit after each phase checkpoint for safe rollback points
