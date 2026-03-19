# Feature Specification: Expand Creator Nodes with Wikidata

**Feature Branch**: `008-expand-creators`
**Created**: 2026-03-17
**Updated**: 2026-03-19
**Status**: Draft
**Input**: User description: "Expand creator nodes using Wikidata SPARQL for structured credit relationships, combined with Wikipedia for biographical enrichment. Add proper data source attribution (IGDB, Wikidata, Wikipedia) to the project."

## User Scenarios & Testing

### User Story 1 - Discover More Creators Behind Arcade Games (Priority: P1)

As a graph explorer, I want to see who directed, designed, and programmed each Sega arcade game, so that I can understand the creative lineage behind the games I love — even for lesser-known developers who don't have Wikipedia pages.

**Why this priority**: The graph currently has only 25 creator nodes covering the most famous Sega figures. Many arcade games have zero creator connections, making the "who made what" dimension of the graph sparse and incomplete. Adding creators from verified game credits is the core value of this feature.

**Independent Test**: After enrichment, navigate to any previously unlinked arcade game (e.g., Gain Ground, Scramble Spirits) and verify that creator nodes with roles appear as connected neighbors in the graph.

**Acceptance Scenarios**:

1. **Given** the graph has 157 game nodes, **When** the enrichment script completes, **Then** at least 55 game nodes have one or more creator connections (up from the current 49 games with creator links)
2. **Given** a new creator node is added, **When** I click on it in the graph, **Then** the detail panel shows: name, role(s), and links to associated games
3. **Given** a creator already exists in the graph (e.g., Hiroshi Kawaguchi), **When** Wikidata reveals additional game credits for that creator, **Then** new edges are added without duplicating the creator node

---

### User Story 2 - See Attribution for Data Sources (Priority: P2)

As a visitor to the project, I want to see which data sources were used, so that I understand where the information comes from and that proper credit is given.

**Why this priority**: Using IGDB, Wikidata, and Wikipedia data benefits from proper attribution. Wikidata is CC0 (no legal obligation) and Wikipedia is CC BY-SA, but voluntary attribution builds trust and demonstrates data provenance. IGDB terms require attribution.

**Independent Test**: Open the application and find the attribution information. Verify IGDB, Wikidata, and Wikipedia are credited.

**Acceptance Scenarios**:

1. **Given** the project uses IGDB for cover art, Wikidata for credit relationships, and Wikipedia for biographical text, **When** a user views the application, **Then** a data sources attribution section is accessible that credits all three sources
2. **Given** the project repository is viewed on GitHub, **When** a contributor reads the README or ATTRIBUTION file, **Then** all external data sources and their usage scope are documented

---

### User Story 3 - Preserve Existing Creator Data (Priority: P1)

As a data maintainer, I want the enrichment process to preserve all existing creator nodes and their connections, so that no previously curated data is lost.

**Why this priority**: Regression protection is critical. The 25 existing creators have Wikipedia-sourced biographical data that must not be overwritten or removed.

**Independent Test**: Run the enrichment script and diff the output. Verify all 25 existing creator nodes remain with identical data. Verify all existing creator-game edges remain.

**Acceptance Scenarios**:

1. **Given** 25 creator nodes exist before enrichment, **When** the enrichment script runs, **Then** all 25 creators retain their existing data (name, role, birthYear, wikipedia, wikidataId)
2. **Given** an existing creator has a Wikipedia page, **When** Wikidata reveals additional game credits for that creator, **Then** new edges are added but the creator node data is not overwritten

---

### Edge Cases

- What happens when Wikidata labels use non-ASCII romanizations (e.g., "Kōhei" vs "Kohei", macrons)? Node IDs use ASCII kebab-case; labels preserve Unicode.
- How does the system handle Wikidata results for non-game-industry people (e.g., film directors, musicians credited on game soundtracks)? An exclusion list filters out 11 known non-game-creators.
- What happens when Wikidata returns an unresolved QID with no English label? These are excluded from the enrichment.
- How does the system handle a Wikidata credit for a game not in the graph? Tier 2 creators get associated game nodes added; otherwise the credit is skipped.

## Requirements

### Functional Requirements

- **FR-001**: System MUST add new creator nodes sourced from Wikidata SPARQL structured credit relationships (properties P943, P57, P86, P170, P162, P3080) for Sega-published video games
- **FR-002**: System MUST import creators who have at least one Wikidata credit relationship (director, composer, producer, designer, creator) to a Sega game, filtered through an exclusion list that removes non-game-industry people (actors, film directors, musicians with only incidental credits)
- **FR-003**: System MUST create edges between creator nodes and game nodes using established past-tense edge labels ("directed", "composed for", "produced", "designed") mapped from Wikidata properties
- **FR-004**: System MUST enrich new creator nodes with Wikipedia/Wikidata biographical data where available (name, birthYear, wikipedia URL, wikidataId, thumbnail)
- **FR-005**: System MUST NOT overwrite or remove any existing creator node data or existing edges
- **FR-006**: System MUST NOT duplicate creator nodes — if a creator already exists, new game connections are added as edges only
- **FR-007**: System MUST produce a summary report showing: creators added, edges added, creators enriched from Wikipedia, creators without Wikipedia pages
- **FR-008**: System MUST add a data attribution file (ATTRIBUTION.md) documenting all external data sources: Wikipedia/Wikimedia Commons (CC BY-SA, biographical text and thumbnails), Wikidata (CC0, structured credit relationships), and IGDB (game cover art)
- **FR-009**: System MUST add visible attribution in the application UI footer crediting Wikipedia, Wikidata, and IGDB
- **FR-010**: System MUST pass the existing data validation script (validate-data.ps1) after enrichment
- **FR-011**: System MUST be idempotent — running the enrichment script multiple times produces identical output

### Key Entities

- **Creator**: A person who contributed to one or more Sega arcade games in a key creative role. Attributes: id, label, group ("creator"), role, birthYear (if known), wikipedia (if available), wikidataId (if available), thumbnail (if available)
- **Creator-Game Edge**: A relationship connecting a creator to a game. Attributes: from (creator id), to (game id), label (role description, e.g., "Director"), arrows ("to")
- **Data Source Attribution**: Documentation of external data sources, their URLs, license terms, and usage scope

## Success Criteria

### Measurable Outcomes

- **SC-001**: The graph contains at least 35 total creator nodes (up from 25), adding a minimum of 10 new creators
- **SC-002**: At least 55 game nodes have one or more creator connections (up from 49)
- **SC-003**: All new creator nodes have at least 1 verified Wikidata credit relationship to a game in the graph
- **SC-004**: Data attribution is visible to 100% of users who access the application
- **SC-005**: Zero regressions — all 25 existing creators and their edges remain intact after enrichment
- **SC-006**: The enrichment process completes without manual intervention

## Assumptions

- Wikidata SPARQL endpoint (https://query.wikidata.org/sparql) is accessible and provides structured credit relationships for Sega-published video games via properties P943 (game director), P57 (director), P86 (composer), P170 (creator), P162 (producer), P3080 (game designer)
- Wikidata labels use English romanizations that can be matched to existing creators via wikidataId (QID)
- An exclusion list of 11 non-game-creators (actors, film directors, musicians, Nintendo employees) filters out false positives from Wikidata results. Borderline cases (external composers for major Sega franchises) are included.
- Wikidata rate limits (1 req/s with User-Agent header) are manageable for the SPARQL queries needed
- Creator nodes without Wikipedia pages (Tier 3: ~8 of 20 new creators) will have minimal biographical data (name, birthYear, Wikidata description, wikidataId) but are still valuable for graph connectivity. Creators with Wikipedia pages (Tier 2: ~12 of 20) get full summaries and thumbnails via Wikipedia API.
- Constitution Principle VI requires amendment to v1.3.0 (structured data exception for Wikidata) before implementation can begin
