# Feature Specification: Major SEGA Arcade Data Expansion

**Feature Branch**: `feature/006-expand-sega-arcade-data`
**Created**: 2026-03-12
**Status**: Draft
**Input**: User request: "Voeg meer nodes toe. Ik wil dat je je niet houdt aan het limiet van 200. Hoe meer hoe beter, zolang ze maar echte pagina's hebben op Wikipedia zodat we zeker weten dat de informatie echt klopt. Je hoeft je ook niet aan het jaartal grens te houden."
*(Translation: Add more nodes. Don't respect the 200 node limit. The more the better, as long as they have real Wikipedia pages. No year range limitation either.)*

## Clarifications

### Session 2026-03-12

- Q: Should the 200-node performance limit (FR-012 from spec 004) be respected? → A: No. User explicitly overrides: "ik wil dat je je niet houdt aan het limiet van 200."
- Q: Should the year range from spec 004 (1980s–2000s) be respected? → A: No. User explicitly overrides: "je hoeft je ook niet aan het jaartal grens te houden." Scope is the entire SEGA arcade history, from electro-mechanical games (1960s) through modern card-based arcade games (2010s+).
- Q: What is the Wikipedia requirement? → A: Every node MUST have a corresponding Wikipedia article. This is the only content gate.
- Q: Are there any node type preferences? → A: All types welcome — games, creators, studios, platforms. User wants maximum coverage.
- Q: Are schema or code changes expected? → A: No. This is a data-only expansion. The existing node/edge schema from spec 004 and the existing app code handle all node types and edge labels already.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Comprehensive SEGA Arcade History (Priority: P1)

A visitor opens the graph and discovers a rich, expansive visualization covering SEGA's entire arcade history — from pre-digital electro-mechanical games of the late 1960s through modern card-based and rhythm arcade games of the 2010s. The graph contains significantly more games than the current 88, filling gaps across all eras and genres. Each game connects to its development studio and arcade hardware platform via edges.

**Why this priority**: Games are the core content. More games create a denser, more explorable graph with richer connections between studios, platforms, and creators.

**Independent Test**: Open the graph. Count game nodes — there should be significantly more than the current 88. Click on newly added games and verify detail panel shows complete data with Wikipedia links. Verify every game has "developed by" and "runs on" edges.

**Acceptance Scenarios**:

1. **Given** the graph loads, **When** the visitor counts game nodes, **Then** there are at least 150 games (up from 88).
2. **Given** a new game exists, **When** the visitor clicks it, **Then** the detail panel shows release year, genre, summary, and a valid Wikipedia URL.
3. **Given** a new game exists, **When** the visitor examines edges, **Then** it has at least a "developed by" edge and a "runs on" edge.
4. **Given** all games span 1966–2018+, **When** the visitor browses by era, **Then** games from each decade are represented (1960s EM, 1970s EM, 1980s golden age, 1990s 3D revolution, 2000s networked, 2010s modern).

### User Story 2 — Expanded Creator Network (Priority: P2)

The graph contains additional creators beyond the current 20, adding more directors, producers, designers, and composers who shaped SEGA's arcade legacy. Each new creator has Wikipedia-verified biographical data and credit edges to their games.

**Independent Test**: Count creator nodes — more than 20. Verify new creators have proper role badges, Wikipedia links, and credit edges to games.

**Acceptance Scenarios**:

1. **Given** the graph loads, **When** the visitor counts creator nodes, **Then** there are at least 25 creators.
2. **Given** a new creator exists, **When** the visitor clicks on them, **Then** the detail panel shows birth year, roles, summary, and Wikipedia link.
3. **Given** a new creator has game credits, **When** the visitor examines edges, **Then** credit-specific labels (directed, produced, etc.) connect them to games.

### User Story 3 — Complete Platform & Studio Coverage (Priority: P3)

Any SEGA arcade hardware platforms or development studios needed by new games are added to the graph. This ensures every game has valid "runs on" and "developed by" targets.

**Acceptance Scenarios**:

1. **Given** a new game runs on hardware not in the dataset, **Then** that platform node is added with full metadata.
2. **Given** a new game was developed by a studio not in the dataset, **Then** that studio node is added.
3. **Given** all edges, **When** validated, **Then** zero broken edges (all from/to reference valid node IDs).

### Edge Cases

- Games with no SEGA arcade hardware (e.g., published by Sega but on non-Sega boards): Excluded from scope.
- Games manufactured by Sega but developed by external companies (e.g., Frogger by Konami): Included if Sega was the arcade manufacturer, with "developed by" pointing to "sega" (as manufacturer/publisher in those cases).
- Card-based arcade games (Mushiking, Sangokushi Taisen): Included — these are SEGA arcade products even if they use proprietary card hardware rather than traditional system boards. Platform can be a generic identifier or linked to whichever board the system uses.
- Electro-mechanical games (pre-digital): Included with "pre-system-1" platform reference.
- Creators with no standalone Wikipedia article: Excluded per Constitution VI.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dataset MUST contain at least 60 additional game nodes beyond the current 88, each with a valid Wikipedia article.
- **FR-002**: The dataset MUST contain at least 5 additional creator nodes beyond the current 20, each with a valid Wikipedia article.
- **FR-003**: Any platform or studio required by a new game that is not yet in the dataset MUST be added with full metadata.
- **FR-004**: All new nodes MUST have `wikipediaUrl` populated with a valid English Wikipedia URL.
- **FR-005**: Every new game MUST have at least a "developed by" edge and a "runs on" edge.
- **FR-006**: Creator credit edges MUST use Wikipedia credit terminology (directed, produced, designed, programmed, composed for, artwork for).
- **FR-007**: No duplicate node IDs. No broken edges (from/to referencing non-existent nodes).
- **FR-008**: No year range restriction — games from any era of SEGA arcade history are in scope.
- **FR-009**: No node count upper limit — the 200-node cap from spec 004 is explicitly lifted.
- **FR-010**: This is a data-only expansion — no code changes to JavaScript, CSS, or HTML.
- **FR-011**: A new edge label "partner of" MAY be used for business relationships between companies/studios (already exists in current dataset).
- **FR-012**: All existing nodes and edges MUST remain intact — zero regressions.

### Key Entities

- **Game**: id, label, group ("game"), summary, releaseYear, genre, wikipediaUrl, wikidataId, thumbnail
- **Creator**: id, label, group ("creator"), summary, birthYear, notableRoles, roles[], gender, wikipediaUrl, wikidataId, thumbnail
- **Platform**: id, label, group ("platform"), summary, releaseYear, generation, notableFeatures, wikipediaUrl, wikidataId, thumbnail
- **Studio**: id, label, group ("studio"), summary, founded, defunct, status, focus, wikipediaUrl, wikidataId, thumbnail

## Success Criteria *(mandatory)*

- **SC-001**: Total node count reaches at least 230 (up from 140).
- **SC-002**: Total game count reaches at least 150.
- **SC-003**: 100% of new nodes have valid `wikipediaUrl` fields.
- **SC-004**: 0 duplicate node IDs and 0 broken edges after expansion.
- **SC-005**: All existing 140 nodes and 296 edges remain unchanged.
- **SC-006**: The graph renders without JavaScript errors in a modern browser.

## Assumptions

- All data is sourced from English Wikipedia, per Constitution Principle VI.
- The existing node/edge JSON schema (from spec 004) supports all needed fields — no schema changes required.
- The existing app code (graph.js, detail-panel.js, etc.) renders new nodes/edges without modifications.
- vis-network handles 230+ nodes with acceptable performance on modern hardware.
- Card-based arcade games (Mushiking etc.) can use a generic platform node or the known underlying hardware platform.
