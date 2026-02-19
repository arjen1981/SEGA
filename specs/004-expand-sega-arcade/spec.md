# Feature Specification: Expand SEGA Arcade Graph Data

**Feature Branch**: `004-expand-sega-arcade`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "Expand SEGA arcade graph with more nodes: developers, publishers, creators, composers, artists, games, and platforms. Use Wikipedia as sole data source. Generic reusable person types using Wikipedia terminology (director, producer, designer, programmer, composer, artist). Add corresponding games and arcade platforms only — no consoles. Use relationship terms like directed and published."
*(Clarified: "published" replaced by "produced" — see Clarifications section.)*

## Clarifications

### Session 2026-02-16

- Q: Should the detail panel code be updated to render the new `roles` array, or rely on `notableRoles` free-text only? → A: Update the detail panel to render `roles` as badges/tags. This is a small code change worth making for structured display.
- Q: Should "published by" edges be added? → A: No. "Publisher" was confused with "producer" (a person credit). The role set uses "producer"/"produced" instead. No company-level "published by" edges.
- Q: How should existing "created" edges (Yu Suzuki → 4 early games) be migrated? → A: Allow multiple edges per game. Wikipedia research confirms Yu Suzuki is credited as both Designer and Programmer on all four games (Hang-On, Space Harrier, Out Run, After Burner). Each "created" edge becomes two edges: "designed" + "programmed".

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Expanded Creator Network with Wikipedia Role Types (Priority: P1)

A visitor opens the graph and discovers a much richer network of people behind SEGA's arcade legacy. Instead of only 5 creators, the graph now contains 20–25 key individuals sourced from Wikipedia. Each person node carries one or more standardized role labels drawn from Wikipedia's own terminology for Japanese game development credits: **director**, **producer**, **designer**, **programmer**, **composer**, and **artist**. These roles are stored in a `roles` array field on each creator node so the data model stays generic and reusable for any game industry person. The existing `notableRoles` free-text field is kept for human display; `roles` is the structured, filterable counterpart.

The relationship edges between people and games also use the precise Wikipedia credit terminology: **"directed"**, **"produced"**, **"designed"**, **"programmed"**, **"composed for"**, and **"artwork for"**. This mirrors the Japanese game industry tradition where a visionary director/producer is prominently credited — exactly as seen on Wikipedia infoboxes for games like Out Run ("directed by Yu Suzuki") and Virtua Fighter ("produced by Yu Suzuki").

**Why this priority**: People are the most interesting dimension to expand. The existing 5 creators barely scratch the surface. Adding composers like Hiroshi "Hiro" Kawaguchi (Out Run, Space Harrier), artists like Rieko Kodama (already present), and directors like Hisao Oguchi (Rad Mobile, Crazy Taxi) gives visitors the "who made what" story that makes the graph compelling. Standardized roles also unlock future filtering by role.

**Independent Test**: Open the application and verify that significantly more creator nodes appear in the full graph. Click on any new creator and confirm the detail panel shows their roles, biography sourced from Wikipedia, and links to the games they worked on. Verify that edges between creators and games use credit-specific labels (directed, produced, composed for, etc.).

**Acceptance Scenarios**:

1. **Given** the graph loads, **When** the visitor expands to full view, **Then** at least 20 distinct creator nodes are visible (up from 5).
2. **Given** a creator node exists, **When** the visitor inspects its data, **Then** it contains a `roles` array with one or more values from the set: `director`, `producer`, `designer`, `programmer`, `composer`, `artist`.
3. **Given** a creator has an edge to a game, **When** the visitor reads the edge label, **Then** it uses the specific credit term (e.g., "directed", "produced", "composed for") rather than the generic "created".
4. **Given** a creator node is clicked, **When** the detail panel opens, **Then** it displays the person's name, birth year, roles, summary (sourced from Wikipedia), and a Wikipedia link.
5. **Given** the existing 5 creators remain, **When** the visitor compares old and new data, **Then** existing creator edges like Yu Suzuki → Hang-On ("created") are migrated to specific credit terms per Wikipedia research. Each "created" edge becomes multiple edges when the person held multiple roles (e.g., Yu Suzuki gets both "designed" and "programmed" edges for his 4 early games).

---

### User Story 2 — More Arcade Games with Full Credit Chains (Priority: P2)

A visitor explores the graph and finds a substantially larger game catalog covering SEGA's arcade output from the early 1980s through the 2000s. Each new game node links to its development studio ("developed by"), its arcade system board ("runs on"), and the key people who worked on it (using credit-specific edge labels). Games are added only when they have a Wikipedia article to serve as the data source.

New games should fill gaps in the existing catalog: early pre-System 16 titles (e.g., Zaxxon, Congo Bongo, Pengo), significant System 16 titles not yet included (e.g., E-Swat, Shadow Dancer), and important titles from studios currently underrepresented (Sonic Team arcade output, AM1 early work, AM4/AM5 titles if applicable).

**Why this priority**: Games are the core content of an arcade graph. More games means more edges, more interesting clusters, and more to explore. They provide the connective tissue between people, studios, and hardware.

**Independent Test**: Open the application and count game nodes. Verify at least 20 new game nodes exist beyond the current set. Click on any new game and verify the detail panel shows title, year, genre, summary, and Wikipedia link. Verify edges connect each game to its studio, platform, and relevant creators.

**Acceptance Scenarios**:

1. **Given** the graph loads, **When** the visitor counts game nodes, **Then** there are at least 20 more games than the current dataset.
2. **Given** a new game node exists, **When** the visitor clicks it, **Then** the detail panel shows release year, genre, summary, and Wikipedia URL.
3. **Given** a new game node exists, **When** the visitor examines its edges, **Then** it has at least a "developed by" edge to a studio and a "runs on" edge to an arcade platform.
4. **Given** the game has a known director/producer/composer on Wikipedia, **When** the visitor examines the graph, **Then** edges connect the game to those creators with appropriate credit labels.
5. **Given** a game developed by a SEGA studio, **When** the visitor reads its edges, **Then** only creator credit edges appear (directed, produced, etc.) — no company-level "published by" edge exists.

---

### User Story 3 — Additional Arcade Platforms for Coverage Gaps (Priority: P3)

A visitor finds platform nodes for any SEGA arcade system boards not yet in the dataset that are needed by newly added games. This may include earlier boards (e.g., Sega System 1, System 2 for pre-System 16 games) or contemporary boards that were missed. Each platform node follows the existing data model with release year, generation, notable features, and Wikipedia source.

**Why this priority**: Platforms are infrastructure — they're only added as needed to support the new games. The existing 12 platforms cover most of SEGA's arcade history; this story fills in any remaining gaps.

**Independent Test**: Open the application. Verify that every game node has a valid "runs on" edge to a platform. Verify any new platform nodes have complete data (release year, features, Wikipedia URL).

**Acceptance Scenarios**:

1. **Given** a new game is added, **When** it ran on a platform not yet in the dataset, **Then** that platform node is created with full metadata.
2. **Given** a new platform node, **When** the visitor clicks it, **Then** the detail panel shows release year, generation, notable features, and Wikipedia link.
3. **Given** all games in the dataset, **When** the visitor examines edges, **Then** every game has exactly one "runs on" edge to a valid platform node.

---

### Edge Cases

- What happens when a person held multiple roles on the same game (e.g., designer and programmer)? Multiple edges are created, one per role, each with its own credit label. This is confirmed by Wikipedia research: Yu Suzuki is credited as both Designer and Programmer on Hang-On, Space Harrier, Out Run, and After Burner.
- What happens when a Wikipedia article doesn't specify individual credits? The game is still added with studio and platform edges, but no creator edges. Credits are not fabricated.
- What happens when the same person worked at multiple studios? Multiple "worked at" edges connect them to each studio, matching existing patterns (e.g., Toshihiro Nagoshi → AM2 and → RGG Studio).
- What happens when a game's platform is uncertain or not on a standard SEGA board? The game is excluded from scope — only games on identifiable SEGA arcade hardware (including documented custom boards listed on the Wikipedia "List of Sega arcade system boards" article) are included.
- What happens when the graph becomes too dense with the new nodes? The existing ego-graph spotlight mechanic allows focused exploration; full-graph view may be busier but the physics engine handles layout. Node count should stay under 200 to maintain performance.
- What happens for pre-divisional games (released before SEGA restructured into numbered AM divisions)? These games are linked to the parent "sega" company node via "developed by" edges rather than a specific studio node, since the AM studio structure did not exist at the time of development.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dataset MUST contain at least 15 additional creator nodes beyond the current 5, each sourced from a Wikipedia article.
- **FR-002**: Each creator node MUST have a `roles` array field containing one or more standardized values from the set: `director`, `producer`, `designer`, `programmer`, `composer`, `artist`.
- **FR-003**: The existing `notableRoles` free-text field MUST be retained for display purposes alongside the new structured `roles` array. New creator nodes SHOULD include both fields.
- **FR-004**: Edge labels between creators and games MUST use Wikipedia credit terminology: "directed", "produced", "designed", "programmed", "composed for", "artwork for".
- **FR-005**: The existing "created" edge labels on current creator-game relationships MUST be migrated to specific credit terms as sourced from Wikipedia. Where a person held multiple roles (e.g., designer + programmer), each role MUST yield a separate edge.
- **FR-006**: The dataset MUST contain at least 20 additional game nodes beyond the current set, each sourced from a Wikipedia article.
- **FR-007**: Each game node MUST have at least a "developed by" edge (to studio) and a "runs on" edge (to platform).
- **FR-008**: Any arcade system board required by a new game that is not yet in the dataset MUST be added as a new platform node with complete metadata.
- **FR-009**: All new nodes and edges MUST cite Wikipedia as data source, with `wikipediaUrl` populated for every node.
- **FR-010**: All person data (names, birth years, roles, summaries) MUST be verifiable against the cited Wikipedia article.
- **FR-011**: The scope MUST be limited to SEGA and arcade only — no console platforms, no non-SEGA published titles.
- **FR-012**: The total node count SHOULD remain under 200 to maintain acceptable graph rendering performance.
- **FR-013**: Creator nodes MUST retain `gender` field for icon differentiation (male/female/neutral silhouette per spec 003).
- **FR-014**: New edge types ("composed for", "artwork for", "designed", "programmed") MUST work with the existing vis-network rendering without code changes — they are data-only additions.
- **FR-015**: The detail panel MUST render the `roles` array as visual badges/tags (e.g., styled inline labels) when displaying a creator node, in addition to the existing `notableRoles` free-text.

### Key Entities

- **Creator** (expanded): A person who contributed to SEGA arcade games. Key attributes: id, label, group ("creator"), summary, birthYear, notableRoles (free text), roles (structured array), gender, wikipediaUrl, wikidataId, thumbnail.
- **Game** (expanded): A SEGA arcade game. Key attributes: id, label, group ("game"), summary, releaseYear, genre, wikipediaUrl, wikidataId, thumbnail.
- **Platform** (expanded as needed): A SEGA arcade system board. Key attributes: id, label, group ("platform"), summary, releaseYear, generation, notableFeatures, wikipediaUrl, wikidataId, thumbnail.
- **Edge — credit relationship**: Connects creator → game with label from set {directed, produced, designed, programmed, composed for, artwork for}.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The graph contains at least 20 creator nodes (up from 5) representing directors, producers, designers, programmers, composers, and artists.
- **SC-002**: The graph contains at least 80 game nodes (up from 67) spanning SEGA's arcade history from early 1980s to mid-2000s.
- **SC-003**: Every creator-game edge uses a specific Wikipedia credit term instead of the generic "created".
- **SC-004**: 100% of new nodes have a valid `wikipediaUrl` field pointing to an existing Wikipedia article.
- **SC-005**: Users can navigate from any creator to their credited games and vice versa using the ego-graph spotlight, with credit type clearly shown on each edge.
- **SC-006**: The graph renders and stabilizes within 5 seconds on a standard desktop browser with the expanded dataset.
- **SC-007**: All existing nodes and edges remain intact and functional — zero regressions.

## Assumptions

- All person data (birth years, roles, career history) is sourced from English Wikipedia and considered accurate as of the feature date.
- The standardized role terms (director, producer, designer, programmer, composer, artist) cover the vast majority of Japanese arcade game credits as documented on Wikipedia. Additional roles may be added in the future if needed.
- Edge labels for creator-game relationships map to Wikipedia infobox credit fields: "Director" → "directed", "Producer" → "produced", "Designer" → "designed", "Programmer" → "programmed", "Composer" → "composed for", "Artist" → "artwork for".
- Hiroshi Kawaguchi is credited as a composer on Wikipedia for Out Run, Space Harrier, and other AM2 titles. Takenobu Mitsuyoshi is credited for Daytona USA music. These represent composers whose Wikipedia articles contain verifiable credit information.
- Where Wikipedia credits are ambiguous (e.g., "development staff" without specific role), no creator edge is added — we only use explicitly documented credits.
