# Feature Specification: IGDB Game Images with Wikipedia Fallback

**Feature Branch**: `007-igdb-game-images`
**Created**: 2026-03-17
**Status**: Draft
**Input**: User description: "Use IGDB as primary source for game images with Wikipedia as fallback"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Game Nodes Show Cover Art from IGDB (Priority: P1)

A visitor clicks on a game node in the graph and the detail panel displays a high-quality cover art image sourced from IGDB (Internet Game Database). Currently, 144 out of 157 game nodes have no thumbnail at all — the detail panel shows only text. After this feature, the vast majority of game nodes display a recognizable game image (box art, flyer, or promotional artwork), making the graph visually rich and immediately engaging.

The image data is fetched from IGDB ahead of time and stored as a URL in the `thumbnail` field of each game node in `nodes.json`. This is a data enrichment step, not a runtime API call — the application continues to work as a static site.

**Why this priority**: Images are the single biggest visual gap in the current application. 92% of game nodes have no thumbnail. Adding cover art transforms the detail panel from a text-only experience into something visually compelling. IGDB has the best coverage for game-specific artwork across SEGA's arcade and console history.

**Independent Test**: Open the application, click on any game that previously had `"thumbnail": null` (e.g., Fantasy Zone, Crazy Taxi, Virtua Fighter 2). Verify the detail panel now shows a cover art image. Verify the image loads correctly and is visually relevant to the game.

**Acceptance Scenarios**:

1. **Given** a game node that previously had no thumbnail, **When** the visitor clicks on it, **Then** the detail panel displays cover art sourced from IGDB.
2. **Given** the IGDB data enrichment has run, **When** the visitor inspects `nodes.json`, **Then** at least 120 of the 157 game nodes have a non-null `thumbnail` URL.
3. **Given** a game node with an IGDB-sourced thumbnail, **When** the image loads, **Then** it displays a recognizable image related to that specific game (cover art, arcade flyer, or promotional material).
4. **Given** a game node with a thumbnail, **When** the visitor views it in the detail panel, **Then** the image renders at a reasonable size without distortion or broken layout.

---

### User Story 2 — Wikipedia Fallback for Games Not Found on IGDB (Priority: P2)

For games that IGDB does not have in its database (niche arcade-only titles, Japan-exclusive releases, very early electromechanical games), the system falls back to Wikipedia/Wikimedia as a secondary image source. The enrichment process first attempts IGDB, and only when no result is found, it queries the Wikipedia API using the existing `wikipediaUrl` or `wikidataId` to retrieve a thumbnail.

This ensures maximum coverage: IGDB handles the mainstream titles with high-quality cover art, while Wikipedia fills gaps for obscure entries.

**Why this priority**: Not every SEGA arcade game will exist in IGDB's database. Some very early titles (Periscope, Head On) and Japan-exclusive games may only have Wikipedia coverage. The fallback ensures no game is left without an image attempt.

**Independent Test**: Identify 3-5 games that are not found in IGDB (e.g., early electromechanical titles like Periscope, or niche Japanese arcade games). Verify that the enrichment process attempted a Wikipedia image lookup for these. For those where Wikipedia has an image, verify the thumbnail is populated.

**Acceptance Scenarios**:

1. **Given** a game node that has no match in IGDB, **When** the enrichment process runs, **Then** it attempts to retrieve a thumbnail from Wikipedia/Wikimedia using the node's `wikipediaUrl` or `wikidataId`.
2. **Given** a game not in IGDB but with a Wikipedia article that has an image, **When** the enrichment completes, **Then** the `thumbnail` field is populated with the Wikimedia image URL.
3. **Given** a game not in IGDB and with no Wikipedia image available, **When** the enrichment completes, **Then** the `thumbnail` field remains `null` and no broken or placeholder URL is inserted.

---

### User Story 3 — Existing Thumbnails Are Preserved (Priority: P3)

The 13 game nodes that already have Wikipedia-sourced thumbnails retain their images unless IGDB provides a higher-quality alternative. The enrichment process does not blindly overwrite existing data — it respects what is already there and only upgrades when a better source is available.

**Why this priority**: Data integrity matters. The existing thumbnails were manually curated and are known to work. Overwriting them without care would risk regressions (broken images, lower quality replacements).

**Independent Test**: Note the current thumbnail URLs for the 13 games that have them (e.g., Hang-On, Space Harrier, Sonic the Hedgehog). Run the enrichment process. Verify the thumbnails are either unchanged or replaced with a valid IGDB alternative. No previously working thumbnail should become `null` or broken.

**Acceptance Scenarios**:

1. **Given** a game node that already has a valid thumbnail, **When** the enrichment process runs, **Then** the existing thumbnail is preserved unless IGDB provides a match, in which case the IGDB URL replaces it.
2. **Given** the enrichment has completed, **When** the visitor checks all 13 previously-thumbnailed games, **Then** each still displays a working image in the detail panel.
3. **Given** a game with an existing Wikipedia thumbnail and an IGDB match, **When** both are available, **Then** the IGDB image takes precedence as the primary source.

---

### Edge Cases

- What happens when IGDB returns multiple matches for a game title (e.g., "Columns" appears in multiple franchises)? The enrichment process should prefer the result that matches the release year and platform (arcade/SEGA) to select the correct game.
- What happens when IGDB rate-limits the requests? The enrichment script must handle rate limits gracefully by pausing between requests and resuming without data loss.
- What happens when an IGDB image URL becomes stale or the CDN changes? Since images are hotlinked, broken images may appear over time. The `thumbnail` field stores the URL as-is; future monitoring is out of scope but the enrichment script can be re-run.
- What happens for games with regional title variations (e.g., "Dynamite Düx" vs "Dynamite Dux")? The matching logic should normalize titles and use fuzzy matching or the game's known IGDB slug when available.
- What happens when Wikipedia returns a non-game image (e.g., a logo or unrelated photo)? The Wikipedia fallback uses the Wikidata `P18` (image) property or the Wikipedia page's primary infobox image, which is typically the most relevant image for the article subject.
- What happens for non-game nodes (studios, platforms, creators)? This feature targets only nodes with `"group": "game"`. Other node types are not affected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A data enrichment script MUST be created that populates `thumbnail` URLs for game nodes in `nodes.json` using IGDB as the primary image source.
- **FR-002**: The enrichment script MUST use a two-tier lookup strategy: first IGDB, then Wikipedia/Wikimedia as fallback.
- **FR-003**: The enrichment script MUST only target nodes where `"group": "game"` — all other node types MUST be left unchanged.
- **FR-004**: For IGDB lookups, the script MUST match games by title and verify the match using release year and platform (arcade/SEGA) to avoid false positives.
- **FR-005**: For Wikipedia fallback lookups, the script MUST use the existing `wikidataId` (Wikidata `P18` image property) or `wikipediaUrl` to retrieve a thumbnail.
- **FR-006**: The script MUST NOT overwrite an existing non-null `thumbnail` with `null` — it may only replace an existing thumbnail with a valid IGDB URL or leave it unchanged.
- **FR-007**: The script MUST handle IGDB authentication (Twitch OAuth client credentials) and rate limiting without crashing or losing progress.
- **FR-008**: The resulting `thumbnail` URLs for IGDB-sourced images MUST point to IGDB's image CDN (`images.igdb.com`) at a consistent size suitable for detail panel display.
- **FR-009**: The enrichment script MUST produce a summary report showing: total games processed, IGDB matches found, Wikipedia fallback matches found, remaining games without thumbnails.
- **FR-010**: The enrichment script MUST be re-runnable (idempotent) — running it again should not duplicate or corrupt data, and should be able to fill in newly available images.
- **FR-011**: The application's existing detail panel rendering MUST continue to work without code changes — it already renders any valid URL in the `thumbnail` field.

### Key Entities

- **Game Node** (enriched): An existing game node in `nodes.json`. The `thumbnail` field is populated with a URL from IGDB (preferred) or Wikipedia/Wikimedia (fallback). No new fields are added.
- **IGDB Game Record**: An external record from the IGDB API matched by title, release year, and platform. Provides cover art image ID that maps to a CDN URL.
- **Enrichment Report**: A summary output of the enrichment run showing match statistics and any games that could not be resolved.

## Assumptions

- The user will obtain IGDB API credentials (Twitch Developer client ID and secret) before running the enrichment script. IGDB requires free Twitch Developer registration.
- IGDB's cover art database has sufficient coverage for the majority of SEGA arcade titles from the 1980s through 2010s.
- Wikimedia/Wikipedia image URLs are stable and suitable for hotlinking (consistent with current usage in the project).
- The enrichment is a one-time (or periodic) offline process, not a runtime feature — the application remains a static site.
- IGDB image CDN URLs (`images.igdb.com`) are publicly accessible and do not require authentication to load in a browser.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 75% of game nodes (118 out of 157) have a non-null `thumbnail` after enrichment, up from the current 8% (13 out of 157).
- **SC-002**: At least 100 game nodes have IGDB-sourced cover art as their thumbnail.
- **SC-003**: Every game node that had a working thumbnail before enrichment still has a working thumbnail after enrichment (zero regressions).
- **SC-004**: The enrichment script completes processing of all 157 game nodes within 10 minutes, including API rate limit pauses.
- **SC-005**: Visitors see a relevant game image when clicking on any major SEGA franchise title (Sonic, Virtua Fighter, Daytona USA, OutRun, Streets of Rage, etc.).
