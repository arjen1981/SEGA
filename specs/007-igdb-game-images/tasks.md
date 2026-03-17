# Tasks: IGDB Game Images with Wikipedia Fallback

**Input**: Design documents from `/specs/007-igdb-game-images/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/nodes.schema.json, quickstart.md

**Tests**: Not requested in the feature specification. Enrichment script is validated via its own summary report (FR-009) and the existing `validate-data.ps1`.

**Organization**: Tasks are grouped by user story. US1 is the MVP — a working IGDB enrichment script. US2 adds Wikipedia fallback. US3 adds preservation logic for existing thumbnails.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization — scripts directory, environment config, .gitignore

- [x] T001 Create `scripts/` directory and add `.env` to `.gitignore` in `.gitignore`
- [x] T002 Create `.env.example` with placeholder Twitch credentials in `.env.example`
- [x] T003 Create enrichment script entry point with Node.js ESM structure, argument parsing, and main flow skeleton in `scripts/enrich-thumbnails.mjs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Twitch OAuth authentication and IGDB API client — required by ALL user stories

**⚠️ CRITICAL**: No user story work can begin until IGDB auth and rate-limited fetching are in place

- [x] T004 Implement Twitch OAuth client credentials token retrieval (POST to `https://id.twitch.tv/oauth2/token`, parse `access_token`) in `scripts/enrich-thumbnails.mjs`
- [x] T005 Implement rate-limited IGDB API request helper with 250ms delay between requests, `Client-ID` and `Authorization: Bearer` headers, and HTTP 429 retry with backoff in `scripts/enrich-thumbnails.mjs`
- [x] T006 Implement `loadNodes()` and `saveNodes()` helpers that read/write `src/data/nodes.json` with proper JSON formatting (tab-indented, trailing newline) in `scripts/enrich-thumbnails.mjs`
- [x] T007 Implement `filterGameNodes()` helper that returns only nodes where `group === "game"` from the full node array (FR-003) in `scripts/enrich-thumbnails.mjs`

**Checkpoint**: Auth works, IGDB requests succeed, nodes.json can be loaded and saved without corruption

---

## Phase 3: User Story 1 — Game Nodes Show Cover Art from IGDB (Priority: P1) 🎯 MVP

**Goal**: Populate `thumbnail` for game nodes using IGDB cover art as primary source

**Independent Test**: Run `node scripts/enrich-thumbnails.mjs`, then open the app and click on games that previously had no image (e.g., Fantasy Zone, Crazy Taxi, Virtua Fighter 2). Verify cover art appears in the detail panel.

### Implementation for User Story 1

- [x] T008 [US1] Implement `searchIgdb(title, releaseYear)` function that sends Apicalypse query (`search "{title}"; fields name, cover.image_id, first_release_date; where platforms = (52) & version_parent = null; limit 5;`) and returns matched results in `scripts/enrich-thumbnails.mjs`
- [x] T009 [US1] Implement `selectBestMatch(results, releaseYear)` function that picks the IGDB result whose `first_release_date` year is closest to the node's `releaseYear` (FR-004) in `scripts/enrich-thumbnails.mjs`
- [x] T010 [US1] Implement `buildIgdbCoverUrl(imageId)` function that constructs `https://images.igdb.com/igdb/image/upload/t_cover_big/{imageId}.jpg` (FR-008) in `scripts/enrich-thumbnails.mjs`
- [x] T011 [US1] Implement title normalization helper `normalizeTitle(title)` — lowercase, strip accents, strip punctuation, collapse whitespace — for retry searches when the raw title returns zero results in `scripts/enrich-thumbnails.mjs`
- [x] T012 [US1] Implement main IGDB enrichment loop: iterate all game nodes, call `searchIgdb()` with raw title then normalized title on retry, set `thumbnail` to IGDB cover URL when matched, log progress per game in `scripts/enrich-thumbnails.mjs`
- [x] T013 [US1] Implement summary report output (FR-009): total games processed, IGDB matches found, remaining without thumbnails — printed to console after enrichment completes in `scripts/enrich-thumbnails.mjs`
- [x] T014 [US1] Run the enrichment script with real IGDB credentials, verify IGDB matches populate `thumbnail` fields in `src/data/nodes.json`, and run `validate-data.ps1` to confirm data integrity

**Checkpoint**: Majority of game nodes have IGDB cover art thumbnails. App shows images when clicking game nodes.

---

## Phase 4: User Story 2 — Wikipedia Fallback for Games Not Found on IGDB (Priority: P2)

**Goal**: For games with no IGDB match, fall back to Wikipedia REST API and Wikidata P18 property to retrieve a thumbnail

**Independent Test**: Identify games that IGDB did not match (shown in the summary report). Verify the script now attempts Wikipedia/Wikidata for those. Check that some previously-null thumbnails are now populated with Wikimedia URLs.

### Implementation for User Story 2

- [x] T015 [US2] Implement `fetchWikipediaThumbnail(wikipediaUrl)` function: extract article title from URL, GET `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`, return `thumbnail.source` if present (FR-005) in `scripts/enrich-thumbnails.mjs`
- [x] T016 [US2] Implement `fetchWikidataImage(wikidataId)` function: GET `https://www.wikidata.org/w/api.php?action=wbgetentities&ids={id}&props=claims&format=json`, extract P18 claim filename, construct `https://commons.wikimedia.org/wiki/Special:FilePath/{filename}?width=300` (FR-005) in `scripts/enrich-thumbnails.mjs`
- [x] T017 [US2] Integrate Wikipedia/Wikidata fallback into the main enrichment loop: after IGDB miss, try `fetchWikipediaThumbnail()`, then `fetchWikidataImage()`, with 100ms polite delay between Wikipedia/Wikidata requests in `scripts/enrich-thumbnails.mjs`
- [x] T018 [US2] Update summary report to include Wikipedia fallback matches and Wikidata fallback matches as separate counts (FR-009) in `scripts/enrich-thumbnails.mjs`
- [x] T019 [US2] Re-run enrichment script, verify Wikipedia/Wikidata fallback fills additional thumbnails in `src/data/nodes.json`, run `validate-data.ps1`

**Checkpoint**: Games not found on IGDB now have Wikipedia/Wikidata images where available. Summary report shows all three sources.

---

## Phase 5: User Story 3 — Existing Thumbnails Are Preserved (Priority: P3)

**Goal**: Ensure the 13 games with existing thumbnails are not regressed — IGDB replaces them, but never with null

**Independent Test**: Note the 13 existing thumbnail URLs before running. After enrichment, verify each still has a working thumbnail (either original or IGDB replacement). Zero regressions.

### Implementation for User Story 3

- [x] T020 [US3] Add pre-enrichment snapshot logic: before processing, record all nodes that have existing non-null thumbnails (id + old URL) for regression check in `scripts/enrich-thumbnails.mjs`
- [x] T021 [US3] Add protection rule: never overwrite a non-null thumbnail with null (FR-006) — only replace with a valid IGDB URL or leave unchanged. Skip Wikipedia fallback for nodes that already have thumbnails in `scripts/enrich-thumbnails.mjs`
- [x] T022 [US3] Add regression check to summary report: compare post-enrichment thumbnails against pre-enrichment snapshot, report count of preserved vs. upgraded vs. any regressions (FR-009) in `scripts/enrich-thumbnails.mjs`
- [x] T023 [US3] Re-run enrichment script, verify summary report shows 0 regressions for the 13 previously-thumbnailed games in `src/data/nodes.json`

**Checkpoint**: All previously-working thumbnails still work. Summary explicitly confirms zero regressions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Idempotency, final data commit, documentation

- [x] T024 [P] Verify idempotency (FR-010): run enrichment script twice consecutively, confirm `nodes.json` output is identical after second run (no duplicate writes, no data corruption) in `scripts/enrich-thumbnails.mjs`
- [x] T025 [P] Add `User-Agent` header to all Wikipedia/Wikidata requests per Wikimedia API etiquette (e.g., `SEGA-Graph-Enrichment/1.0 (https://github.com/...)`) in `scripts/enrich-thumbnails.mjs`
- [x] T026 Commit enriched `src/data/nodes.json` with updated thumbnail URLs
- [ ] T027 Run quickstart.md validation: follow quickstart.md steps end-to-end, serve the application with `.\serve.ps1`, visually verify images in the detail panel for a sample of games

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T003 (script skeleton) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion (auth + API client)
- **US2 (Phase 4)**: Depends on Phase 3 (the main loop to integrate fallback into)
- **US3 (Phase 5)**: Depends on Phase 3 (needs the processing loop to add protection to)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P2)**: Depends on US1 main loop being in place (T012) — adds fallback branch
- **US3 (P3)**: Depends on US1 main loop being in place (T012) — adds protection logic

### Within Each User Story

- Core functions before integration (e.g., T008-T011 before T012)
- Integration before verification run (e.g., T012 before T014)
- Verification run is always the last task in a story

### Parallel Opportunities

Within Phase 3 (US1):
```
T008 (searchIgdb) ─────────────────────┐
T009 (selectBestMatch) ────────────────┤
T010 (buildIgdbCoverUrl) ─────────────┤── all [P] before T012
T011 (normalizeTitle) ─────────────────┘
```

Within Phase 4 (US2):
```
T015 (fetchWikipediaThumbnail) ────────┐── [P] before T017
T016 (fetchWikidataImage) ────────────┘
```

Within Phase 6 (Polish):
```
T024 (idempotency check) ────────────┐── [P]
T025 (User-Agent header) ────────────┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007)
3. Complete Phase 3: User Story 1 (T008-T014)
4. **STOP and VALIDATE**: Run script, check images in app — this is the MVP
5. If coverage is sufficient (100+ IGDB matches), MVP is shippable

### Incremental Delivery

1. Setup + Foundational → Script skeleton with auth ready
2. US1 → IGDB enrichment works → ~100+ games with cover art (MVP!)
3. US2 → Wikipedia fallback → additional ~15-20 games covered
4. US3 → Regression protection → zero-regression guarantee
5. Polish → Idempotency + final commit

---

## Notes

- All tasks are in a single file (`scripts/enrich-thumbnails.mjs`) — the [P] marker indicates functions that can be written simultaneously, not separate files
- No application code changes needed — only data enrichment tooling and `nodes.json`
- The `.env` file with Twitch credentials is required BEFORE Phase 2 can be tested
- Commit after each phase checkpoint, not after each individual task
