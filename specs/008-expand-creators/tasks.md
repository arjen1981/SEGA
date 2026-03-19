# Tasks: Expand Creator Nodes with Wikidata

**Input**: Design documents from `/specs/008-expand-creators/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No new unit tests required â€” no code logic changes. Data integrity validated via `validate-data.ps1`. Existing QUnit tests must continue to pass.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US1 (creator expansion) is the core value; US3 (preserve existing data) is embedded as a constraint within US1 tasks; US2 (attribution) is a separate phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Constitution amendment and enrichment script infrastructure

- [x] T001 Amend Constitution Principle VI to v1.3.0 â€” add structured data exception for Wikidata in .specify/memory/constitution.md
- [x] T002 Create scripts/ directory and enrichment script skeleton scripts/enrich-creators.ps1 with SPARQL query, exclusion list, and game label mapping table
- [x] T003 Implement Wikidata SPARQL query function in scripts/enrich-creators.ps1 â€” query for Sega game creators using P943, P57, P86, P170, P162, P3080 properties
- [x] T004 Implement exclusion filter in scripts/enrich-creators.ps1 â€” filter out Q2831 (Michael Jackson), Q131472725, Q260125, Q3276468, Q358842, Q3180045, Q464833, Q5290049, Q3098670, Q56348353, Q56348334, Q1155641
- [x] T005 Implement game label â†’ graph ID mapping table in scripts/enrich-creators.ps1 â€” map Wikidata game labels to existing graph node IDs (e.g., "ESWAT: City Under Siege" â†’ "eswat")
- [x] T006 Implement Wikidata property â†’ edge label mapping in scripts/enrich-creators.ps1 â€” P943/P57â†’"directed", P86â†’"composed for", P170â†’"designed", P162â†’"produced", P3080â†’"designed"
- [x] T007 Implement Wikipedia API enrichment function in scripts/enrich-creators.ps1 â€” fetch summary and thumbnail for creators with English Wikipedia pages
- [x] T008 Implement idempotent merge logic in scripts/enrich-creators.ps1 â€” merge new nodes/edges into existing JSON without duplicates (FR-006, FR-011)
- [x] T009 Implement summary report output in scripts/enrich-creators.ps1 â€” print creators added, edges added, Wikipedia-enriched count, Wikidata-only count (FR-007)
- [x] T010 Test enrichment script end-to-end â€” run scripts/enrich-creators.ps1 and verify output matches expected additions from data-model.md

**Checkpoint**: Constitution amended. Enrichment script functional and idempotent. Ready for data expansion.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify existing data baseline and validate no regressions before expansion

**âš ï¸ CRITICAL**: Baseline must be captured before any data changes

- [x] T011 Capture pre-expansion baseline â€” record current counts: 25 creators, 49 games with creator links, 443 edges in src/data/nodes.json and src/data/edges.json
- [x] T012 Run validate-data.ps1 to confirm clean starting state
- [x] T013 Run all existing QUnit tests (open tests/index.html) to confirm green baseline

**Checkpoint**: Baseline captured, validation passing, all tests green. Data expansion can begin.

---

## Phase 3: User Story 1 â€” Discover More Creators Behind Arcade Games (Priority: P1) ðŸŽ¯ MVP

**Goal**: Expand from 25 to 45 creator nodes with Wikidata-sourced credit edges. New creators link to games via specific credit labels (directed, composed for, produced, designed). At least 55 games should have creator connections.

**Independent Test**: Open the app, count creator nodes (â‰¥35). Click a new creator (e.g., Yuzo Koshiro) â€” verify detail panel shows name, roles, summary, and linked games. Navigate to a previously unlinked game (e.g., Gain Ground) â€” verify creator edges appear.

### User Story 3 (Preserve Existing Data) is embedded as a constraint: every task below must NOT overwrite or remove existing nodes/edges (FR-005).

### Tier 1: New creators linked to existing games (no new game nodes needed)

- [x] T014 [P] [US1] Add creator node katsuhiro-hayashi (Katsuhiro Hayashi, Q11532861, composer, birthYear 1965, no Wikipedia) in src/data/nodes.json
- [x] T015 [P] [US1] Add creator node yasuhiro-kawakami (Yasuhiro Kawakami, Q8049979, composer, no birthYear, no Wikipedia) in src/data/nodes.json
- [x] T016 [P] [US1] Add creator node shinichi-sakamoto (Shinichi Sakamoto, Q125399846, composer, birthYear 1966, no Wikipedia) in src/data/nodes.json
- [x] T017 [US1] Add edges for Tier 1 creators in src/data/edges.json: katsuhiro-hayashiâ†’gain-ground (composed for), katsuhiro-hayashiâ†’rambo-arcade (composed for), yasuhiro-kawakamiâ†’scramble-spirits (composed for), yasuhiro-kawakamiâ†’crack-down (composed for), shinichi-sakamotoâ†’wonder-boy-in-monster-land (composed for)
- [x] T018 [US1] Add "worked at" edges for Tier 1 creators in src/data/edges.json: katsuhiro-hayashiâ†’sega, yasuhiro-kawakamiâ†’sega, shinichi-sakamotoâ†’sega
- [x] T019 [US1] Run validate-data.ps1 â€” verify Tier 1 additions pass validation

### Tier 2: New creators with Wikipedia pages (need associated game nodes)

#### Yuzo Koshiro + Streets of Rage

- [x] T020 [P] [US1] Add game node streets-of-rage (Streets of Rage, 1991, beat 'em up) with Wikipedia data, "developed by" and "runs on" edges in src/data/nodes.json + src/data/edges.json
- [x] T021 [US1] Add creator node yuzo-koshiro (Yuzo Koshiro, Q948524, composer, birthYear 1967, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T022 [US1] Add edges yuzo-koshiroâ†’streets-of-rage (composed for), "worked at" edge yuzo-koshiroâ†’sega in src/data/edges.json

#### Naofumi Hataya + Golden Axe II/III

- [x] T023 [P] [US1] Add game node golden-axe-ii (Golden Axe II, 1991, beat 'em up) with Wikipedia data, "developed by" and "runs on" edges in src/data/nodes.json + src/data/edges.json
- [x] T024 [P] [US1] Add game node golden-axe-iii (Golden Axe III, 1993, beat 'em up) with Wikipedia data, "developed by" and "runs on" edges in src/data/nodes.json + src/data/edges.json
- [x] T025 [US1] Add creator node naofumi-hataya (Naofumi Hataya, Q6964522, composer, birthYear 1966, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T026 [US1] Add edges naofumi-hatayaâ†’golden-axe-ii (composed for), naofumi-hatayaâ†’golden-axe-iii (composed for), "worked at" edge naofumi-hatayaâ†’sega in src/data/edges.json

#### Hidenori Shoji + Yakuza 0

- [x] T027 [P] [US1] Add game node yakuza-0 (Yakuza 0, 2015, action-adventure) with Wikipedia data, "developed by" and "runs on" edges in src/data/nodes.json + src/data/edges.json
- [x] T028 [US1] Add creator node hidenori-shoji (Hidenori Shoji, Q5752541, composer, birthYear 1975, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T029 [US1] Add edge hidenori-shojiâ†’yakuza-0 (composed for), "worked at" edge hidenori-shojiâ†’sega in src/data/edges.json

#### Hitoshi Sakimoto + Valkyria Chronicles

- [x] T030 [P] [US1] Add game node valkyria-chronicles (Valkyria Chronicles, 2008, tactical RPG) with Wikipedia data, "developed by" and "runs on" edges in src/data/nodes.json + src/data/edges.json
- [x] T031 [US1] Add creator node hitoshi-sakimoto (Hitoshi Sakimoto, Q1196596, composer, birthYear 1969, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T032 [US1] Add edge hitoshi-sakimotoâ†’valkyria-chronicles (composed for) in src/data/edges.json

#### Saori Kobayashi

- [x] T033 [US1] Add creator node saori-kobayashi (Saori Kobayashi, Q3950173, composer, no birthYear, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T034 [US1] Add "worked at" edge saori-kobayashiâ†’sega in src/data/edges.json

#### Tatsuyuki Maeda

- [x] T035 [US1] Add creator node tatsuyuki-maeda (Tatsuyuki Maeda, Q3516110, composer, birthYear 1968, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T036 [US1] Add "worked at" edge tatsuyuki-maedaâ†’sega in src/data/edges.json

#### Hideaki Kobayashi

- [x] T037 [US1] Add creator node hideaki-kobayashi (Hideaki Kobayashi, Q5752243, composer, birthYear 1973, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T038 [US1] Add "worked at" edge hideaki-kobayashiâ†’sega in src/data/edges.json

#### KÅhei Tanaka + Sakura Wars

- [x] T039 [P] [US1] Add game node sakura-wars (Sakura Wars, 1996, tactical RPG/dating sim) with Wikipedia data, "developed by" and "runs on" edges in src/data/nodes.json + src/data/edges.json
- [x] T040 [US1] Add creator node kohei-tanaka (KÅhei Tanaka, Q2562073, composer, birthYear 1954, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T041 [US1] Add edge kohei-tanakaâ†’sakura-wars (composed for) in src/data/edges.json

#### Spencer Nilsen

- [x] T042 [US1] Add creator node spencer-nilsen (Spencer Nilsen, Q4118577, composer, birthYear 1961, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T043 [US1] Add "worked at" edge spencer-nilsenâ†’sega in src/data/edges.json

#### Motoaki Takenouchi

- [x] T044 [US1] Add creator node motoaki-takenouchi (Motoaki Takenouchi, Q3325232, composer, birthYear 1967, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T045 [US1] Add "worked at" edge motoaki-takenouchiâ†’sega in src/data/edges.json

#### Hiroki Kikuta

- [x] T046 [US1] Add creator node hiroki-kikuta (Hiroki Kikuta, Q2588785, composer, birthYear 1962, Wikipedia) with summary and thumbnail in src/data/nodes.json
- [x] T047 [US1] Add "worked at" edge hiroki-kikutaâ†’sega in src/data/edges.json

- [x] T048 [US1] Run validate-data.ps1 â€” verify all Tier 2 additions pass validation

### Tier 3: New creators without Wikipedia pages (Wikidata-only)

- [x] T049 [P] [US1] Add creator node tetsu-katano (Tetsu Katano, Q4217158, director, no birthYear, Wikidata-only) in src/data/nodes.json
- [x] T050 [P] [US1] Add creator node hiroshi-miyamoto (Hiroshi Miyamoto, Q17118987, director, birthYear 1985, Wikidata-only) in src/data/nodes.json
- [x] T051 [P] [US1] Add creator node hiroyoshi-kato (Hiroyoshi KatÅ, Q11399379, producer, no birthYear, Wikidata-only) in src/data/nodes.json
- [x] T052 [P] [US1] Add creator node mitsuharu-fukuyama (Mitsuharu Fukuyama, Q124378546, producer, no birthYear, Wikidata-only) in src/data/nodes.json
- [x] T053 [P] [US1] Add creator node mariko-nanba (Mariko Nanba, Q6763443, director, birthYear 1971, Wikidata-only) in src/data/nodes.json
- [x] T054 [P] [US1] Add creator node akiyuki-tateyama (Akiyuki Tateyama, Q18818397, director, birthYear 1980, Wikidata-only) in src/data/nodes.json
- [x] T055 [US1] Add "worked at" edges for Tier 3 creators in src/data/edges.json: tetsu-katanoâ†’sega, hiroshi-miyamotoâ†’sega, hiroyoshi-katoâ†’sega, mitsuharu-fukuyamaâ†’sega, mariko-nanbaâ†’sega, akiyuki-tateyamaâ†’sega
- [x] T056 [US1] Add game-credit edges for Tier 3 creators where games exist in graph: tetsu-katano edges based on Wikidata game matches in src/data/edges.json
- [x] T057 [US1] Run validate-data.ps1 â€” verify all Tier 3 additions pass validation

### New edges for existing creators (Wikidata reveals additional credits)

- [x] T058 [US1] Verify and add edge takayuki-nakamuraâ†’eswat (composed for) in src/data/edges.json â€” check for duplicates first
- [x] T059 [US1] Verify and add edge takenobu-mitsuyoshiâ†’lets-go-jungle (composed for) in src/data/edges.json â€” check for duplicates first
- [x] T060 [US1] Verify and add edge hideki-naganumaâ†’monkey-ball (composed for) in src/data/edges.json â€” check for duplicates first
- [x] T061 [US1] Verify and add edge tomoya-ohtaniâ†’monkey-ball (composed for) in src/data/edges.json â€” check for duplicates first
- [x] T062 [US1] Verify and add edge makoto-uchidaâ†’golden-axe-the-revenge-of-death-adder (directed) in src/data/edges.json â€” check for duplicates first
- [x] T063 [US1] Verify and add edge hiroshi-kawaguchiâ†’fantasy-zone (composed for) in src/data/edges.json â€” check for duplicates first
- [x] T064 [US1] Verify and add edge hiroshi-kawaguchiâ†’alex-kidd-the-lost-stars (composed for) in src/data/edges.json â€” check for duplicates first
- [x] T065 [US1] Run validate-data.ps1 â€” verify all new edges pass validation

### US1 Final Validation

- [x] T066 [US1] Run full validate-data.ps1 â€” verify graph integrity with all additions
- [x] T067 [US1] Run all QUnit tests (open tests/index.html in browser) â€” verify zero regressions
- [x] T068 [US1] Verify US3 constraint: diff existing 25 creators against pre-expansion baseline â€” all unchanged (FR-005)
- [x] T069 [US1] Verify SC-001: count creator nodes â‰¥ 35 (target: 45)
- [x] T070 [US1] Verify SC-002: count games with creator connections â‰¥ 50 (target: 55+)

**Checkpoint**: User Story 1 complete. Graph has 45 creator nodes, 55+ games with creator links. All existing data preserved. Script is idempotent.

---

## Phase 4: User Story 2 â€” See Attribution for Data Sources (Priority: P2)

**Goal**: Add visible data source attribution to the application UI and repository, crediting Wikipedia, Wikidata, and IGDB.

**Independent Test**: Open the application and verify attribution is visible. Check the repository for ATTRIBUTION.md.

### Implementation for User Story 2

- [x] T071 [P] [US2] Create ATTRIBUTION.md at repository root documenting Wikipedia/Wikimedia Commons (CC BY-SA), Wikidata (CC0), and IGDB usage scope and licenses
- [x] T072 [P] [US2] Add data attribution section to src/index.html â€” small footer or info panel link with "Data from Wikipedia Â· Wikidata Â· IGDB"
- [x] T073 [US2] Add attribution styling in src/css/styles.css if needed â€” minimal, non-intrusive footer style
- [x] T074 [US2] Verify SC-004: attribution is visible to all users who access the application
- [x] T075 [US2] Run all QUnit tests â€” verify no regressions from HTML/CSS changes

**Checkpoint**: User Story 2 complete. Attribution visible in UI and documented in ATTRIBUTION.md.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, idempotency verification, and cleanup

- [x] T076 Run enrichment script twice â€” verify idempotent output (FR-011): scripts/enrich-creators.ps1 produces identical nodes.json and edges.json on second run
- [x] T077 Run full validate-data.ps1 final check
- [x] T078 Run all QUnit tests final check (open tests/index.html)
- [x] T079 Manual smoke test: open src/index.html, explore graph, click new creators, verify detail panels, check attribution
- [x] T080 Run quickstart.md verification checklist â€” all items pass
- [x] T081 [P] Run biome lint check on any modified JS/CSS/HTML files

**Checkpoint**: All tasks complete. Feature ready for review.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies â€” constitution amendment and script building
- **Foundational (Phase 2)**: Depends on Phase 1 completion â€” captures baseline before data changes
- **US1 (Phase 3)**: Depends on Phase 2 â€” data expansion begins after baseline captured
  - Tier 1 â†’ Tier 2 â†’ Tier 3 â†’ Existing creator edges (sequential within US1)
  - Within each tier: [P]-marked creator nodes can be added in parallel
- **US2 (Phase 4)**: Can start after Phase 2 â€” independent of US1 (attribution is about the project, not specific data)
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Setup + Foundational. Core data expansion.
- **User Story 2 (P2)**: Depends on Foundational only. Can proceed in parallel with US1.
- **User Story 3 (P1)**: Embedded as constraint in US1 â€” verified via T068.

### Parallel Opportunities

Within Phase 3 (US1):
- T014, T015, T016 (Tier 1 creator nodes) can run in parallel
- T020, T023, T024, T027, T030, T039 (game node additions) can run in parallel
- T049â€“T054 (Tier 3 creator nodes) can run in parallel

Between stories:
- US1 (Phase 3) and US2 (Phase 4) can start in parallel after Phase 2

---

## Parallel Example: Tier 1 Creators

```bash
# Launch all Tier 1 creator nodes in parallel:
Task T014: "Add creator node katsuhiro-hayashi in src/data/nodes.json"
Task T015: "Add creator node yasuhiro-kawakami in src/data/nodes.json"
Task T016: "Add creator node shinichi-sakamoto in src/data/nodes.json"

# Then sequentially: edges and validation
Task T017: "Add edges for Tier 1 creators in src/data/edges.json"
Task T018: "Add worked-at edges for Tier 1 creators"
Task T019: "Run validate-data.ps1"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (constitution amendment + enrichment script)
2. Complete Phase 2: Foundational (baseline capture)
3. Complete Phase 3: User Story 1 (all tiers + existing creator edges)
4. **STOP and VALIDATE**: Verify â‰¥35 creators, â‰¥50 games with links, zero regressions
5. This is a shippable increment â€” graph is richer even without attribution

### Incremental Delivery

1. Setup + Foundational â†’ Infrastructure ready
2. US1 Tier 1 â†’ 3 new creators, 5 new edges (quick win, games already in graph)
3. US1 Tier 2 â†’ 11 more creators with Wikipedia data (major expansion)
4. US1 Tier 3 â†’ 6 more creators, Wikidata-only (completes creator expansion)
5. US1 Existing edges â†’ 7 new edges for existing creators
6. US2 â†’ Attribution added (compliance + trust)
7. Polish â†’ Final validation and idempotency check

---

## Notes

- [P] tasks = different files or independent JSON additions, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 (Preserve Existing Data) is not a separate phase â€” it's a constraint verified at T068
- Wikidata-only creators use Wikidata entity URL as fallback for `wikipediaUrl` field
- All edge labels use established past-tense format: "directed", "composed for", "produced", "designed"
- Commit after each tier completion for clean git history
