# Feature Specification: SEGA Studio Graph Visualization

**Feature Branch**: `001-sega-graph-visualization`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "Build an application that shows SEGA as a video game studio in a graph like victorianengineeringconnections.net. Objects: internal studios, arcade platforms, game titles, and creators. Click a node to see more info. Data sourced exclusively from Wikipedia. Only SEGA arcade platforms—no game consoles. HTML and JavaScript only (static hosting)."

## Clarifications

### Session 2026-02-09

- Q: Should game titles be limited to arcade games only, or include all notable SEGA games (including console-only titles)? → A: Arcade games only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Explore the SEGA Graph (Priority: P1)

A visitor opens the application and sees an interactive network
graph with SEGA at the center. Nodes represent internal studios,
arcade platforms, game titles, and creators. Edges show the
relationships between them (e.g., a studio developed a game, a
game runs on a platform, a creator worked at a studio). The
visitor can pan, zoom, and drag nodes to explore the network
freely.

**Why this priority**: Without the graph there is no product.
This is the core visual experience that everything else builds on.

**Independent Test**: Can be verified by opening the HTML file in
a browser and confirming that a graph renders with multiple node
types, edges, and basic pan/zoom/drag interactions.

**Acceptance Scenarios**:

1. **Given** a visitor opens the application, **When** the page
   loads, **Then** an interactive graph is displayed with SEGA as
   the central node and five visually distinct groups (company,
   studios, arcade platforms, games, creators) differentiated
   by color or shape.
2. **Given** the graph is displayed, **When** the visitor drags
   a node, **Then** the node repositions and connected edges
   follow smoothly.
3. **Given** the graph is displayed, **When** the visitor uses
   scroll or pinch gestures, **Then** the graph zooms in and out
   around the pointer position.
4. **Given** the graph is displayed, **When** the visitor clicks
   and drags on empty space, **Then** the entire graph pans in
   the drag direction.

---

### User Story 2 — View Node Details (Priority: P2)

A visitor clicks on any node in the graph and a detail panel
appears showing information sourced from Wikipedia about that
entity. The panel displays the entity name, a short summary, key
facts (e.g., founding year for a studio, release year for a
game), and a link to the full Wikipedia article. The visitor can
close the panel to return to exploring the graph.

**Why this priority**: Detail panels turn a pretty graph into an
informative tool. Without them, nodes are labels without context.

**Independent Test**: Can be verified by clicking any node and
confirming a panel appears with Wikipedia-sourced text, key facts,
and a Wikipedia link; then closing the panel.

**Acceptance Scenarios**:

1. **Given** the graph is displayed, **When** the visitor clicks
   on a studio node, **Then** a detail panel appears showing the
   studio name, a Wikipedia summary, founding year, notable
   information, and a link to the Wikipedia article.
2. **Given** the graph is displayed, **When** the visitor clicks
   on a game title node, **Then** a detail panel appears showing
   the game name, a Wikipedia summary, release year, genre, and
   a link to the Wikipedia article.
3. **Given** the graph is displayed, **When** the visitor clicks
   on an arcade platform node, **Then** a detail panel appears
   showing the platform name, a Wikipedia summary, release year,
   and a link to the Wikipedia article.
4. **Given** the graph is displayed, **When** the visitor clicks
   on a creator node, **Then** a detail panel appears showing the
   person's name, a Wikipedia summary, notable roles, and a link
   to the Wikipedia article.
5. **Given** a detail panel is open, **When** the visitor clicks
   a close button or clicks elsewhere on the graph, **Then** the
   detail panel closes.
6. **Given** Wikipedia lacks information for an entity, **When**
   the visitor clicks that node, **Then** the panel displays a
   clear message stating that no Wikipedia data is available, with
   no fabricated or inferred content.

---

### User Story 3 — Filter by Node Type (Priority: P3)

A visitor uses filter controls to show or hide specific node
categories (studios, arcade platforms, games, creators). This
helps the visitor focus on a particular aspect of the SEGA
ecosystem without visual clutter.

**Why this priority**: Filtering improves usability on a
potentially dense graph but is not essential for the core
experience.

**Independent Test**: Can be verified by toggling each filter
control and confirming the corresponding node category appears
or disappears from the graph while other categories remain
unchanged.

**Acceptance Scenarios**:

1. **Given** the graph is displayed with all node types visible,
   **When** the visitor deselects the "Games" filter, **Then**
   all game title nodes and their connected edges are hidden from
   the graph.
2. **Given** a filter has been deselected, **When** the visitor
   reselects that filter, **Then** the hidden nodes and edges
   reappear in their original positions.
3. **Given** multiple filters are deselected, **When** only one
   category remains visible, **Then** only that category's nodes
   and their mutual edges are shown.

---

### User Story 4 — Search for a Node (Priority: P4)

A visitor types a name into a search field and the graph
highlights and centers on the matching node, making it easy to
find specific studios, games, platforms, or creators in a large
graph.

**Why this priority**: Search is a quality-of-life improvement
for large graphs but is not blocking for the core experience.

**Independent Test**: Can be verified by typing a known entity
name, confirming the graph animates to center on the match, and
the matched node is visually highlighted.

**Acceptance Scenarios**:

1. **Given** the search field is available, **When** the visitor
   types a partial or full entity name, **Then** a list of
   matching suggestions appears.
2. **Given** matching suggestions are shown, **When** the visitor
   selects a suggestion, **Then** the graph smoothly pans and
   zooms to center the matching node, and the node is visually
   highlighted.
3. **Given** the visitor types a name with no matches, **When**
   the search completes, **Then** a message indicates no results
   were found.

---

### Edge Cases

- What happens when two nodes share the same display name?
  The system distinguishes them by appending the node type in
  parentheses (e.g., "Sonic Team (Studio)" vs "Sonic Team
  (Game)").
- What happens when the graph contains hundreds of nodes and
  performance degrades? The initial data set is curated to a
  manageable scope; if future expansion exceeds rendering
  performance, node clustering or level-of-detail reduction
  should be considered.
- What happens when a Wikipedia article is unavailable or its
  structure changes? The detail panel displays a fallback message
  indicating data is unavailable and provides a direct search
  link to Wikipedia.
- What happens on a small mobile screen? The graph remains
  functional with touch gestures (pinch-to-zoom, drag-to-pan)
  and the detail panel adapts to available screen width.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST render an interactive network
  graph with SEGA as the central node.
- **FR-002**: The graph MUST display five visual groups: the
  SEGA root company node, internal studios, arcade platforms
  (no game consoles), arcade game titles only (no
  console-exclusive games), and creators (people). Four of
  these groups (studios, platforms, games, creators) are
  user-filterable categories.
- **FR-003**: Each node category MUST be visually distinguishable
  by color, shape, or icon.
- **FR-004**: Edges MUST represent typed relationships between
  nodes (e.g., "developed by," "runs on," "created by," "part
  of").
- **FR-005**: Users MUST be able to pan, zoom, and drag nodes to
  navigate the graph.
- **FR-006**: Clicking a node MUST open a detail panel showing
  Wikipedia-sourced information including entity name, summary,
  key facts, and a link to the Wikipedia article.
- **FR-007**: The detail panel MUST be closeable by the user.
- **FR-008**: All factual content displayed in detail panels MUST
  be sourced exclusively from Wikipedia (Constitution Principle VI).
- **FR-009**: When Wikipedia data is unavailable for an entity,
  the system MUST display a clear "no data available" message
  rather than fabricated content. Note: the data compilation
  pipeline (build time) enforces non-empty summaries via JSON
  Schema; this requirement serves as a runtime defense in case
  the application is extended with dynamically sourced nodes in
  the future.
- **FR-010**: Users MUST be able to filter the graph by node
  category (show/hide studios, platforms, games, creators).
- **FR-011**: Users MUST be able to search for a specific entity
  by name and have the graph navigate to the matching node.
- **FR-012**: The application MUST consist entirely of static
  files (HTML, CSS, JavaScript) requiring no server-side
  processing, suitable for static hosting.
- **FR-013**: The application MUST only include SEGA arcade
  platforms and arcade game titles; home game consoles and
  console-exclusive games MUST be excluded.
- **FR-014**: Edge labels or tooltips MUST describe the
  relationship type between connected nodes.
- **FR-015**: The application MUST display visible attribution
  for Wikipedia content (CC-BY-SA 3.0) and Wikidata (CC0),
  including a link to the applicable license, in compliance
  with the source data licensing terms.

### Key Entities

- **SEGA (Company)**: The root entity. Parent company of all
  studios. Key attributes: name, founding year, headquarters,
  Wikipedia summary.
- **Internal Studio**: A development division or subsidiary of
  SEGA (e.g., Sonic Team, AM2, Ryu Ga Gotoku Studio). Key
  attributes: name, founding year, notable focus areas, status
  (active/defunct).
- **Arcade Platform**: A SEGA arcade system board or hardware
  platform (e.g., Model 2, NAOMI, System 16). Excludes home
  consoles (Genesis, Saturn, Dreamcast, etc.). Key attributes:
  name, release year, generation, notable features.
- **Game Title**: An arcade video game developed or published
  by SEGA or its studios (e.g., Virtua Fighter, OutRun, Daytona
  USA). Only games released on SEGA arcade platforms are
  included; console-exclusive titles are excluded. Key
  attributes: name, release year, genre, arcade platform(s).
- **Creator (Person)**: A notable individual associated with
  SEGA (e.g., Yu Suzuki, Toshihiro Nagoshi, Yuji Naka). Key
  attributes: name, birth year, notable roles/titles, studios
  worked at.

### Relationships

- Studio → SEGA: "division of"
- Game → Studio: "developed by"
- Game → Arcade Platform: "runs on"
- Creator → Studio: "worked at"
- Creator → Game: "created / directed / produced"

## Assumptions

- The data set will be pre-compiled from Wikipedia at build time
  rather than fetched live from the Wikipedia API at runtime.
  This aligns with the static hosting requirement and avoids
  cross-origin or rate-limiting issues.
- The initial scope covers a curated set of the most notable SEGA
  arcade entities (roughly 10–15 studios, 10–20 arcade platforms,
  30–50 arcade games, and 20–30 creators) rather than an
  exhaustive catalogue. Game titles are limited to those released
  on SEGA arcade platforms; console-exclusive titles are excluded.
- The graph layout algorithm (force-directed or similar) runs
  client-side in the browser.
- "Arcade platforms" includes arcade system boards (e.g., NAOMI,
  Model 2, System 16) and dedicated arcade cabinets, but
  explicitly excludes home consoles (Genesis/Mega Drive, Saturn,
  Dreamcast, Game Gear, Master System, etc.).
- The reference site (victorianengineeringconnections.net) uses a
  force-directed graph with click-to-reveal detail; the SEGA
  application will follow this same interaction paradigm.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The graph loads and becomes interactive within 3
  seconds on a standard broadband connection.
- **SC-002**: 100% of nodes in the graph display a detail panel
  when clicked, with Wikipedia-sourced content or an explicit
  "no data available" message.
- **SC-003**: A first-time visitor can identify at least three
  relationships (edges) between SEGA entities within 30 seconds
  of viewing the graph.
- **SC-004**: Filtering by any single node category updates the
  graph within 0.5 seconds with no page reload.
- **SC-005**: The application runs as a set of static files
  deployable to any static hosting provider with zero server-side
  configuration.
- **SC-006**: The graph remains responsive (pan, zoom, drag) with
  up to 200 nodes rendered simultaneously.
- **SC-007**: Every detail panel includes a working hyperlink to
  the source Wikipedia article.
